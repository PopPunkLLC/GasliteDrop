import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  simulateContract,
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import {
  keyBy,
  zipObject,
  map as mapObject,
  groupBy,
  reduce as reduceObject,
} from "lodash";
import { toast } from "sonner";
import { parseAbi } from "viem";
import {
  airdropContractAddress,
  airdrop1155ContractAddress,
} from "@/lib/contracts";
import {
  abi as airdropAbi,
  airdrop1155Abi,
  erc721Abi,
  erc1155Abi,
} from "@/lib/abis";
import { config } from "@/lib/wagmi";

const erc20approveAbi = parseAbi([
  "function approve(address spender, uint256 amount) public",
]);

interface Recipient {
  address: string;
  amount: bigint;
  tokenId?: string | number;
  excluded?: boolean;
}

interface TokenData {
  standard: "ERC20" | "ERC721" | "ERC1155";
  balance: bigint;
  allowance?: bigint;
  isApprovedForAll?: boolean;
}

interface UseTokenDropParams {
  contractAddress: string | null;
  recipients: Recipient[];
  token: TokenData;
}

export const useTokenDrop = ({
  contractAddress,
  recipients,
  token,
}: UseTokenDropParams) => {
  const isNativeToken = !contractAddress;
  const { address, chainId } = useAccount();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingBalances, setIsCheckingBalances] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const validRecipients = recipients.filter((r) => !r.excluded);
  const recipientAddresses = validRecipients.map((r) => r.address);
  const recipientAmounts = validRecipients.map((r) => r.amount);

  const requiredAllowance = useMemo(() => {
    switch (token.standard) {
      case "ERC1155":
        return 0n;
      case "ERC721":
        return BigInt(recipientAmounts.length);
      default:
        return recipientAmounts.reduce((acc, amt) => acc + amt, 0n);
    }
  }, [recipientAmounts, token.standard]);

  const approvalConfig = useMemo(() => {
    if (!contractAddress) return null;
    if (token.standard === "ERC721") {
      return {
        address: contractAddress,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [airdropContractAddress?.[chainId], true],
        chainId,
      };
    }
    if (token.standard === "ERC1155") {
      return {
        address: contractAddress,
        abi: erc1155Abi,
        functionName: "setApprovalForAll",
        args: [airdrop1155ContractAddress?.[chainId], true],
        chainId,
      };
    }
    return {
      address: contractAddress,
      abi: erc20approveAbi,
      functionName: "approve",
      args: [airdropContractAddress?.[chainId], requiredAllowance],
      chainId,
    };
  }, [contractAddress, chainId, token.standard, requiredAllowance]);

  const airdropConfig = useMemo(() => {
    if (contractAddress) {
      if (token.standard === "ERC721") {
        return {
          address: airdropContractAddress?.[chainId],
          abi: airdropAbi,
          functionName: "airdropERC721",
          args: [contractAddress, recipientAddresses, recipientAmounts],
          chainId,
        };
      }
      if (token.standard === "ERC1155") {
        const groups = groupBy(validRecipients, "tokenId");
        const airdropTokens = reduceObject(
          groups,
          (acc, groupRecipients, tokenId) => {
            const amountGroups = groupBy(groupRecipients, "amount");
            acc.push([
              BigInt(tokenId),
              reduceObject(
                amountGroups,
                (innerAcc, recGroup, amt) => {
                  innerAcc.push([BigInt(amt), mapObject(recGroup, "address")]);
                  return innerAcc;
                },
                [],
              ),
            ]);
            return acc;
          },
          [],
        );
        return {
          address: airdrop1155ContractAddress?.[chainId],
          abi: airdrop1155Abi,
          functionName: "airdropERC1155",
          args: [contractAddress, airdropTokens],
          chainId,
        };
      }
      return {
        address: airdropContractAddress?.[chainId],
        abi: airdropAbi,
        functionName: "airdropERC20",
        args: [
          contractAddress,
          recipientAddresses,
          recipientAmounts,
          requiredAllowance,
        ],
        chainId,
      };
    }
    return {
      address: airdropContractAddress?.[chainId],
      abi: airdropAbi,
      functionName: "airdropETH",
      args: [recipientAddresses, recipientAmounts],
      chainId,
      value: requiredAllowance,
    };
  }, [
    contractAddress,
    chainId,
    token.standard,
    recipientAddresses,
    recipientAmounts,
    requiredAllowance,
    validRecipients,
  ]);

  useEffect(() => {
    if (token.standard !== "ERC1155") {
      setInsufficientFunds(token.balance < requiredAllowance);
      return;
    }
    const checkERC1155 = async () => {
      setIsCheckingBalances(true);
      try {
        const distinctIds = Object.keys(keyBy(validRecipients, "tokenId"));
        const results = await Promise.all(
          distinctIds.map(async (tid) => {
            const bal = await readContract({
              address: contractAddress!,
              abi: erc1155Abi,
              functionName: "balanceOf",
              args: [address!, BigInt(tid)],
              chainId,
            });
            return { tokenId: tid, balanceOf: bal };
          }),
        );
        const balances = zipObject(
          distinctIds,
          results.map((r) => r.balanceOf),
        );
        const requiredMap = validRecipients.reduce(
          (acc, r) => {
            acc[r.tokenId!] = (acc[r.tokenId!] || 0n) + r.amount;
            return acc;
          },
          {} as Record<string, bigint>,
        );
        const anyShort = Object.entries(requiredMap).some(([tid, needed]) => {
          const have = balances[tid] || 0n;
          return have < needed;
        });
        setInsufficientFunds(anyShort);
      } catch {
        toast.error("Error checking ERC1155 balances");
      } finally {
        setIsCheckingBalances(false);
      }
    };
    checkERC1155();
  }, [
    token,
    requiredAllowance,
    address,
    chainId,
    contractAddress,
    validRecipients,
  ]);

  return {
    isProcessing,
    isCheckingBalances,
    insufficientFunds,
    requiredAllowance,
    airdropConfig,
    approvalConfig,
    hasApprovals:
      isNativeToken ||
      (token.standard !== "ERC20" && token.isApprovedForAll) ||
      (token.standard === "ERC20" &&
        token.allowance &&
        token.allowance >= requiredAllowance),

    actions: {
      onApprove: async () => {
        if (!approvalConfig) return true;

        setIsProcessing(true);

        try {
          const { request } = await simulateContract(config, {
            account: address!,
            ...approvalConfig,
          });

          const hash = await writeContract(config, request);

          await waitForTransactionReceipt(config, {
            hash,
          });

          return hash;
        } catch (e) {
          console.log(e);
          return false;
        } finally {
          setIsProcessing(false);
        }
      },
      onAirdrop: async () => {
        if (!airdropConfig) return null;

        setIsProcessing(true);

        try {
          const { request } = await simulateContract(config, {
            account: address!,
            ...airdropConfig,
          });

          const hash = await writeContract(config, request);

          await waitForTransactionReceipt(config, {
            hash,
          });

          return hash;
        } catch (e) {
          console.log(e);
          return null;
        } finally {
          setIsProcessing(false);
        }
      },
    },
  };
};

export default useTokenDrop;
