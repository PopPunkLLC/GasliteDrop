import { defineChain } from "viem";

export const sanko = defineChain({
  network: "Sanko",
  id: 1996,
  name: "Sanko",
  nativeCurrency: {
    decimals: 18,
    name: "DMT",
    symbol: "DMT",
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.sanko.xyz"],
      webSocket: ["wss://mainnet.sanko.xyz/ws"],
    },
    public: {
      http: ["https://mainnet.sanko.xyz"],
      webSocket: ["wss://mainnet.sanko.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Sanko Explorer",
      url: "https://explorer.sanko.xyz",
    },
  },
  iconUrl: "https://sanko.xyz/assets/sanko-world.png",
});
