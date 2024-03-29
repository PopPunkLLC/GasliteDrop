import React, { useState } from "react";
import { useAccount, useNetwork, useBalance } from "wagmi";
import { toast } from "sonner";
import DeployModal from "@/components/ui/DeployModal";
import PageTitle from "@/components/ui/PageTitle";
import Pill from "@/components/ui/Pill";
import NoBalanceWarning from "@/components/ui/NoBalanceWarning";
import useNetworkNativeToken from "@/components/hooks/useNetworkNativeToken";
import Input from "@/components/ui/Input";
import clsx from "clsx";

const DeployERC20 = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { nativeToken } = useNetworkNativeToken();
  const [tokenName, setTokenName] = useState(null);
  const [decimals, setDecimals] = useState(18);
  const [symbol, setSymbol] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);
  const [cont, setCont] = useState(false);

  const { data: balance, refetch: onRefresh } = useBalance({
    address,
    onError: (error) => toast.error(error.message),
    chainId: chain?.id,
  });

  const hasBalance = balance?.value > 0n;

  return (
    <>
      {cont && (
        <DeployModal
          token={{
            isLoading: false,
            standard: "ERC20",
            symbol: symbol,
            decimals: decimals,
            totalSupply: totalSupply,
            name: tokenName,
            onRefresh,
          }}
          onClose={() => {
            setCont(false);
          }}
        />
      )}
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col justify-center w-full space-y-3">
          <PageTitle title={`Deploy ERC-20`} />
          <div className="flex flex-row items-center gap-2">
            <Pill>{chain.name}</Pill>
            <Pill variant="primary">{`You are deploying to ${chain.name}`}</Pill>
          </div>
          {hasBalance ? (
            <div className="flex flex-col space-y-1">
              <p className="text-base mb-6 text-grey">
                You are deploying{" "}
                <a
                  href="https://github.com/PopPunkLLC/gaslite-core/blob/main/src/Bytecode20.sol"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-primary"
                >
                  Bytecode20
                </a>
                , a Turbo gas optimized ERC20 written in EVM bytecode.
              </p>
              <Input
                value={tokenName}
                onChange={(name) => {
                  setTokenName(name);
                }}
                placeholder="Token Name"
                type="text"
              />
              <Input
                value={symbol}
                onChange={(symbol) => {
                  symbol = symbol.toUpperCase();
                  setSymbol(symbol);
                }}
                placeholder="Symbol"
              />
              <Input
                value={totalSupply}
                onChange={(supply) => {
                  setTotalSupply(supply);
                }}
                placeholder="Total Token Supply "
                type="number"
              />
              <Input
                value={decimals}
                onChange={(decimals) => {
                  setDecimals(decimals);
                }}
                placeholder="Decimals"
                type="number"
              />
              <button
                type="button"
                className={clsx("py-4 rounded-md w-full my-4 text-white bg-markPink-900 font-bold tracking-wide", {
                  "opacity-30 cursor-not-allowed": tokenName == null || symbol == null || decimals == null,
                })}
                disabled={tokenName == null || symbol == null || decimals == null}
                onClick={() => {
                  setCont(true);
                }}
              >
                Continue
              </button>
            </div>
          ) : (
            <NoBalanceWarning chainName={chain?.name} symbol={nativeToken} />
          )}
        </div>
      </div>
    </>
  );
};

export default DeployERC20;
