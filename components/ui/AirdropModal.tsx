import React, { useEffect, useMemo, useState } from "react";
import { useKeyboardEvent } from "@react-hookz/web";
import { formatUnits, parseAbi } from "viem";
import { toast } from "sonner";
import { FaSpinner as SpinnerIcon } from "react-icons/fa";
import clsx from "clsx";
import { erc20ABI, erc721ABI, useAccount, useChainId, useNetwork } from "wagmi";
import {
  keyBy,
  zipObject,
  map as mapObject,
  groupBy,
  reduce as reduceObject,
} from "lodash";
import { MdCheck as CheckIcon, MdClose as CloseIcon } from "react-icons/md";
import {
  prepareWriteContract,
  readContracts,
  waitForTransaction,
  writeContract,
} from "@wagmi/core";
import { shortenAddress } from "@/components/utils";
import { abi, airdrop1155Abi, erc1155ABI } from "@/lib/abis";
import {
  airdropContractAddress,
  airdrop1155ContractAddress,
} from "@/lib/contracts";
import { arbitrum, base, optimism, polygon, sepolia, bsc, zora, } from "@wagmi/chains";
import { baseSepolia } from "viem/chains";

// Override the ERC20 "approve" call for tokens that do not return a value (we don't check the return)
// value anyway and it causes an error in the UI for tokens that don't return a boolean
const erc20approveAbi = parseAbi([
  "function approve(address spender, uint256 amount) public",
])

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
      return `${baseSepolia.blockExplorers.default.url}/tx/${txHash}`;
    case bsc.id:
      return `https://bscscan.com/tx/${txHash}`;
    case zora.id:
      return `https://zora.superscan.network/tx/${txHash}`;
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
};

