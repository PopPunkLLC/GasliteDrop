import { Client } from "twitter-api-sdk";
import { uniq } from "@/components/utils";

const ADDRESS_REGEX = /(0x[a-fA-F0-9]{40})/;

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
  let { data, meta } = await client.tweets.tweetsRecentSearch({
    query: `conversation_id:${tweetId} is:reply`,
  });
  let nextToken = meta?.next_token;
  while (nextToken) {
    ({ data, meta } = await client.tweets.tweetsRecentSearch({
      query: `conversation_id:${tweetId} is:reply`,
      pagination_token: nextToken,
    }));
    allTweets = allTweets.concat(data);
    if (meta?.next_token !== nextToken) {
      nextToken = meta?.next_token;
    } else {
      nextToken = null;
    }
  }
  return allTweets;
};

const extractUniqueAddresses = (addresses) =>
  uniq(
    addresses
      .map((result) => {
        const [addr] = result?.text?.toLowerCase()?.match(ADDRESS_REGEX) || [];
        return addr;
      })
      .filter(Boolean)
  );

const tweet = async (req, res) => {
  try {
    const { id } = req?.query;
    const twitterClient = new Client(process.env.BEARER_TOKEN);
    const tweet = await fetchTweetById(twitterClient, id);
    const allTweets = await fetchAllConversationTweets(twitterClient, id);
    return res.json({
      tweet: {
        ...tweet?.data,
        ...(tweet?.includes?.users
          ? { user: tweet?.includes?.users?.[0] }
          : {}),
      },
      addresses: extractUniqueAddresses(allTweets),
      tweetCount: allTweets?.length,
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
