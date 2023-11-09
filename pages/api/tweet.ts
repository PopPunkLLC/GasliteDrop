import { Client } from "twitter-api-sdk";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { uniq } from "@/components/utils";
import { keyBy, values, zipObject } from "lodash";

const ADDRESS_REGEX = /(0x){1}[0-9a-fA-F]{40}/;
const ENS_REGEX =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.eth\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/;

const fetchTweetById = async (client: Client, tweetId) =>
  client.tweets.findTweetById(tweetId, {
    expansions: ["author_id"],
    "tweet.fields": ["conversation_id", "public_metrics"],
    "user.fields": [
      "created_at",
      "description",
      "name",
      "username",
      "profile_image_url",
    ],
  });

const fetchAllConversationTweets = async (client: Client, tweetId) => {
  let allTweets = [];

  let { data, meta, includes } = await client.tweets.tweetsRecentSearch({
    query: `conversation_id:${tweetId} is:reply`,
    expansions: ["author_id"],
    "user.fields": ["username", "profile_image_url"],
  });

  let userLookup = keyBy(includes?.users, "id");

  let nextToken = meta?.next_token;

  while (nextToken) {
    ({ data, meta, includes } = await client.tweets.tweetsRecentSearch({
      query: `conversation_id:${tweetId} is:reply`,
      expansions: ["author_id"],
      "user.fields": ["username", "profile_image_url"],
      pagination_token: nextToken,
    }));

    userLookup = {
      ...userLookup,
      ...keyBy(includes?.users, "id"),
    };

    allTweets = allTweets.concat(data);

    if (meta?.next_token !== nextToken) {
      nextToken = meta?.next_token;
    } else {
      nextToken = null;
    }
  }
  // Get single unique tweet
  return {
    users: userLookup,
    tweets: values(keyBy(allTweets, "author_id")),
  };
};

const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.MAINNET_PROVIDER_URL),
});

const extractUniqueAddresses = async (tweets) => {
  const addresses = tweets
    .map((result) => {
      const [ens] = result?.text?.match(ENS_REGEX) || [];
      const [addr] = result?.text?.toLowerCase()?.match(ADDRESS_REGEX) || [];
      return {
        ens,
        addr,
        context: result,
      };
    })
    .filter((item) => !item?.ens || !item?.addr);

  const rawAddresses = addresses
    .filter((item) => item.addr)
    .map(({ addr }) => addr);

  const ensAddresses = addresses
    .filter((item) => item.ens && item.ens.indexOf("t.co/") === -1) // Remove null && twitter shortlinks
    .map(({ ens }) => ens);

  const resolvedAddresses = await Promise.all(
    ensAddresses.map((ens) =>
      client.getEnsAddress({
        name: normalize(ens),
      })
    )
  );

  const ensLookup = zipObject(ensAddresses, resolvedAddresses);

  return {
    matches: addresses.map((address) => ({
      ...address,
      ...(address.ens && ensLookup?.[address.ens]
        ? { addr: ensLookup?.[address.ens] }
        : {}),
    })),
    addresses: uniq([...rawAddresses, ...resolvedAddresses].filter(Boolean)),
  };
};

const tweet = async (req, res) => {
  try {
    const { id } = req?.query;
    const twitterClient = new Client(process.env.BEARER_TOKEN);
    const tweet = await fetchTweetById(twitterClient, id);
    const { users, tweets } = await fetchAllConversationTweets(
      twitterClient,
      id
    );
    const { matches, addresses } = await extractUniqueAddresses(tweets);
    return res.json({
      tweet: {
        ...tweet?.data,
        ...(tweet?.includes?.users
          ? { user: tweet?.includes?.users?.[0] }
          : {}),
      },
      addresses,
      summary: matches
        .map(({ addr, ens, context }) => ({
          user: users[context?.author_id] || null,
          addr: addr,
          ens,
        }))
        .filter(({ addr }) => !!addr),
      tweetCount: tweets?.length,
    });
  } catch (e) {
    return res.status(500).json({
      error:
        e?.status === 429
          ? "Too many requests. Please wait 15 minutes before trying again!"
          : "Internal server error",
      addresses: [],
    });
  }
};

const handler = async (req, res) => {
  const { method } = req;
  switch (method) {
    case "GET":
      await tweet(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "OPTIONS"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
