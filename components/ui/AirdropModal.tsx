import React, { useEffect, useMemo, useState } from "react";
import { useKeyboardEvent } from "@react-hookz/web";
import { formatUnits } from "viem";
import { toast } from "sonner";
import { FaSpinner as SpinnerIcon } from "react-icons/fa";
import { MdClose as CloseIcon } from "react-icons/md";
import clsx from "clsx";
import { erc20ABI, erc721ABI, useChainId } from "wagmi";
import {
  prepareWriteContract,
  waitForTransaction,
  writeContract,
} from "@wagmi/core";
import Button from "@/components/ui/Button";
import { airdropContractAddress } from "@/components/airdropContractAddress";
import { abi } from "@/components/abi";
import { shortenAddress } from "@/components/utils";

const RecipientsTable = ({ data, decimals, isERC721 }) => (
  <table className="w-full">
    <thead>
      <tr className="border-b-2 border-neutral-700">
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-left">
          Recipient
        </th>
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-right">
          {isERC721 ? "Token ID" : "Amount"}
        </th>
      </tr>
    </thead>
    <tbody className="overflow-auto">
      {data.map(({ address, amount }, index) => (
        <tr key={address + index}>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700 text-left">
            <span className="hidden md:flex">{address}</span>
            <span className="flex md:hidden">{shortenAddress(address, 6)}</span>
          </td>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700 text-right">
            {formatUnits(BigInt(amount?.toString()), isERC721 ? 0 : decimals)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const AirdropDetail = ({ title, value, symbol, critical = false }) => (
  <div className="flex flex-row w-full justify-between font-normal">
    <span className="text-grey text mr-auto">{title}:</span>
    <span className={`${critical ? "text-critical" : "text-black"}`}>
      {value} {symbol}
    </span>
  </div>
);

const useTokenDrop = ({ contractAddress, recipients, token }) => {
  const isNativeToken = !contractAddress;
  const chainId = useChainId();
  const [isProcessing, setIsProcessing] = useState(false);

  const recipientAddresses = recipients?.map(({ address }) => address);
  const recipientAmounts = recipients?.map(({ amount }) => amount);

  const requiredAllowance = useMemo(
    () =>
      recipientAmounts.reduce(
        (acc, amount) => acc + (token?.isERC721 ? 1n : amount),
        0n
      ),
    [JSON.stringify(recipientAmounts)]
  );

  const approvalConfig = useMemo(() => {
    if (!contractAddress) return null; // No approvals required for native token
    // ERC721
    if (token.isERC721) {
      return {
        address: contractAddress,
        abi: erc721ABI,
        functionName: "setApprovalForAll",
        args: [airdropContractAddress, true],
        enabled: Boolean(contractAddress),
        chainId,
      };
    }
    // ERC20
    return {
      address: contractAddress,
      abi: erc20ABI,
      functionName: "approve",
      args: [airdropContractAddress, requiredAllowance],
      enabled: Boolean(contractAddress),
      chainId,
    };
  }, [contractAddress, JSON.stringify(recipients), JSON.stringify(token)]);

  const airdropConfig = useMemo(() => {
    if (contractAddress) {
      // ERC721
      if (token.isERC721) {
        return {
          address: airdropContractAddress,
          abi,
          functionName: "airdropERC721",
          args: [contractAddress, recipientAddresses, recipientAmounts],
          enabled: recipients?.length > 0,
          chainId,
        };
      }
      // ERC20
      return {
        address: airdropContractAddress,
        abi,
        functionName: "airdropERC20",
        args: [
          contractAddress,
          recipientAddresses,
          recipientAmounts,
          requiredAllowance,
        ],
        enabled: recipients?.length > 0,
        chainId,
      };
    }
    // Native
    return {
      address: airdropContractAddress,
      abi,
      functionName: "airdropETH",
      args: [recipientAddresses, recipientAmounts],
      enabled: recipients?.length > 0,
      chainId,
      value: requiredAllowance,
    };
  }, [contractAddress, JSON.stringify(recipients), JSON.stringify(token)]);

  return {
    isProcessing,
    requiredAllowance,
    insufficientFunds: token?.balance < requiredAllowance,
    hasApprovals:
      isNativeToken ||
      (token?.isERC721 && token?.isApprovedForAll) ||
      (!token?.isERC721 && requiredAllowance <= token?.allowance),
    actions: {
      onApprove: async () => {
        try {
          if (!approvalConfig) return;
          setIsProcessing(true);
          const { request } = await prepareWriteContract(approvalConfig);
          const { hash } = await writeContract(request);
          return waitForTransaction({
            hash,
          });
        } catch (e) {
          console.error(e);
        } finally {
          setIsProcessing(false);
        }
      },
      onAirdrop: async () => {
        try {
          if (!airdropConfig) return;
          setIsProcessing(true);
          const { request } = await prepareWriteContract(airdropConfig);
          const { hash } = await writeContract(request);
          return waitForTransaction({
            hash,
          });
        } catch (e) {
          console.error(e);
        } finally {
          setIsProcessing(false);
        }
      },
    },
  };
};

const AirdropModal = ({
  contractAddress = null, // Native tx if null
  recipients = [],
  token,
  onClose,
}) => {
  const [isShowingCongrats, setShowingCongrats] = useState(false);

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

  const {
    isLoading,
    isERC721,
    symbol,
    decimals,
    balance,
    formattedBalance,
    onRefresh,
  } = token;

  const {
    isProcessing,
    requiredAllowance,
    insufficientFunds,
    hasApprovals,
    actions,
  } = useTokenDrop({
    contractAddress,
    recipients,
    token,
  });

  const formattedTotal = useMemo(
    () =>
      requiredAllowance
        ? isERC721
          ? String(requiredAllowance)
          : formatUnits(requiredAllowance, decimals || 18)
        : "0",
    [requiredAllowance, decimals, isERC721]
  );

  const formattedRemaining = useMemo(() => {
    const remainingBalance = balance - requiredAllowance;
    return remainingBalance
      ? formatUnits(remainingBalance, isERC721 ? 0 : decimals || 18)
      : "0";
  }, [isERC721, balance, requiredAllowance, recipients.length]);

  const onHandleAirdrop = async () => {
    try {
      if (insufficientFunds || isProcessing)
        throw new Error("Insufficient Funds");

      // Run approval transaction then airdrop transaction
      if (!hasApprovals) {
        const approval = await actions.onApprove();
        if (!approval) throw new Error("Approval unsuccessful");
        await onRefresh();
        toast.success("Token approved for airdrop");
      }

      const airdrop = await actions.onAirdrop();
      if (!airdrop) throw new Error("Airdrop unsuccessful");

      setShowingCongrats(true);
    } catch (e) {
      console.error(e);
      toast.error(e.message);
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
        ) : isShowingCongrats ? (
          <>
            <div className="mx-auto text-center my-8 space-y-4">
              <h1 className="text-3xl text-black font-bold text-primary">
                Congratulations!
              </h1>
              <p className="text-xl">Your tokens have been sent</p>
              <p className="pt-6 text-sm text-grey">
                Thanks for using Gaslite Drop
              </p>
            </div>
            <button
              className="bg-markPink-700 font-medium rounded-md text-white backdrop-blur w-full capitalize p-4 tracking-wide"
              onClick={async () => {
                await onRefresh();
                onClose();
              }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <header className="flex flex-row items-center justify-between">
              <h1 className="text-2xl">
                Confirm Recipients and {isERC721 ? "Token IDs" : "Amounts"}
              </h1>
              <button onClick={onClose}>
                <CloseIcon className="text-2xl text-grey" />
              </button>
            </header>
            <p className="text-sm text-grey">
              Make sure everything looks good below before you send your{" "}
              {symbol || "token"}
            </p>
            <div className="flex flex-col w-full pt-4 space-y-4">
              <div
                className="w-full border-2 border-neutral-700 bg-transparent rounded-md border-separate border-spacing-0 overflow-auto"
                style={{ height: "calc(50vh - 5em)" }}
              >
                <RecipientsTable
                  data={recipients}
                  symbol={symbol}
                  decimals={decimals}
                  isERC721={isERC721}
                />
              </div>
              <div className="flex flex-col gap-2 mt-4 text">
                <AirdropDetail
                  title="Beginning balance"
                  value={formattedBalance}
                  symbol={symbol}
                />
                <AirdropDetail
                  title="Total to send"
                  value={formattedTotal}
                  symbol={symbol}
                />
                <AirdropDetail
                  title="Remaining"
                  value={formattedRemaining}
                  symbol={symbol}
                  critical={insufficientFunds}
                />
              </div>
              <button
                className={clsx(
                  "flex flex-row items-center justify-center bg-markPink-700 font-medium spacing-wide py-4 rounded-md text-white backdrop-blur w-full capitalize",
                  {
                    "!text-base-100/75 opacity-50 !hover:bg-primary cursor-not-allowed":
                      insufficientFunds || isProcessing,
                  }
                )}
                onClick={onHandleAirdrop}
                disabled={insufficientFunds || isProcessing}
              >
                {isProcessing ? (
                  "Processing..."
                ) : insufficientFunds ? (
                  "Insufficient Funds"
                ) : (
                  <div className="flex flex-row items-center font-bold tracking-wide">
                    <div className="mx-auto flex flex-row items-center ml-2">
                      {(() => {
                        if (isERC721) {
                          return hasApprovals ? (
                            <span>{`Send ${recipients.length} ${symbol}`}</span>
                          ) : (
                            <span>{`Set Approval for ${symbol}`}</span>
                          );
                        } else if (symbol === "ETH") {
                          return (
                            <span>{`Send ${formattedTotal} ${symbol}`}</span>
                          );
                        } else {
                          return hasApprovals ? (
                            <span>{`Send ${formattedTotal} ${symbol}`}</span>
                          ) : (
                            <span>{`Approve ${formattedTotal} ${symbol}`}</span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AirdropModal;
