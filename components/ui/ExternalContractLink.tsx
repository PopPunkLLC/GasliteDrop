import React from "react";
import { FaExternalLinkAlt as ExternalLinkIcon } from "react-icons/fa";
import { shortenAddress } from "@/components/utils";
import {
  sepolia,
  optimism,
  arbitrum,
  polygon,
  base,
  bsc,
  zora,
  baseSepolia,
  blast,
  degen,
  sanko,
  apeChain,
  abstract,
  mainnet,
} from "viem/chains";

const deriveExternalLink = (tokenAddress, chainId) => {
  switch (chainId) {
    case sepolia.id:
      return `${sepolia.blockExplorers.default.url}/address/${tokenAddress}`;
    case optimism.id:
      return `${optimism.blockExplorers.default.url}/address/${tokenAddress}`;
    case arbitrum.id:
      return `${arbitrum.blockExplorers.default.url}/address/${tokenAddress}`;
    case polygon.id:
      return `${polygon.blockExplorers.default.url}/address/${tokenAddress}`;
    case base.id:
      return `${base.blockExplorers.default.url}/address/${tokenAddress}`;
    case baseSepolia.id:
      return `${baseSepolia.blockExplorers.default.url}/address/${tokenAddress}`;
    case bsc.id:
      return `${bsc.blockExplorers.default.url}/address/${tokenAddress}`;
    case zora.id:
      return `${zora.blockExplorers.default.url}/address/${tokenAddress}`;
    case blast.id:
      return `${blast.blockExplorers.default.url}/address/${tokenAddress}`;
    case degen.id:
      return `${degen.blockExplorers.default.url}/address/${tokenAddress}`;
    case sanko.id:
      return `${sanko.blockExplorers.default.url}/address/${tokenAddress}`;
    case apeChain.id:
      return `${apeChain.blockExplorers.default.url}/address/${tokenAddress}`;
    case abstract.id:
      return `${abstract.blockExplorers.default.url}/address/${tokenAddress}`;
    default:
      return `${mainnet.blockExplorers.default.url}/address/${tokenAddress}`;
  }
};

const ExternalContractLink = ({ address, chainId }) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <a
        href={deriveExternalLink(address, chainId)}
        target="_blank"
        rel="noreferrer"
        className="flex flex-row items-center space-x-2 hover:underline text-primary"
      >
        <span className="hidden md:flex text-xl">{address}</span>
        <span className="flex md:hidden text-xl">
          {shortenAddress(address)}
        </span>
        <ExternalLinkIcon className="text-sm" />
      </a>
    </div>
  );
};

export default ExternalContractLink;
