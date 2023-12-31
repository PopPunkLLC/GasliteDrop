import { defineChain } from "viem";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "@wagmi/chains";

export const baseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://sepolia.base.org"] },
  },
  blockExplorers: {
    default: { name: "Basescan", url: "https://sepolia.basescan.org" },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1059647,
    },
  },
});

export const airdropContractAddress = {
  [mainnet.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [sepolia.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [arbitrum.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [optimism.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [polygon.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [base.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
  [baseSepolia.id]: "0xf6c3555139aeA30f4a2be73EBC46ba64BAB8ac12",
};

export const airdrop1155ContractAddress = {
  [mainnet.id]: "0x1571b5Cf5D1a1140AD336FF5351d2D050c03CaB8",
  [sepolia.id]: "0x1571b5Cf5D1a1140AD336FF5351d2D050c03CaB8",
  [arbitrum.id]: "0x1571b5Cf5D1a1140AD336FF5351d2D050c03CaB8",
  [optimism.id]: "0x1571b5Cf5D1a1140AD336FF5351d2D050c03CaB8",
  [polygon.id]: "0x1571b5Cf5D1a1140AD336FF5351d2D050c03CaB8",
  [base.id]: "0x1571b5Cf5D1a1140AD336FF5351d2D050c03CaB8",
  [baseSepolia.id]: "0x09350F89e2D7B6e96bA730783c2d76137B045FEF",
};
