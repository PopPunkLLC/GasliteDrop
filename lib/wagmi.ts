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
import { abstractWallet } from "@abstract-foundation/agw-react/connectors";
import {
  connectorsForWallets,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import { createConfig } from "wagmi";
import { createClient, http } from "viem";
import { eip712WalletActions } from "viem/zksync";

export const chains = [
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
];

const defaultWallets = getDefaultWallets();

console.log(JSON.stringify(defaultWallets, null, 2));

export const config = createConfig({
  chains,
  connectors: connectorsForWallets(
    [
      ...defaultWallets.wallets,
      {
        groupName: "Abstract",
        wallets: [abstractWallet],
      },
    ],
    {
      appName: "Gaslite Drop",
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_API_KEY as string,
      appDescription:
        "The most efficient airdrop tool. Create and Deploy ERC20 Bytecode. Bulk transfer ERC20s, ERC721s, ERC1155s across many chains.",
    },
  ),
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    }).extend(eip712WalletActions());
  },
});
