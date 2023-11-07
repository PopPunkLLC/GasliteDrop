import { Client } from "twitter-api-sdk";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const tweet = async (req, res) => {
  try {
    const { id } = req?.query;

    const twitterClient = new Client(process.env.BEARER_TOKEN);

    const { data } = await twitterClient.tweets.tweetsRecentSearch({
      query: `conversation_id:${id} is:reply`,
    });

    const addresses = data
      ?.map((result) => {
        const [address] = result?.text?.match(ADDRESS_REGEX) || [];
        return address;
      })
      .filter(Boolean);

    return res.json({
      addresses,
    });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ error: "Internal server error" });
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
