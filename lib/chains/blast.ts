import { defineChain } from "viem";

export const blast = defineChain({
    network: "Blast",
    id: 81457,
    name: "Blast",
    nativeCurrency: {
      decimals: 18,
      name: "Blast ETH",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.blast.io'],
        webSocket: ['wss://rpc.blast.io'],
      },
      public: {
        http: ['https://rpc.blast.io'],
        webSocket: ['wss://mainnet.blast.io'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Blast Explorer',
        url: 'https://blastscan.io',
      },
    },
    iconUrl: "https://blast.io/icons/blast-color.svg"
  });