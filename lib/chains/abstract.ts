import { defineChain } from "viem";

export const abstract = defineChain({
  network: "Abstract",
  id: 2741,
  name: "Abstract",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://api.mainnet.abs.xyz"],
    },
    public: {
      http: ["https://api.mainnet.abs.xyz"]
    },
  },
  blockExplorers: {
    default: {
      name: "Abscan",
      url: "https://abscan.org",
    },
  },
  iconUrl: "https://abstract-assets.abs.xyz/icons/light.png",
});
