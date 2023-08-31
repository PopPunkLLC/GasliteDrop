import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork } from 'wagmi';
import {
  mainnet,
  arbitrum,
  polygon,
  optimism,
  sepolia,
  // bsc,
  base,
} from '@wagmi/chains';
import { airdropContractAddress } from '../airdropContractAddress';

export default function Navbar() {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  const chainName = chain?.name?.toUpperCase().replace(' ', '_') ?? 'ETHEREUM';

  const getBlockExplorer = (chainName: string) => {
    const explorers: any = {
      ETHEREUM: `${mainnet.blockExplorers.etherscan.url}/address/${airdropContractAddress}`,
      ARBITRUM: `${arbitrum.blockExplorers.etherscan.url}/address/${airdropContractAddress}`,
      MATIC: `${polygon.blockExplorers.etherscan.url}/address/${airdropContractAddress}`,
      OPTIMISM: `${optimism.blockExplorers.etherscan.url}/address/${airdropContractAddress}`,
      SEPOLIA: `${sepolia.blockExplorers.etherscan.url}/address/${airdropContractAddress}`,
      // BSC: `${bsc.blockExplorers.etherscan.url}/address/${airdropContractAddress}`,
      BASE: `${base.blockExplorers.etherscan.url}/address/${airdropContractAddress}`,
    };

    return explorers[chainName];
  };

  const getContractReaderURL = (chainName: string) => {
    const base = 'https://contractreader.io/contract';

    const explorers: any = {
      ETHEREUM: `${base}/mainnet/${airdropContractAddress}`,
      ARBITRUM: `${base}/arbitrum/${airdropContractAddress}`,
      MATIC: `${base}/polygon/${airdropContractAddress}`,
      OPTIMISM: `${base}/optimism/${airdropContractAddress}`,
      SEPOLIA: `${base}/sepolia/${airdropContractAddress}`,
      // BSC: `${base}/bsc/${airdropContractAddress}`,
      BASE: `${base}/base/${airdropContractAddress}`,
    };

    return explorers[chainName];
  };

  const explorerURL = `${getBlockExplorer(chainName)}`;
  const contractReaderURL = `${getContractReaderURL(chainName)}`;

  const size = '20';

  return (
    <div className="flex flex-row justify-between w-9/12 mx-auto mb-4 mt-[4px]">
      <div /> {/* For spacing */}
      <div className="flex flex-row items-center mt-4">
        <Link
          href={contractReaderURL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block"
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
          className="hidden md:block"
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
      </div>
    </div>
  );
}
