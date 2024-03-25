import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import {
  sepolia,
  optimism,
  mainnet,
  arbitrum,
  polygon,
  bsc,
  base,
  zora,
} from "@wagmi/chains";
import { configureChains, createConfig, WebSocketPublicClient } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { baseSepolia } from "viem/chains";
import { blast } from "@/lib/chains/blast";

// NOTE: On the providers, there are some issues with Sepolia currently and Wagmi.
// The setup below will work. Adding an Alchemy provider, for example, will break things
// Issue: https://github.com/wagmi-dev/wagmi/issues/2219#issuecomment-1520882923
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    sepolia,
    arbitrum,
    optimism,
    polygon,
    base,
    bsc,
    sepolia,
    baseSepolia,
    blast,
    zora,
  ],
  [
    publicProvider(),
    jsonRpcProvider({
      rpc: () => ({
        http: process.env.NEXT_PUBLIC_SEPOLIA_API!,
        webSocket: process.env.NEXT_PUBLIC_SEPOLIA_WEBSOCKET!,
      }),
    }),
    jsonRpcProvider({
      rpc: () => ({
        http: process.env.NEXT_PUBLIC_QUICKNODE_API!,
      }),
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Gaslite Drop",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_API_KEY as string,
  chains,
});

export const client = createConfig({
  autoConnect: false,
  connectors,
  webSocketPublicClient,
  publicClient,
});

export { chains };
