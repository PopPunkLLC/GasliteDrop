import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  mainnet,
  arbitrum,
  polygon,
  optimism,
  sepolia,
  // bsc,
  base,
  baseSepolia,
  blast,
  degen,
  sanko,
  apeChain,
  abstract,
} from "viem/chains";

import { airdropContractAddress } from "@/lib/contracts";

export default function Navbar() {
  const { isConnected, chain } = useAccount();

  const chainName = chain?.name?.toUpperCase().replace(" ", "_") ?? "ETHEREUM";

  const getBlockExplorer = (chainName: string) => {
    const chainId = chain?.id || "1";

    const explorers: any = {
      ETHEREUM: `${mainnet.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      ARBITRUM: `${arbitrum.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      MATIC: `${polygon.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      OPTIMISM: `${optimism.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      SEPOLIA: `${sepolia.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      // BSC: `${bsc.blockExplorers.etherscan.url}/address/${airdropContractAddress?.[chainId]}`,
      BASE: `${base.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      BASE_SEPOLIA: `${baseSepolia.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      BLAST: `${blast.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      DEGEN: `${degen.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      SANKO: `${sanko.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      apeChain: `${apeChain.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      ABSTRACT: `${abstract.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
    };

    return explorers[chainName];
  };

  const explorerURL = `${getBlockExplorer(chainName)}`;

  const size = "20";

  return (
    <header className="flex flex-row min-h-[80px] items-center justify-center w-full mx-auto mb-4 mt-[4px] space-x-2">
      {/* TODO: add dropdown to show both contract addresses */}

      <Link
        href={explorerURL}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:block flex-shrink-0"
      >
        <Image
          src={`/etherscan-logo.svg`}
          alt="Etherscan Logo"
          className="w-7 h-7 mr-4"
          width={size}
          height={size}
        />
      </Link>
      {isConnected && <ConnectButton label="Connect Your Wallet" />}
    </header>
  );
}