const RecipientsTable = ({ data, decimals, standard, onExclude }) => (
  <table className="w-full">
    <thead>
      <tr className="border-b-2 border-neutral-700">
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-left">
          <span />
        </th>
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-left">
          Recipient
        </th>
        <th className="bg-white text-grey capitalize p-2 sticky top-0 text-right">
          {standard === "ERC20" ? "Amount" : "Token ID"}
        </th>
        {standard === "ERC1155" && (
          <th className="bg-white text-grey capitalize p-2 sticky top-0 text-right">
            Amount
          </th>
        )}
      </tr>
    </thead>
    <tbody className="overflow-auto">
      {data.map(({ address, amount, excluded, tokenId }, index) => (
        <tr
          key={`${address}_${index}_${excluded}`}
          className={clsx({
            "opacity-50 duration-300 ease-in": excluded,
          })}
        >
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700 text-left">
            <button
              type="button"
              className={clsx({
                "text-primary": !excluded,
                "text-grey": excluded,
              })}
              onClick={() => {
                onExclude(index);
              }}
            >
              {!excluded ? (
                <CheckIcon className="text-xl" />
              ) : (
                <CloseIcon className="text-xl" />
              )}
            </button>
          </td>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700 text-left">
            <span className="hidden md:flex">{address}</span>
            <span className="flex md:hidden">{shortenAddress(address, 6)}</span>
          </td>
          <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700 text-right">
            {formatUnits(
              BigInt(
                standard === "ERC1155"
                  ? tokenId?.toString()
                  : amount?.toString()
              ),
              standard === "ERC20" ? decimals : 0
            )}
          </td>
          {standard === "ERC1155" && (
            <td className="capitalize bg-transparent text-black bg-white p-2 border-t-2 border-neutral-700 text-right">
              {formatUnits(BigInt(amount?.toString()), 0)}
            </td>
          )}
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
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingBalances, setIsCheckingBalance] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const validRecipients = recipients?.filter(({ excluded }) => !excluded);

  const recipientAddresses = validRecipients.map(({ address }) => address);

  const recipientAmounts = validRecipients.map(({ amount }) => amount);

  const requiredAllowance = useMemo(() => {
    return (
      // ERC721/ERC1155 just use setApproval for all check
      token?.standard === "ERC1155"
        ? 0n
        : token?.standard === "ERC721"
        ? BigInt(recipientAmounts.length)
        : recipientAmounts.reduce((acc, amount) => acc + amount, 0n)
    );
  }, [JSON.stringify(recipientAmounts)]);

  const approvalConfig = useMemo(() => {
    if (!contractAddress) return null; // No approvals required for native token
    // ERC721
    if (token.standard === "ERC721") {
      return {
        address: contractAddress,
        abi: erc721ABI,
        functionName: "setApprovalForAll",
        args: [airdropContractAddress?.[chainId], true],
        enabled: Boolean(contractAddress),
        chainId,
      };
    } else if (token.standard === "ERC1155") {
      return {
        address: contractAddress,
        abi: erc1155ABI,
        functionName: "setApprovalForAll",
        args: [airdrop1155ContractAddress?.[chainId], true],
        enabled: Boolean(contractAddress),
        chainId,
      };
    }
    // ERC20
    return {
      address: contractAddress,
      abi: erc20approveAbi,
      functionName: "approve",
      args: [airdropContractAddress?.[chainId], requiredAllowance],
      enabled: Boolean(contractAddress),
      chainId,
    };
  }, [contractAddress, JSON.stringify(recipients), JSON.stringify(token)]);

  const airdropConfig = useMemo(() => {
    if (contractAddress) {
      if (token.standard === "ERC721") {
        return {
          address: airdropContractAddress?.[chainId],
          abi,
          functionName: "airdropERC721",
          args: [contractAddress, recipientAddresses, recipientAmounts],
          enabled: validRecipients?.length > 0,
          chainId,
        };
      } else if (token.standard === "ERC1155") {
        const tokenGroups = groupBy(validRecipients, "tokenId");

        // Generate tuples of tuples
        const airdropTokens = reduceObject(
          tokenGroups,
          (acc, tokenRecipients, tokenId) => {
            const amountGroups = groupBy(tokenRecipients, "amount");
            acc.push([
              BigInt(tokenId),
              reduceObject(
                amountGroups,
                (accInner, amountRecipients, amount) => {
                  accInner.push([
                    BigInt(amount),
                    mapObject(amountRecipients, "address"),
                  ]);
                  return accInner;
                },
                []
              ),
            ]);
            return acc;
          },
          []
        );

        return {
          address: airdrop1155ContractAddress?.[chainId],
          abi: airdrop1155Abi,
          functionName: "airdropERC1155",
          args: [contractAddress, airdropTokens],
          enabled: validRecipients?.length > 0,
          chainId,
        };
      }
      // ERC20
      return {
        address: airdropContractAddress?.[chainId],
        abi,
        functionName: "airdropERC20",
        args: [
          contractAddress,
          recipientAddresses,
          recipientAmounts,
          requiredAllowance,
        ],
        enabled: validRecipients?.length > 0,
        chainId,
      };
    }
    // Native
    return {
      address: airdropContractAddress?.[chainId],
      abi,
      functionName: "airdropETH",
      args: [recipientAddresses, recipientAmounts],
      enabled: validRecipients?.length > 0,
      chainId,
      value: requiredAllowance,
    };
  }, [contractAddress, JSON.stringify(validRecipients), JSON.stringify(token)]);

  // Update enough balance
  useEffect(() => {
    if (token?.standard !== "ERC1155") {
      // TODO: Probably should check ownership of each token id for ERC721 in the future and not just balance
      return setInsufficientFunds(token?.balance < requiredAllowance);
    }
    // Dynamically check balances for ERC1155
    (async function () {
      setIsCheckingBalance(true);
      try {
        // For each distinct token id check balance
        const distinctTokenIds = Object.keys(keyBy(validRecipients, "tokenId"));

        // Pull balances on a per token basis
        const tokenBalances = await readContracts({
          contracts: distinctTokenIds.map((tokenId) => ({
            address: contractAddress,
            abi: erc1155ABI,
            functionName: "balanceOf",
            args: [address!, tokenId],
            enabled: address && contractAddress,
            chainId,
          })),
        })
          .then((data) => data.map(({ result }) => result))
          .then((balances) => zipObject(distinctTokenIds, balances));

        // Get total quantity required for each token id
        const requiredBalances = validRecipients?.reduce((acc, recipient) => {
          if (!acc[recipient?.tokenId]) {
            acc[recipient?.tokenId] = 0n;
          }
          acc[recipient?.tokenId] += recipient.amount;
          return acc;
        }, {});

        setInsufficientFunds(
          mapObject(
            requiredBalances,
            (total, tokenId) => total <= tokenBalances[tokenId]
          ).some((item) => !item)
        );
      } catch (e) {
        console.error(e);
        toast.error("Error while checking balances for ERC1155 tokens");
      } finally {
        setIsCheckingBalance(false);
      }
    })();
  }, [
    JSON.stringify(validRecipients),
    token?.balance,
    requiredAllowance,
    token?.standard,
  ]);

  return {
    isProcessing,
    requiredAllowance,
    isCheckingBalances,
    insufficientFunds,
    hasApprovals:
      isNativeToken ||
      (token?.standard !== "ERC20" && token?.isApprovedForAll) ||
      (token?.standard === "ERC20" && requiredAllowance <= token?.allowance),
    actions: {
      onApprove: async () => {
        try {
          if (!approvalConfig) return;
          setIsProcessing(true);
          const { request } = await prepareWriteContract(approvalConfig);
          const { hash } = await writeContract(request);
          await waitForTransaction({
            hash,
          });
          return true;
        } catch (e) {
          console.error(e);
          return false;
        } finally {
          setIsProcessing(false);
        }
      },
      onAirdrop: async () => {
        try {
          if (!airdropConfig) return false;
          setIsProcessing(true);
          const { request } = await prepareWriteContract(airdropConfig);
          const { hash } = await writeContract(request);
          await waitForTransaction({
            hash,
          });
          return hash;
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

const AirdropModal = ({
  contractAddress = null, // Native tx if null
  recipients = [],
  token,
  isNative = false,
  congratsRenderer = null,
  onClose,
}) => {
  const { chain } = useNetwork();
  const [airdropHash, setAirdropHash] = useState(null);

  const [editableRecipients, setEditableRecipients] = useState(
    recipients.map((recipient) => ({
      ...recipient,
      excluded: false,
    }))
  );

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
    standard,
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
    recipients: editableRecipients,
    token,
  });

  const formattedTotal = useMemo(
    () =>
      requiredAllowance > 0n
        ? standard === "ERC721"
          ? String(requiredAllowance)
          : formatUnits(requiredAllowance, decimals || 18)
        : "0",
    [requiredAllowance, decimals, standard]
  );

  const formattedRemaining = useMemo(() => {
    if (standard === "ERC1155") return "0"; // Ignore remaining
    const remainingBalance = balance - requiredAllowance;
    return remainingBalance
      ? formatUnits(
          BigInt(remainingBalance),
          standard === "ERC721" ? 0 : decimals || 18
        )
      : "0";
  }, [standard, balance, requiredAllowance, editableRecipients.length]);

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

      const airdropHash = await actions.onAirdrop();
      if (!airdropHash) throw new Error("Airdrop unsuccessful");

      setAirdropHash(airdropHash);
    } catch (e) {
      console.error(e);
      toast.error(e.message);
    }
  };

  const onHandleExcludeRecipient = (index) => {
    const currentExclusion = editableRecipients[index].excluded;
    setEditableRecipients((prev) => {
      prev.splice(index, 1, {
        ...prev[index],
        excluded: !currentExclusion,
      });
      return [...prev];
    });
  };

  const totalRecipients = editableRecipients?.reduce(
    (acc, item) => (item.excluded ? 0 : 1) + acc,
    0
  );

  return (
    <div className="flex items-center justify-center fixed top-0 left-0 w-full h-[100dvh] z-[10000]">
      <div className="absolute top-0 left-0 h-full w-full z-[1] bg-white text-black bg-opacity-90" />
      <div className="flex flex-col w-4/5 md:w-1/2 mx-auto bg-white text-black rounded-md border-[2px] border-grey/[.3] z-[2] p-6">
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
                congratsRenderer({
                  token,
                  recipients,
                  isNative,
                })
              ) : (
                <div className="flex flex-col">
                  <p className="text-xl">Your tokens have been sent</p>
                  <a
                    className="underline text-primary my-2"
                    href={deriveExternalLink(airdropHash, chain.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View transaction
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
                Confirm Recipients and{" "}
                {standard === "ERC20"
                  ? "Amounts"
                  : `Token IDs ${standard === "ERC1155" ? "+ amounts" : ""}`}
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
                  data={editableRecipients}
                  onExclude={onHandleExcludeRecipient}
                  symbol={symbol}
                  decimals={decimals}
                  standard={standard}
                />
              </div>
              {token?.standard === "ERC1155" ? (
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
                        if (standard === "ERC721") {
                          return hasApprovals ? (
                            <span>{`Send ${symbol}`}</span>
                          ) : (
                            <span>{`Set Approval for ${symbol}`}</span>
                          );
                        } else if (standard === "ERC1155") {
                          return hasApprovals ? (
                            <span>{`Send tokens`}</span>
                          ) : (
                            <span>{`Set Approvals`}</span>
                          );
                        } else if (isNative) {
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
