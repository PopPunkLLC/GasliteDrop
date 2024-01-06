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
import { airdropContractAddress } from "@/lib/contracts";
import { baseSepolia } from "viem/chains";

export default function Navbar() {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  const chainName = chain?.name?.toUpperCase().replace(" ", "_") ?? "ETHEREUM";

  const getBlockExplorer = (chainName: string) => {
    const explorers: any = {
      ETHEREUM: `${mainnet.blockExplorers.etherscan.url}/address/${
        airdropContractAddress?.[chain?.id]
      }`,
      ARBITRUM: `${arbitrum.blockExplorers.etherscan.url}/address/${
        airdropContractAddress?.[chain?.id]
      }`,
      MATIC: `${polygon.blockExplorers.etherscan.url}/address/${
        airdropContractAddress?.[chain?.id]
      }`,
      OPTIMISM: `${optimism.blockExplorers.etherscan.url}/address/${
        airdropContractAddress?.[chain?.id]
      }`,
      SEPOLIA: `${sepolia.blockExplorers.etherscan.url}/address/${
        airdropContractAddress?.[chain?.id]
      }`,
      // BSC: `${bsc.blockExplorers.etherscan.url}/address/${airdropContractAddress?.[chain?.id]}`,
      BASE: `${base.blockExplorers.etherscan.url}/address/${
        airdropContractAddress?.[chain?.id]
      }`,
      BASE_SEPOLIA: `${baseSepolia.blockExplorers.default.url}/address/${
        airdropContractAddress?.[chain?.id]
      }`,
    };

    return explorers[chainName];
  };

  const getContractReaderURL = (chainName: string) => {
    const base = "https://contractreader.io/contract";

    const explorers: any = {
      ETHEREUM: `${base}/mainnet/${airdropContractAddress?.[chain?.id]}`,
      ARBITRUM: `${base}/arbitrum/${airdropContractAddress?.[chain?.id]}`,
      MATIC: `${base}/polygon/${airdropContractAddress?.[chain?.id]}`,
      OPTIMISM: `${base}/optimism/${airdropContractAddress?.[chain?.id]}`,
      SEPOLIA: `${base}/sepolia/${airdropContractAddress?.[chain?.id]}`,
      // BSC: `${base}/bsc/${airdropContractAddress?.[chain?.id]}`,
      BASE: `${base}/base/${airdropContractAddress?.[chain?.id]}`,
      BASE_SEPOLIA: `${base}/base/${airdropContractAddress?.[chain?.id]}`,
    };

    return explorers[chainName];
  };

  const explorerURL = `${getBlockExplorer(chainName)}`;
  const contractReaderURL = `${getContractReaderURL(chainName)}`;

  const size = "20";

  return (
    <header className="flex flex-row min-h-[80px] items-center justify-center w-full mx-auto mb-4 mt-[4px] space-x-2">
      {/* TODO: add dropdown to show both contract addresses */}
      <Link
        href={contractReaderURL}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:block flex-shrink-0"
      >
        <Image
          src={`/contractreader-logo.svg`}
          alt="ContractReader.io Logo"
          className="w-7 h-7 mr-4"
          width={size}
          height={size}
        />
      </Link>

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
