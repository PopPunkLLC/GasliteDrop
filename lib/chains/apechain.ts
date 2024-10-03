import { defineChain } from "viem";

export const apechain = defineChain({
  network: "Apechain",
  id: 33139,
  name: "Apechain",
  nativeCurrency: {
    decimals: 18,
    name: "Ape",
    symbol: "APE",
  },
  rpcUrls: {
    default: {
      http: ["https://apechain.calderachain.xyz/http"],
    },
    public: {
      http: ["https://apechain.calderachain.xyz/http"]
    },
  },
  blockExplorers: {
    default: {
      name: "Apescan",
      url: "https://apescan.io/",
    },
  },
  iconUrl: "https://apescan.io/assets/ape/images/svg/logos/token-dim.svg?v=24.9.2.0",
});
