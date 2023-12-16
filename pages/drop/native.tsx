import React, { useState } from "react";
import { useAccount, useNetwork, useBalance } from "wagmi";
import { toast } from "sonner";
import AirdropModal from "@/components/ui/AirdropModal";
import PageTitle from "@/components/ui/PageTitle";
import Pill from "@/components/ui/Pill";
import EnterRecipients from "@/components/ui/EnterRecipients";
import NoBalanceWarning from "@/components/ui/NoBalanceWarning";
import useNetworkNativeToken from "@/components/hooks/useNetworkNativeToken";

const NativeTokenDrop = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { nativeToken } = useNetworkNativeToken();
  const [airdrop, setAirdrop] = useState(null);

  const { data: balance, refetch: onRefresh } = useBalance({
    address,
    onError: (error) => toast.error(error.message),
    chainId: chain?.id,
  });

  const hasBalance = balance?.value > 0n;

  return (
    <>
      {airdrop?.length > 0 && (
        <AirdropModal
          recipients={airdrop}
          token={{
            isLoading: false,
            standard: "ERC20",
            symbol: nativeToken,
            decimals: 18,
            balance: balance?.value,
            formattedBalance: balance?.formatted,
            onRefresh,
          }}
          onClose={() => {
            setAirdrop(null);
          }}
          isNative
        />
      )}
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col justify-center w-full space-y-3">
          <PageTitle title={`Airdrop ${nativeToken}`} />
          <div className="flex flex-row items-center gap-2">
            <Pill>{nativeToken}</Pill>
            <Pill variant="primary">
              {`You have ${balance?.formatted} ${nativeToken}`}
            </Pill>
          </div>
          {hasBalance ? (
            <div className="flex flex-col space-y-1">
              <EnterRecipients
                standard="ERC20"
                symbol={nativeToken}
                decimals={18}
                onSubmit={(recipients) => {
                  setAirdrop(recipients);
                }}
              />
            </div>
          ) : (
            <NoBalanceWarning chainName={chain?.name} symbol={nativeToken} />
          )}
        </div>
      </div>
    </>
  );
};

export default NativeTokenDrop;
