import { defineChain } from "viem";

export const degen = defineChain({
  network: "Degen",
  id: 666666666,
  name: "Degen",
  nativeCurrency: {
    decimals: 18,
    name: "Degen",
    symbol: "Degen",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.degen.tips"],
    },
    public: {
      http: ["https://rpc.degen.tips"]
    },
  },
  blockExplorers: {
    default: {
      name: "Degen Chain Explorer",
      url: "https://explorer.degen.tips/",
    },
  },
  iconUrl: "https://explorer.degen.tips/assets/network_icon_dark.svg",
});
