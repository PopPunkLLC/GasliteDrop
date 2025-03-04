import React, { useEffect, useMemo, useState } from "react";
import { useKeyboardEvent } from "@react-hookz/web";
import clsx from "clsx";
import { toast } from "sonner";
import { FaSpinner as SpinnerIcon } from "react-icons/fa";
import { MdClose as CloseIcon } from "react-icons/md";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import useTokenDrop from "@/components/hooks/useTokenDrop";
import RecipientsTable from "@/components/ui/RecipientsTable";
import AirdropDetail from "@/components/ui/AirdropDetail";
import {
  sepolia,
  optimism,
  arbitrum,
  polygon,
  base,
  baseSepolia,
  bsc,
  zora,
  blast,
  degen,
  sanko,
  apeChain,
  abstract,
} from "viem/chains";

interface Recipient {
  address: string;
  amount: bigint;
  tokenId?: string | number;
  excluded?: boolean;
}

interface TokenData {
  isLoading?: boolean;
  standard: "ERC20" | "ERC721" | "ERC1155";
  symbol: string;
  decimals: number;
  balance: bigint;
  formattedBalance: string;
  allowance?: bigint;
  isApprovedForAll?: boolean;
  onRefresh?: () => void;
}

interface AirdropModalProps {
  contractAddress: string | null;
  recipients: Recipient[];
  token: TokenData;
  isNative?: boolean;
  congratsRenderer?: (props: {
    token: TokenData;
    recipients: Recipient[];
    isNative: boolean;
  }) => React.ReactNode;
  onClose: () => void;
}

const deriveExternalLink = (txHash: string, chainId?: number) => {
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
    case sanko.id:
      return `https://explorer.sanko.xyz/tx/${txHash}`;
    case apeChain.id:
      return `https://apescan.io/tx/${txHash}`;
    case abstract.id:
      return `https://abscan.org/tx/${txHash}`;
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
};

