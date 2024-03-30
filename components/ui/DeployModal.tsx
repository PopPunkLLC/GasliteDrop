import React, { useEffect, useMemo, useState } from "react";
import { useKeyboardEvent } from "@react-hookz/web";
import { toast } from "sonner";
import { FaSpinner as SpinnerIcon } from "react-icons/fa";
import clsx from "clsx";
import { useNetwork, useWalletClient } from "wagmi";
import { waitForTransaction } from "@wagmi/core";
import { MdCheck as CheckIcon, MdClose as CloseIcon } from "react-icons/md";
import { arbitrum, base, optimism, polygon, sepolia, bsc, zora } from "@wagmi/chains";
import { baseSepolia } from "viem/chains";
import Bytecode20 from "../../contracts/out/Bytecode20.sol/Bytecode20.json";
import { useRouter } from "next/router";
import { blast } from "@/lib/chains/blast";
import { degen } from "@/lib/chains/degen";

const deriveExternalLink = (txHash, chainId) => {
  switch (chainId) {
    case sepolia.id:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    case optimism.id:
      return `https://optimistic.etherscan.io/tx/${txHash}`;
    case arbitrum.id:
      return `https://arbiscan.io/tx/${txHash}`;
    case polygon.id:
      return `https://polygonscan.com/tx/${txHash}`;
    case base.id:
      return `https://basescan.org/tx/${txHash}`;
    case baseSepolia.id:
      return `https://sepolia.basescan.org/tx/${txHash}`;
    case bsc.id:
      return `https://bscscan.com/tx/${txHash}`;
    case zora.id:
      return `https://zora.superscan.network/tx/${txHash}`;
    case blast.id:
      return `https://blastscan.io/tx/${txHash}`;
    case degen.id:
      return `https://explorer.degen.tips/tx/${txHash}`;
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
};

const TokenDetails = ({ title, value }) => (
  <div className="flex flex-row w-full justify-between font-normal">
    <span className="text-grey text mr-auto">{title}:</span>
    <span className={"text-black"}>{value}</span>
  </div>
);

const useDeployBytecode20 = ({ tokenName, symbol, totalSupply, decimals }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: walletClient } = useWalletClient();

  return {
    isProcessing,
    actions: {
      onDeploy: async () => {
        try {
          totalSupply = BigInt(totalSupply);
          let decimalMultiplier = BigInt(10) ** BigInt(decimals);
          totalSupply = totalSupply * decimalMultiplier;
          setIsProcessing(true);
          const hash = await walletClient.deployContract({
            abi: Bytecode20.abi,
            bytecode: Bytecode20.bytecode.object,
            args: [totalSupply, decimals, tokenName, "1", symbol],
          });
          console.log("Deployed contract with hash", hash);
          const receipt = await waitForTransaction({ confirmations: 3, hash });
          console.log("Receipt", receipt);
          return receipt;
        } catch (e) {
          console.error(e);
          return false;
        } finally {
          setIsProcessing(false);
        }
      },
    },
  };
};

const DeployModal = ({ token, onClose }) => {
  const { chain } = useNetwork();
  const [deployHash, setDeployHash] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  const router = useRouter();

  useEffect(() => {
    window.document.body.style.overflow = "hidden";
    return () => {
      window.document.body.style.overflow = "auto";
    };
  }, []);

  useKeyboardEvent(
    true,
    (ev) => {
      if (ev?.key === "Escape") {
        onClose();
      }
    },

    [],
    { eventOptions: { passive: true } }
  );

  const { isLoading, standard, symbol, decimals, balance, formattedBalance, onRefresh } = token;

  const { actions, isProcessing } = useDeployBytecode20({
    tokenName: token.name,
    symbol: token.symbol,
    totalSupply: token.totalSupply,
    decimals: token.decimals,
  });

  const onHandleDeploy = async () => {
    try {
      const receipt = await actions.onDeploy();
      if (!receipt) throw new Error("Deploy failed");

      setDeployHash(receipt.transactionHash);
      setContractAddress(receipt.contractAddress);
      console.log("Deployed contract with address", receipt.contractAddress);
    } catch (e) {
      console.error(e);
      toast.error("Failed to deploy contract");
    }
  };

  return (
    <div className="flex items-center justify-center fixed top-0 left-0 w-full h-[100dvh] z-[10000]">
      <div className="absolute top-0 left-0 h-full w-full z-[1] bg-white text-black bg-opacity-90" />
      <div className="flex flex-col w-4/5 md:w-1/2 mx-auto bg-white text-black rounded-md border-[2px] border-grey/[.3] z-[2] p-6">
        {isLoading ? (
          <div className="flex w-full h-full items-center justify-center">
            <SpinnerIcon className="animate-spin text-5xl text-primary" />
          </div>
        ) : deployHash ? (
          <>
            <div className="mx-auto text-center my-8 space-y-4">
              <h1 className="text-3xl text-black font-bold text-primary">Congratulations!</h1>
              <p>You contract has been deployed to address: {contractAddress}</p>
              <a
                className="underline text-primary"
                href={deriveExternalLink(deployHash, chain.id)}
                target="_blank"
                rel="noreferrer"
              >
                View transaction
              </a>

              <p className="pt-6 text-sm text-grey">Thanks for using Gaslite Drop</p>
            </div>
            <button
              className="bg-markPink-700 font-medium rounded-md text-white backdrop-blur w-full capitalize p-4 tracking-wide"
              onClick={async () => {
                router.push(`/${contractAddress}`);
              }}
            >
              Continue To Airdrop
            </button>
          </>
        ) : (
          <>
            <header className="flex flex-row items-center justify-between">
              <h1 className="text-2xl">Confirm Token Details</h1>
              <button onClick={onClose}>
                <CloseIcon className="text-2xl text-grey" />
              </button>
            </header>
            <p className="text-sm text-grey">Make sure everything looks good below before you deploy your contract</p>
            <div className="flex flex-col w-full pt-4 space-y-4">
              <div className="w-full border-2 border-neutral-700 bg-transparent rounded-md border-separate border-spacing-0 overflow-auto">
                <div className="flex flex-col text p-5">
                  <TokenDetails title="Token Name" value={token.name} />
                  <TokenDetails title="Token Symbol" value={token.symbol} />
                  <TokenDetails title="Total Supply" value={`${token.totalSupply} ${token.symbol}`} />
                  <TokenDetails title="Decimals" value={token.decimals} />
                </div>
              </div>

              <button
                className={clsx(
                  "flex flex-row items-center justify-center bg-markPink-700 font-medium spacing-wide py-4 rounded-md text-white backdrop-blur w-full capitalize",
                  {
                    "!text-base-100/75 opacity-50 !hover:bg-primary cursor-not-allowed": isProcessing,
                  }
                )}
                disabled={isProcessing}
                onClick={onHandleDeploy}
              >
                <div className="flex flex-row items-center font-bold tracking-wide">
                  <div className="mx-auto flex flex-row items-center ml-2">
                    {isProcessing ? "Processing..." : `Deploy ${token.name} to ${chain.name}`}
                  </div>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeployModal;
