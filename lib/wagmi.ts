import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  bsc,
  zora,
  blast,
  degen,
  sanko,
  apeChain,
  abstract,
  sepolia,
} from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: "Gaslite Drop",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_API_KEY as string,
  chains: [
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    bsc,
    zora,
    blast,
    degen,
    sanko,
    apeChain,
    abstract,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  ssr: true,
});
