import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useAccount, useNetwork, useBalance } from "wagmi";
import { toast } from "sonner";
import { isAddress } from "viem";
import { MdWarning as WarningIcon } from "react-icons/md";
import clsx from "clsx";
import AirdropModal from "@/components/ui/AirdropModal";
import PageTitle from "@/components/ui/PageTitle";
import Pill from "@/components/ui/Pill";
import useNetworkNativeToken from "@/components/hooks/useNetworkNativeToken";
import Input from "@/components/ui/Input";
import { recipientsParser } from "@/components/types/parsers";
import useTwitterData from "@/components/hooks/useTwitterData";
import { toParams, uniq } from "@/components/utils";
import { useDebouncedEffect } from "@react-hookz/web";
import useTokenData from "@/components/hooks/useTokenData";

const TwitterDrop = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { nativeToken } = useNetworkNativeToken();
  const router = useRouter();
  const [airdrop, setAirdrop] = useState(null);

  const { id = "", dropAddress = "" } = router.query;

  const [tweetId, setTweetId] = useState(id);
  const [airdropValue, setAirdropValue] = useState(null);
  const [contractAddress, setContractAddress] = useState(dropAddress);

  useDebouncedEffect(
    () => {
      if (!contractAddress || isAddress(contractAddress)) {
        router.push(
          `?${toParams({
            ...router?.query,
            dropAddress: contractAddress,
          })}`,
          null,
          {
            shallow: true,
          }
        );
      }
    },
    [contractAddress],
    200,
    500
  );

  useDebouncedEffect(
    () => {
      if (tweetId) {
        router.push(
          `?${toParams({
            ...router?.query,
            id: tweetId,
          })}`,
          null,
          {
            shallow: true,
          }
        );
      }
    },
    [tweetId],
    200,
    500
  );

  const { data: balance, refetch: onRefresh } = useBalance({
    address,
    onError: (error) => toast.error(error.message),
    chainId: chain?.id,
  });

  const { data, isLoading, error } = useTwitterData({ tweetId: id });

  const { isLoading: isLoadingToken, ...token } = useTokenData({
    contractAddress: dropAddress,
  });

  const handleTwitterAirdrop = useCallback(
    ({
      data: addresses,
      airdropValue: amountPerHolder,
      dropAddress: tokenAddress,
    }) => {
      setAirdrop(
        recipientsParser(tokenAddress ? token?.decimals : 18).parse(
          addresses.map((address) => [address, amountPerHolder])
        )
      );
    },
    [JSON.stringify(token)]
  );

  return (
    <>
      {airdrop?.length > 0 && (
        <AirdropModal
          contractAddress={dropAddress}
          recipients={airdrop}
          token={
            dropAddress
              ? token
              : {
                  isLoading: false,
                  isERC721: false,
                  symbol: nativeToken,
                  decimals: 18,
                  balance: balance?.value,
                  formattedBalance: balance?.formatted,
                  onRefresh,
                }
          }
          onClose={() => {
            setAirdrop(null);
          }}
        />
      )}
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col justify-center w-full space-y-3">
          <PageTitle title="Enter X Post Id" />
          <Input
            value={tweetId}
            onChange={(value) => {
              setTweetId(value);
            }}
            isLoading={isLoading}
            placeholder="E.g., 1720561127883489534"
          />
          {error && (
            <div className="flex flex-row items-center py-1">
              <p className="text-black bg-critical bg-opacity-50 border border-critical p-4 rounded-md">
                {`Oops! Looks like there was an issue pulling down the tweet, perhaps due to rate limiting. Please try again later.`}
              </p>
            </div>
          )}
          <div className="flex flex-row items-center gap-2">
            <Pill>X (Twitter)</Pill>
            {id && (
              <Pill variant="primary">{`There were ${
                data?.length || 0
              } addresses found`}</Pill>
            )}
          </div>
          {data?.length > 0 ? (
            <div className="flex flex-col space-y-1">
              <div className="min-h-fit mt-2 space-y-2">
                <div className="flex flex-col space-y-1">
                  <h2 className="text-2xl text-base-100">
                    Enter an amount to send to each address:
                  </h2>
                  <p className="text-sm text-gray">
                    {`Enter a contract address if you'd like to send an ERC20
                    token instead. Leave empty for ${nativeToken}.`}
                  </p>
                  <div className="flex flex-row items-center space-x-2">
                    <Input
                      className="border-none focus:outline-none w-full text-base"
                      spellCheck={false}
                      onChange={(contractAddress) => {
                        if (contractAddress.length > 42) return;
                        setContractAddress(contractAddress);
                      }}
                      placeholder="0x"
                      value={contractAddress || ""}
                      isLoading={isLoadingToken}
                    />
                    <Input
                      containerClassName="max-w-[150px]"
                      className="border-none focus:outline-none w-full text-right text-base"
                      onChange={(amount) => {
                        setAirdropValue(amount);
                      }}
                      placeholder={"E.g., 0.1"}
                      value={airdropValue || ""}
                    />
                  </div>
                  {dropAddress ? (
                    token?.isValid ? (
                      <div className="flex flex-row items-center space-x-1">
                        <Pill>{token?.symbol}</Pill>
                        <Pill variant="primary">
                          {`You have ${token?.formattedBalance} ${token?.symbol}`}
                        </Pill>
                      </div>
                    ) : (
                      <div className="flex flex-row items-center py-1">
                        <p className="text-black bg-critical bg-opacity-50 border border-critical p-4 rounded-md">
                          {`Oops! That doesn't look like a valid contract address on
                  ${chain?.name}. Double check the address and please try again.`}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-row items-center space-x-1">
                      <Pill>{nativeToken}</Pill>
                      <Pill variant="primary">
                        {`You have ${balance?.formatted} ${nativeToken}`}
                      </Pill>
                    </div>
                  )}
                </div>
                <textarea
                  value={data?.join(
                    `,${airdropValue ? `${airdropValue},` : ""}\n`
                  )}
                  className="w-full min-h-[200px] max-h-[400px] p-3 text-black border-black border-2 rounded-md"
                  readOnly
                />
                <button
                  type="button"
                  className={clsx(
                    "py-4 rounded-md w-full my-4 text-white bg-markPink-900 font-bold tracking-wide",
                    {
                      "opacity-30 cursor-not-allowed":
                        data.length === 0 || !airdropValue,
                    }
                  )}
                  onClick={() => {
                    handleTwitterAirdrop({
                      data,
                      airdropValue,
                      dropAddress,
                    });
                  }}
                  disabled={data.length === 0 || !airdropValue}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : id && !isLoading && !isLoadingToken ? (
            <div className="flex flex-row items-center space-x-4 bg-markPink-100 bg-opacity-50 border border-markPink-200 py-4 pl-4 pr-6 rounded-md mt-10">
              <WarningIcon className="flex-shrink-0 text-2xl text-primary" />
              <p className="text-primary">
                {`This tweet has no associated addresses.`}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default TwitterDrop;
