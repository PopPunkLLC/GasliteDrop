import React from "react";
import clsx from "clsx";
import { formatUnits } from "viem";
import { MdCheck as CheckIcon, MdClose as CloseIcon } from "react-icons/md";
import { shortenAddress } from "@/components/utils";

interface Recipient {
  address: string;
  amount: bigint;
  tokenId?: string | number;
  excluded?: boolean;
}

interface Props {
  data: Recipient[];
  decimals: number;
  standard: "ERC20" | "ERC721" | "ERC1155";
  onExclude: (idx: number) => void;
}

const RecipientsTable = ({ data, decimals, standard, onExclude }: Props) => {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b-2 border-neutral-700">
          <th className="bg-white text-grey capitalize p-2 sticky top-0 text-left" />
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
      <tbody>
        {data.map(({ address, amount, excluded, tokenId }, idx) => (
          <tr
            key={`${address}_${idx}_${excluded}`}
            className={clsx({ "opacity-50 duration-300 ease-in": excluded })}
          >
            <td className="bg-white text-black p-2 border-t-2 border-neutral-700 text-left">
              <button
                type="button"
                className={clsx({
                  "text-primary": !excluded,
                  "text-grey": excluded,
                })}
                onClick={() => onExclude(idx)}
              >
                {!excluded ? (
                  <CheckIcon className="text-xl" />
                ) : (
                  <CloseIcon className="text-xl" />
                )}
              </button>
            </td>
            <td className="bg-white text-black p-2 border-t-2 border-neutral-700 text-left">
              <span className="hidden md:inline">{address}</span>
              <span className="inline md:hidden">
                {shortenAddress(address, 6)}
              </span>
            </td>
            <td className="bg-white text-black p-2 border-t-2 border-neutral-700 text-right">
              {formatUnits(
                BigInt(
                  standard === "ERC1155"
                    ? tokenId?.toString()
                    : amount?.toString(),
                ),
                standard === "ERC20" ? Number(decimals) : 0,
              )}
            </td>
            {standard === "ERC1155" && (
              <td className="bg-white text-black p-2 border-t-2 border-neutral-700 text-right">
                {formatUnits(BigInt(amount?.toString()), 0)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecipientsTable;
