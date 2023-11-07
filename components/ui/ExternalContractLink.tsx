import React from "react";
import { FaExternalLinkAlt as ExternalLinkIcon } from "react-icons/fa";
import { shortenAddress } from "@/components/utils";

const deriveExternalLink = (tokenAddress, chainId) => {
  switch (chainId) {
    default:
      return `https://etherscan.io/address/${tokenAddress}`;
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
