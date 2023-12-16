import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const DisconnectedView = () => {
  return (
    <div className="bg-transparent tracking-wider mx-auto -mt-10">
      <div className="mb-8 leading-[50px] md:leading-[70px] text-black font-black text-center md:text-left text-3xl md:text-[56px]">
        Airdrop ETH, ERC-20, ERC-721, and ERC-1155 tokens to your community
      </div>

      <div className="flex flex-row justify-center mt-12 text-xl">
        <ConnectButton label="Connect Your Wallet to Begin" />
      </div>

      <div className="md:hidden border px-4 py-2 border-grey rounded-md text mt-8">
        ⚠️ Gaslite Drop is best used on your desktop or laptop
      </div>
    </div>
  );
};

export default DisconnectedView;
