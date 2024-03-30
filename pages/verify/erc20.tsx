import React, { useEffect, useState } from "react";
import { useAccount, useNetwork, useBalance } from "wagmi";
import { toast } from "sonner";
import DeployModal from "@/components/ui/DeployModal";
import PageTitle from "@/components/ui/PageTitle";
import Pill from "@/components/ui/Pill";
import NoBalanceWarning from "@/components/ui/NoBalanceWarning";
import useNetworkNativeToken from "@/components/hooks/useNetworkNativeToken";
import Input from "@/components/ui/Input";
import clsx from "clsx";
import ExpectedBytecode from "../../contracts/out/Bytecode20.sol/ExpectedBytecode.json";
import { getPublicClient } from "@wagmi/core";
import { http, createPublicClient, stringify } from "viem";
import { mainnet, arbitrum, base, optimism, polygon, sepolia, bsc, zora } from "@wagmi/chains";
import { baseSepolia } from "viem/chains";
import { blast } from "@/lib/chains/blast";
import { degen } from "@/lib/chains/degen";

const publicClients = [
  createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  createPublicClient({
    chain: sepolia,
    transport: http(),
  }),
  createPublicClient({
    chain: arbitrum,
    transport: http(),
  }),
  createPublicClient({
    chain: base,
    transport: http(),
  }),
  createPublicClient({
    chain: optimism,
    transport: http(),
  }),
  createPublicClient({
    chain: polygon,
    transport: http(),
  }),
  createPublicClient({
    chain: bsc,
    transport: http(),
  }),
  createPublicClient({
    chain: zora,
    transport: http(),
  }),
  createPublicClient({
    chain: baseSepolia,
    transport: http(),
  }),
  createPublicClient({
    chain: blast,
    transport: http(),
  }),
  createPublicClient({
    chain: degen,
    transport: http(),
  }),
];

const useFetchByteCode = ({ contractAddress }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { chain } = useNetwork();
  const publicClient = publicClients.find((client) => client.chain.id === chain.id);

  return {
    isProcessing,
    actions: {
      onFetch: async () => {
        try {
          setIsProcessing(true);
          const data = await publicClient.getBytecode({
            address: contractAddress,
          });
          setIsProcessing(false);
          return data;
        } catch (error) {
          setIsProcessing(false);
          throw new Error(error.message);
        }
      },
    },
  };
};

const VerifyERC20 = () => {
  const { chain } = useNetwork();
  const [fetchedBytecode, setFetchedBytecode] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);

  const correctBytecode = ExpectedBytecode.bytecode;

  const onHandleFetchBytecode = async () => {
    try {
      const receipt = await actions.onFetch();
      //slice the bytecode to leave only the first 1146 characters
      const slicedReceipt = receipt ? receipt.slice(0, 1146) : null;
      setFetchedBytecode(slicedReceipt || "error");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const { actions, isProcessing } = useFetchByteCode({
    contractAddress: contractAddress,
  });

  return (
    <>
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col justify-center w-full space-y-3">
          <PageTitle title={`Verify Bytecode20 Deployment`} />
          <div className="flex flex-row items-center gap-2">
            <Pill>{chain.name}</Pill>
          </div>
          <div className="flex flex-col space-y-1">
            <Input
              value={contractAddress}
              onChange={(address) => {
                setContractAddress(address);
              }}
              placeholder="Contract Address"
            />
            <button
              onClick={onHandleFetchBytecode}
              className={clsx("bg-primary text-white rounded-md p-2", {
                "!text-base-100/75 opacity-50 !hover:bg-primary cursor-not-allowed":
                  !contractAddress || contractAddress.length != 42 || isProcessing,
              })}
              disabled={!contractAddress || contractAddress.length != 42 || isProcessing}
            >
              {isProcessing
                ? "Fetching..."
                : !contractAddress || contractAddress.length != 42
                ? "Enter Valid Contract Address"
                : "Fetch Bytecode"}
            </button>
            {fetchedBytecode && fetchedBytecode === correctBytecode ? (
              <div className="bg-green-200 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                <p className="font-bold">Success</p>
                <p>Bytecode matches the expected Bytecode20 deployment</p>
              </div>
            ) : fetchedBytecode == "error" ? (
              <div className="bg-yellow-200 border-l-4 border-yellow-500 text-yellow-700 p-4" role="error">
                <p className="font-bold">Error</p>
                <p>
                  Error fetching deployed bytecode. <br></br>Please verify contract address and network.
                </p>
              </div>
            ) : fetchedBytecode ? (
              <div className="bg-red-200 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                <p className="font-bold">Caution</p>
                <p>Bytecode does not match the expected Bytecode20 deployment</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyERC20;
