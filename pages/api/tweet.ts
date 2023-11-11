import { Client } from "twitter-api-sdk";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { uniq, keyBy, values, zipObject } from "lodash";
import { kv } from "@vercel/kv";

const ADDRESS_REGEX = /(0x){1}[0-9a-fA-F]{40}/;
const ENS_REGEX =
  /[-a-zA-Z0-9@:%._\+~#=$]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/;

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
    "user.fields": [
      "location",
      "username",
      "profile_image_url",
      "public_metrics",
      "verified",
      "created_at",
      "description",
    ],
  });

  let userLookup = keyBy(includes?.users, "id");

  let nextToken = meta?.next_token;

  while (nextToken) {
    ({ data, meta, includes } = await client.tweets.tweetsRecentSearch({
      query: `conversation_id:${tweetId} is:reply`,
      expansions: ["author_id"],
      "user.fields": [
        "location",
        "username",
        "profile_image_url",
        "public_metrics",
        "verified",
        "created_at",
        "description",
      ],
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

const extractUniqueAddresses = async (tweets, users) => {
  const addresses = tweets
    .map((result) => {
      let [ens] = result?.text?.match(ENS_REGEX) || [];

      const [addr] = result?.text?.toLowerCase()?.match(ADDRESS_REGEX) || [];
      const user = users[result?.author_id];

      // Check username for ens
      if (user && !ens && !addr) {
        [ens] = user?.name?.match(ENS_REGEX) || [];
      }

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

  console.log({
    ensAddresses,
  });

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

    // Check cache
    const cacheKey = `tweet:${id}`;

    const data = await kv.get(cacheKey);

    try {
      if (data) {
        return res.json(data);
      }
    } catch (e) {
      console.error(e);
      console.log("Error parsing cache into json");
    }

    console.log("No cache found for", id);

    const tweet = await fetchTweetById(twitterClient, id);

    const { users, tweets } = await fetchAllConversationTweets(
      twitterClient,
      id
    );

    const { matches } = await extractUniqueAddresses(tweets, users);

    const dupeLookup = {};
    const dupes = [];

    const summary = matches.reduce((acc, { addr, ens, context }) => {
      if (!addr) return acc;

      if (!dupeLookup[addr]) {
        acc.push({
          user: users[context?.author_id] || null,
          addr: addr,
          ens,
        });
        dupeLookup[addr] = true;
      } else {
        dupes.push({
          user: users[context?.author_id] || null,
          addr: addr,
          ens,
        });
      }
      return acc;
    }, []);

    const cacheable = {
      tweet: {
        ...tweet?.data,
        ...(tweet?.includes?.users
          ? { user: tweet?.includes?.users?.[0] }
          : {}),
      },
      addresses: summary.map(({ addr }) => addr),
      summary,
      tweetCount: tweets?.length,
      dupes,
    };

    // Cache for 900 seconds, ~15 minutes
    await kv.set(cacheKey, JSON.stringify(cacheable), {
      ex: 900,
      nx: true,
    });

    return res.json(cacheable);
  } catch (e) {
    console.error(e);
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
