import React, { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useRouter } from "next/router";
import { useNetwork } from "wagmi";
import { FaSpinner as SpinnerIcon } from "react-icons/fa";
import useTokenData from "@/components/hooks/useTokenData";
import PageTitle from "@/components/ui/PageTitle";
import Pill from "@/components/ui/Pill";
import ExternalContractLink from "@/components/ui/ExternalContractLink";
import AirdropModal from "@/components/ui/AirdropModal";
import EnterRecipients from "@/components/ui/EnterRecipients";
import NoBalanceWarning from "@/components/ui/NoBalanceWarning";

const TokenDrop = () => {
  const { chain } = useNetwork();
  const router = useRouter();
  const { contractAddress } = router.query;
  const [airdrop, setAirdrop] = useState(null);
  const token = useTokenData({ contractAddress });

  useEffect(() => {
    if (!contractAddress || (!token?.isLoading && !token?.isValid)) {
      router.push("/");
    }
  }, [contractAddress, token?.isLoading, token?.isValid]);

  if (token?.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <SpinnerIcon className="animate-spin text-5xl text-primary" />
      </div>
    );
  }

  const {
    symbol,
    balance,
    decimals,
    isERC721,
    standard,
    allowance,
    formattedBalance,
  } = token ?? {};

  const hasBalance = balance > 0n;

  return (
    <>
      {airdrop?.length > 0 && (
        <AirdropModal
          contractAddress={contractAddress}
          recipients={airdrop}
          token={token}
          onClose={() => {
            setAirdrop(null);
          }}
        />
      )}
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col justify-center w-full space-y-3">
          <PageTitle title={`${standard} Airdrop (${symbol})`} />
          <ExternalContractLink address={contractAddress} chainId={chain?.id} />
          <div className="flex flex-row items-center gap-2">
            <Pill>{standard}</Pill>
            <Pill variant="primary">
              {`You have ${formattedBalance} ${symbol}`}
            </Pill>
            {!isERC721 && hasBalance && (
              <Pill>
                {`Your allowance is ${formatUnits(
                  BigInt(allowance?.toString()),
                  decimals
                )} ${symbol}`}
              </Pill>
            )}
          </div>
          {hasBalance ? (
            <div className="flex flex-col space-y-1">
              <EnterRecipients
                isERC721={isERC721}
                symbol={symbol}
                decimals={decimals}
                onSubmit={(recipients) => {
                  setAirdrop(recipients);
                }}
              />
            </div>
          ) : (
            <NoBalanceWarning chainName={chain?.name} symbol={symbol} />
          )}
        </div>
      </div>
    </>
  );
};

export default TokenDrop;
