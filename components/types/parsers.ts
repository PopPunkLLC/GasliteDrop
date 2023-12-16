import { parseUnits, isAddress } from "viem";
import { Address } from "wagmi";
import z from "zod";

export const recipientsParser = (decimals = 18) =>
  z.preprocess(
    (res) => {
      let arr = res as [string, string][];
      const firstAddress = arr.at(0)?.at(0);

      if (!firstAddress || !isAddress(firstAddress)) {
        arr = arr.slice(1);
      }

      return arr.map(([address, amount]) => ({
        address: address as Address,
        amount: parseUnits(amount, decimals),
      }));
    },
    z.array(
      z.object({
        address: z.coerce.string().startsWith("0x").length(42),
        amount: z.bigint().refine((b) => b >= BigInt(0)),
      })
    )
  );

export const erc721RecipientsParser = () =>
  z.preprocess(
    (res) => {
      let arr = res as [string, string][];
      const firstAddress = arr.at(0)?.at(0);

      if (!firstAddress || !isAddress(firstAddress)) {
        arr = arr.slice(1);
      }

      return arr.map(([address, id]) => ({
        address: address as Address,
        amount: id,
      }));
    },
    z.array(
      z.object({
        address: z.coerce.string().startsWith("0x").length(42),
        amount: z.string().transform((s) => BigInt(s)),
      })
    )
  );

export const erc1155RecipientsParser = () =>
  z.preprocess(
    (res) => {
      let arr = res as [string, string, string][];

      const firstAddress = arr.at(0)?.at(0);

      if (!firstAddress || !isAddress(firstAddress)) {
        arr = arr.slice(1);
      }

      return arr.map(([address, tokenId, amount]) => ({
        address: address as Address,
        tokenId,
        amount,
      }));
    },
    z.array(
      z.object({
        address: z.coerce.string().startsWith("0x").length(42),
        tokenId: z.string().transform((s) => BigInt(s)),
        amount: z.string().transform((s) => BigInt(s)),
      })
    )
  );

// Used for ERC-721
export function findDuplicateTokenIds(data: [string, string][]): number[] {
  const idMap = new Map<number, number>(); // Keeps track of how many times each ID appears
  const duplicateIds: number[] = []; // Stores the IDs that appear more than once

  for (const [, tokenId] of data) {
    const tid = parseInt(tokenId);
    const currentCount = idMap.get(tid) || 0;
    idMap.set(tid, currentCount + 1);
  }

  for (const [tid, count] of idMap.entries()) {
    if (count > 1) {
      duplicateIds.push(tid);
    }
  }

  return duplicateIds;
}
