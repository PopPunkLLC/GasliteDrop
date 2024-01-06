import React, { ChangeEvent, useState } from "react";
import { useAccount, useNetwork, useBalance } from "wagmi";
import { toast } from "sonner";
import { MdWarning as WarningIcon } from "react-icons/md";
import clsx from "clsx";
import AirdropModal from "@/components/ui/AirdropModal";
import PageTitle from "@/components/ui/PageTitle";
import Pill from "@/components/ui/Pill";
import useNetworkNativeToken from "@/components/hooks/useNetworkNativeToken";
import Input from "@/components/ui/Input";
import useFriendTechData from "@/components/hooks/useFriendTechData";
import { recipientsParser } from "@/components/types/parsers";

const FriendTechDrop = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { nativeToken } = useNetworkNativeToken();
  const [friendTechAddress, setFriendTechAddress] = useState(null);
  const [airdropValue, setAirdropValue] = useState(null);
  const [airdrop, setAirdrop] = useState(null);

  const { data: balance, refetch: onRefresh } = useBalance({
    address,
    onError: (error) => toast.error(error.message),
    chainId: chain?.id,
  });

  const { data, isLoading } = useFriendTechData({ address: friendTechAddress });

  const handleFriendTechAirdrop = ({
    data: holders,
    airdropValue: amountPerHolder,
  }) => {
    setAirdrop(
      recipientsParser(18).parse(
        holders.map((holder) => [holder, amountPerHolder])
      )
    );
  };

  return (
    <>
      {airdrop?.length > 0 && (
        <AirdropModal
          recipients={airdrop}
          token={{
            isLoading: false,
            standard: "ERC20",
            symbol: "ETH",
            decimals: 18,
            balance: balance?.value,
            formattedBalance: balance?.formatted,
            onRefresh,
          }}
          onClose={() => {
            setAirdrop(null);
          }}
        />
      )}
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col justify-center w-full space-y-3">
          <PageTitle title="Enter your FriendTech wallet address" />
          <Input
            value={friendTechAddress}
            onChange={(address) => {
              setFriendTechAddress(address);
            }}
            isLoading={isLoading}
          />
          <div className="flex flex-row items-center gap-2">
            <Pill>FriendTech</Pill>
            {friendTechAddress && (
              <Pill variant="primary">{`You have ${data?.length} key holders`}</Pill>
            )}
          </div>
          {data?.length > 0 ? (
            <div className="flex flex-col space-y-1">
              <div className="min-h-fit mt-2 space-y-2">
                <div className="flex flex-col space-y-1">
                  <h2 className="text-2xl text-base-100">
                    Enter an amount ({nativeToken}) to send to each address:
                  </h2>
                  <div className="flex items-center w-full bg-transparent text-base-100 p-4 text-xl rounded-md space-x-1 border-2 border-neutral-700">
                    <input
                      className="border-none focus:outline-none w-full text-right"
                      spellCheck={false}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setAirdropValue(e.target.value);
                      }}
                      placeholder={"E.g., 0.1"}
                      value={airdropValue || ""}
                      autoFocus
                    />
                  </div>
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
                  onClick={handleFriendTechAirdrop.bind(null, {
                    data,
                    airdropValue,
                  })}
                  disabled={data.length === 0 || !airdropValue}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : friendTechAddress ? (
            <div className="flex flex-row items-center space-x-4 bg-markPink-100 bg-opacity-50 border border-markPink-200 py-4 pl-4 pr-6 rounded-md mt-10">
              <WarningIcon className="flex-shrink-0 text-2xl text-primary" />
              <p className="text-primary">
                {`This address has no associated holders.`}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default FriendTechDrop;