const AirdropModal = ({
  contractAddress = null,
  recipients = [],
  token,
  isNative = false,
  congratsRenderer,
  onClose,
}: AirdropModalProps) => {
  const { chain } = useAccount();
  const [airdropHash, setAirdropHash] = useState<string | null>(null);

  const [editableRecipients, setEditableRecipients] = useState(() =>
    recipients.map((r) => ({ ...r, excluded: false })),
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
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
    { eventOptions: { passive: true } },
  );

  const {
    isProcessing,
    insufficientFunds,
    hasApprovals,
    requiredAllowance,
    actions,
    airdropConfig,
    approvalConfig,
  } = useTokenDrop({
    contractAddress,
    recipients: editableRecipients,
    token,
  });

  const {
    isLoading,
    standard,
    symbol,
    decimals,
    balance,
    formattedBalance,
    onRefresh,
  } = token;

  const formattedTotal = useMemo(() => {
    if (requiredAllowance === 0n) return "0";
    if (standard === "ERC721") {
      return String(requiredAllowance);
    }
    return formatUnits(requiredAllowance, decimals);
  }, [requiredAllowance, standard, decimals]);

  const formattedRemaining = useMemo(() => {
    if (standard === "ERC1155") return "0";
    const remain = balance - requiredAllowance;
    return remain > 0n
      ? formatUnits(remain, standard === "ERC721" ? 0 : decimals)
      : "0";
  }, [standard, balance, requiredAllowance, decimals]);

  const onHandleExcludeRecipient = (idx: number) => {
    setEditableRecipients((prev) => {
      const item = prev[idx];
      prev.splice(idx, 1, { ...item, excluded: !item.excluded });
      return [...prev];
    });
  };

  const onHandleAirdrop = async () => {
    try {
      if (insufficientFunds || isProcessing) {
        throw new Error(
          "Insufficient funds or transaction already in progress.",
        );
      }

      if (!hasApprovals) {
        const approved = await actions.onApprove();
        if (!approved) throw new Error("Approval unsuccessful");
        toast.success("Token approved for airdrop");
      }

      const txHash = await actions.onAirdrop();

      if (!txHash) throw new Error("Airdrop unsuccessful");
      setAirdropHash(txHash);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const totalRecipients = editableRecipients.reduce(
    (acc, r) => (r.excluded ? acc : acc + 1),
    0,
  );

  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] z-[10000] flex items-center justify-center">
      <div className="absolute top-0 left-0 h-full w-full z-[1] bg-white text-black bg-opacity-90" />
      <div className="relative flex flex-col w-4/5 md:w-1/2 mx-auto bg-white text-black rounded-md border-[2px] border-grey/[.3] z-[2] p-6">
        {isLoading ? (
          <div className="flex w-full h-full items-center justify-center">
            <SpinnerIcon className="animate-spin text-5xl text-primary" />
          </div>
        ) : airdropHash ? (
          <>
            <div className="mx-auto text-center my-8 space-y-4">
              <h1 className="text-3xl text-black font-bold text-primary">
                Congratulations!
              </h1>
              {congratsRenderer ? (
                congratsRenderer({ token, recipients, isNative })
              ) : (
                <div>
                  <p className="text-xl">Your tokens have been sent!</p>
                  <a
                    className="underline text-primary my-2 block"
                    href={deriveExternalLink(airdropHash, chain?.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Transaction
                  </a>
                </div>
              )}
              <p className="pt-6 text-sm text-grey">
                Thanks for using Gaslite Drop
              </p>
            </div>
            <button
              className="bg-markPink-700 font-medium rounded-md text-white backdrop-blur w-full capitalize p-4 tracking-wide"
              onClick={async () => {
                await onRefresh?.();
                onClose();
              }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <header className="flex items-center justify-between">
              <h1 className="text-2xl">
                Confirm{" "}
                {standard === "ERC20"
                  ? "Recipients & Amounts"
                  : `Token IDs${standard === "ERC1155" ? " & Amounts" : ""}`}
              </h1>
              <button onClick={onClose}>
                <CloseIcon className="text-2xl text-grey" />
              </button>
            </header>

            <p className="text-sm text-grey">
              Double-check everything before sending {symbol}.
            </p>

            <div className="flex flex-col w-full pt-4 space-y-4">
              <div
                className="w-full border-2 border-neutral-700 bg-transparent rounded-md overflow-auto"
                style={{ height: "calc(50vh - 5em)" }}
              >
                <RecipientsTable
                  data={editableRecipients}
                  onExclude={onHandleExcludeRecipient}
                  decimals={decimals}
                  standard={standard}
                />
              </div>

              {standard === "ERC1155" ? (
                <div className="flex flex-col gap-2 mt-4 text">
                  <AirdropDetail
                    title="Recipient(s)"
                    value={totalRecipients}
                    symbol="addresses"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4 text">
                  <AirdropDetail
                    title="Beginning balance"
                    value={formattedBalance}
                    symbol={symbol}
                  />
                  <AirdropDetail
                    title="Recipient(s)"
                    value={totalRecipients}
                    symbol="addresses"
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
              )}

              <button
                className={clsx(
                  "flex flex-row items-center justify-center bg-markPink-700 font-medium py-4 rounded-md text-white backdrop-blur w-full capitalize",
                  {
                    "!text-base-100/75 opacity-50 cursor-not-allowed":
                      insufficientFunds || isProcessing,
                  },
                )}
                onClick={onHandleAirdrop}
                disabled={insufficientFunds || isProcessing}
              >
                {isProcessing
                  ? "Processing..."
                  : insufficientFunds
                    ? "Insufficient Funds"
                    : (() => {
                        if (standard === "ERC721") {
                          return hasApprovals
                            ? `Send ${symbol}`
                            : `Set Approval for ${symbol}`;
                        }
                        if (standard === "ERC1155") {
                          return hasApprovals ? "Send Tokens" : "Set Approvals";
                        }
                        if (isNative) {
                          return `Send ${formattedTotal} ${symbol}`;
                        }
                        return hasApprovals
                          ? `Send ${formattedTotal} ${symbol}`
                          : `Approve ${formattedTotal} ${symbol}`;
                      })()}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AirdropModal;
