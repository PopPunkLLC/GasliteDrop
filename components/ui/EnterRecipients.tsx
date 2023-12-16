import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import {
  erc1155RecipientsParser,
  erc721RecipientsParser,
  recipientsParser,
} from "@/components/types/parsers";
import CSVUpload from "@/components/ui/CsvUpload";

const erc721RecipientPlaceholder = `0x3a6372B2013f9876a84761187d933DEe0653E377, 4
0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48=420
0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD 69`;

const erc20RecipientPlaceholder = `0x3a6372B2013f9876a84761187d933DEe0653E377, 4
0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48=4.20
0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD 4.20
0x1a0ad011913A150f69f6A19DF447A0CfD9551054=690000000000000`;

const erc1155RecipientPlaceholder = `0x3a6372B2013f9876a84761187d933DEe0653E377, 0, 1
0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD 69 1`;

// Tuple
const parseERC20Text = (text): [string, string][] => {
  const regex = /^0x[a-fA-F0-9]{40}(?= ?[^ ])([=,]?) *(\d*(\.\d*)?)$/;
  const lines = text.trim().split("\n");
  const validLines = lines.filter((line) => regex.test(line));
  return validLines.reduce((acc, line) => {
    let [address, value] = line.split(",");
    value = value?.replace(/^[^0-9.]+/, "");
    // add 0 for straight decimal value
    if (value?.startsWith(".")) {
      value = `0${value}`;
    }
    acc.push([address, value]);
    return acc;
  }, []);
};

// Tuple
const parseERC721Text = (text): [string, string][] => {
  const regex = /^0x[a-fA-F0-9]{40}[=,\s] *(\d+)$/;
  const lines = text.trim().split("\n");
  const validLines = lines.filter((line) => regex.test(line));
  return validLines.reduce((acc, line) => {
    let [, value] = line.match(regex);
    // Address is always the full 42 characters (0x plus 40 hex characters)
    const address = line.slice(0, 42);
    acc.push([address, value]);
    return acc;
  }, []);
};

// Triplet
const parseERC1155Text = (text): [string, string, string][] => {
  const regex = /^0x[a-fA-F0-9]{40}[,\s] *(\d+)[,\s] *(\d+)$/;
  const lines = text.trim().split("\n");
  const validLines = lines.filter((line) => regex.test(line));
  return validLines.reduce((acc, line) => {
    let [, tokenId, value] = line.match(regex);
    // Address is always the full 42 characters (0x plus 40 hex characters)
    const address = line.slice(0, 42);
    acc.push([address, tokenId, value]);
    return acc;
  }, []);
};

const standardToContent = {
  ERC20: {
    help: "Enter addresses and amounts. Accepts the following formats:",
    placeholder: erc20RecipientPlaceholder,
  },
  ERC1155: {
    help: "Enter addresses, token ID, and amount to send. Accepts the following formats:",
    placeholder: erc1155RecipientPlaceholder,
  },
  ERC721: {
    help: "Enter addresses and a token ID to send. Accepts the following formats:",
    placeholder: erc721RecipientPlaceholder,
  },
};

const EnterRecipients = ({ standard, symbol, decimals, onSubmit }) => {
  const [recipients, setRecipients] = useState([]);
  const [isCsvUpload, setCsvUpload] = useState(false);
  const [textValue, setTextValue] = useState<String>("");

  const parseText = useCallback(
    (text) => {
      if (standard === "ERC20") {
        return recipientsParser(Number(decimals)).parse(parseERC20Text(text));
      } else if (standard === "ERC1155") {
        return erc1155RecipientsParser().parse(parseERC1155Text(text));
      } else if (standard === "ERC721") {
        return erc721RecipientsParser().parse(parseERC721Text(text));
      }
    },
    [standard, decimals]
  );

  useEffect(() => {
    if (textValue) {
      try {
        setRecipients(parseText(textValue));
      } catch (e) {
        setRecipients([]);
        toast.error("There was an error parsing addresses");
      }
    }
  }, [textValue]);

  const onHandleUpload = ({ data }) => {
    if (!data?.length) {
      toast.error(
        "There was an error parsing the CSV file. Please fix try again!"
      );
      return setRecipients([]);
    }

    let csvText;

    // Process csv data back into string and validate lines
    if (standard === "ERC1155") {
      csvText = data
        .map(
          ([address, tokenId, amount]) =>
            `${address}${tokenId ? `, ${tokenId}` : ""}${
              amount ? `, ${amount}` : ""
            }`
        )
        .join("\n");
    } else {
      csvText = data
        .map(([address, amount]) => `${address}${amount ? `, ${amount}` : ""}`)
        .join("\n");
    }

    // Set text if they want to manually edit the csv
    setTextValue(csvText);
    onSubmit(parseText(csvText));
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <h2 className="text-sm">{standardToContent[standard]?.help}</h2>
      <div className="flex flex-col w-full">
        {isCsvUpload ? (
          <div className="min-h-fit mt-2 space-y-2">
            <h2 className="text-xl text-black">Recipients and Amounts</h2>
            <h4 className="text-grey text-sm">
              Upload a CSV containing one address and amount of {symbol} in each
              row
            </h4>
            <CSVUpload
              standard={standard}
              onUpload={onHandleUpload}
              onReset={() => {
                setRecipients([]);
              }}
            />
          </div>
        ) : (
          <div className="min-h-fit mt-2 space-y-2">
            <textarea
              value={textValue}
              className="w-full min-h-[200px] max-h-[400px] p-3 text-black border-black border-2 rounded-md"
              onChange={(e) => {
                setTextValue(e.target.value);
              }}
              placeholder={standardToContent[standard]?.placeholder}
            />
            <button
              type="button"
              className={clsx(
                "py-4 rounded-md w-full my-4 text-white bg-markPink-900 font-bold tracking-wide",
                {
                  "opacity-30 cursor-not-allowed": recipients.length === 0,
                }
              )}
              onClick={() => {
                onSubmit(recipients);
              }}
              disabled={recipients.length === 0}
            >
              Continue
            </button>
          </div>
        )}
        <div className="flex flex-row items-center justify-between mt-1">
          {isCsvUpload ? (
            <button
              className="underline hover:text-primary"
              onClick={() => {
                setCsvUpload(false);
              }}
            >
              or paste in addresses
            </button>
          ) : (
            <button
              className="underline hover:text-primary"
              onClick={() => {
                setCsvUpload(true);
              }}
            >
              or upload a CSV
            </button>
          )}
          {recipients?.length > 0 && (
            <div className="flex justify-end text-xs pt-1">
              <span>{recipients?.length} addresses</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterRecipients;
