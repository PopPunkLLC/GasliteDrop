import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useNetwork } from "wagmi";
import {
  mainnet,
  arbitrum,
  polygon,
  optimism,
  sepolia,
  // bsc,
  base,
} from "@wagmi/chains";
import { blast } from "@/lib/chains/blast";
import { degen } from "@/lib/chains/degen";
import { airdropContractAddress } from "@/lib/contracts";
import { baseSepolia } from "viem/chains";

export default function Navbar() {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  const chainName = chain?.name?.toUpperCase().replace(" ", "_") ?? "ETHEREUM";

  const getBlockExplorer = (chainName: string) => {
    const chainId = chain?.id || "1";
    const explorers: any = {
      ETHEREUM: `${mainnet.blockExplorers.etherscan.url}/address/${airdropContractAddress?.[chainId]}`,
      ARBITRUM: `${arbitrum.blockExplorers.etherscan.url}/address/${airdropContractAddress?.[chainId]}`,
      MATIC: `${polygon.blockExplorers.etherscan.url}/address/${airdropContractAddress?.[chainId]}`,
      OPTIMISM: `${optimism.blockExplorers.etherscan.url}/address/${airdropContractAddress?.[chainId]}`,
      SEPOLIA: `${sepolia.blockExplorers.etherscan.url}/address/${airdropContractAddress?.[chainId]}`,
      // BSC: `${bsc.blockExplorers.etherscan.url}/address/${airdropContractAddress?.[chainId]}`,
      BASE: `${base.blockExplorers.etherscan.url}/address/${airdropContractAddress?.[chainId]}`,
      BASE_SEPOLIA: `https://sepolia.basescan.org/address/${airdropContractAddress?.[chainId]}`,
      BLAST: `${blast.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
      DEGEN: `${degen.blockExplorers.default.url}/address/${airdropContractAddress?.[chainId]}`,
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
