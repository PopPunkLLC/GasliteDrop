import { keyBy, values, zipObject } from "lodash";
import { Network, Alchemy } from "alchemy-sdk";
import {
  sepolia,
  optimism,
  mainnet,
  arbitrum,
  polygon,
  base,
  bsc,
} from "@wagmi/chains";

const chainIdToAlchemySettings = {
  [mainnet.id]: {
    apiKey: process.env.MAINNET_ALCHEMY_KEY,
    network: Network.ETH_MAINNET,
  },
  [sepolia.id]: {
    apiKey: process.env.SEPOLIA_ALCHEMY_KEY,
    network: Network.ETH_SEPOLIA,
  },
  [optimism.id]: {
    apiKey: process.env.OPTIMISM_ALCHEMY_KEY,
    network: Network.OPT_MAINNET,
  },
  [arbitrum.id]: {
    apiKey: process.env.ARBITRUM_ALCHEMY_KEY,
    network: Network.ARB_MAINNET,
  },
  [polygon.id]: {
    apiKey: process.env.POLYGON_ALCHEMY_KEY,
    network: Network.MATIC_MAINNET,
  },
  [base.id]: {
    apiKey: process.env.BASE_ALCHEMY_KEY,
    network: Network.BASE_MAINNET,
  },
};

const ownership = async (req, res) => {
  try {
    const { contractAddress, chainId = 1 } = req?.query;
    const settings = chainIdToAlchemySettings[chainId];

    if (!settings) {
      throw new Error(`No settings found for ${chainId}`);
    }

    const alchemy = new Alchemy(settings);
    const { owners } = await alchemy.nft.getOwnersForContract(contractAddress);
    return res.json({
      addresses: owners.reduce((acc, owner) => {
        acc[owner?.toLowerCase()] = true;
        return acc;
      }, {}),
      totalCount: owners?.length || 0,
    });
  } catch (e) {
    return res.status(500).json({
      error:
        e?.status === 429
          ? "Too many requests. Please wait 15 minutes before trying again!"
          : "Internal server error",
      addresses: {},
      totalCount: 0,
    });
  }
};

const handler = async (req, res) => {
  const { method } = req;
  switch (method) {
    case "GET":
      await ownership(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "OPTIONS"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
