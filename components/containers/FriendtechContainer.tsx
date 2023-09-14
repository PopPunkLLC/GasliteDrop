import React, {
  Dispatch,
  ChangeEvent,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import { useNetwork } from "wagmi";
import { AirdropRecipient } from "../types/airdrop";
import { ModalSelector } from "../types/modals";
import ConfirmModal from "../ui/modals/ConfirmModal";
import CongratsModal from "../ui/modals/CongratsModal";
import AddressContainer from "./AddressContainer";
import { formatUnits } from "viem";

interface Props {
  allowance?: BigInt;
  balanceData: any;
  errorMessage: string | false;
  formattedTokenBalance: string | undefined;
  isERC721: boolean;
  loadingMessage: string | false;
  openModal: false | ModalSelector;
  parsedRecipients: AirdropRecipient[];
  tokenAddress: `0x${string}`;
  tokenBalance: BigInt | undefined;
  tokenSymbol: string;
  validToken: boolean;
  approveWrite: (() => void) | undefined;
  displayModal: () => void;
  handleTokenAddressChange: (e: ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
  setErrorMessage: Dispatch<SetStateAction<string | false>>;
  setOpenModal: Dispatch<SetStateAction<false | ModalSelector>>;
  setRecipients: Dispatch<SetStateAction<[string, string][]>>;
}

const ERCContainer = (props: Props) => {
  const {
    allowance,
    balanceData,
    errorMessage,
    formattedTokenBalance = undefined,
    isERC721,
    loadingMessage,
    openModal,
    parsedRecipients,
    tokenAddress,
    tokenBalance,
    tokenSymbol,
    validToken,
    approveWrite,
    displayModal,
    handleTokenAddressChange,
    resetForm,
    setErrorMessage,
    setOpenModal,
    setRecipients,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const { chain } = useNetwork();

  const pillStyle =
    "flex items-center border rounded-md md:rounded-full md:inline-block py-2 px-2 md:px-3 text-sm mt-2 min-h-fit";

  const isBalanceZero = tokenBalance === BigInt(0);

  // Focus on the input when rendered
  useEffect(() => inputRef.current?.focus(), []);

  return (
    <div className="container">
      {openModal === "confirm" && (
        <ConfirmModal
          allowance={allowance}
          isERC721={isERC721}
          symbol={tokenSymbol}
          isOpen={openModal === "confirm"}
          setIsOpen={(val) => setOpenModal(val ? "confirm" : false)}
          recipients={parsedRecipients}
          balanceData={balanceData}
          loadingMessage={loadingMessage || undefined}
          errorMessage={errorMessage || undefined}
          setErrorMessage={setErrorMessage}
          onSubmit={() => {
            // If already approved, transfer tokens, else do the approve first
            if (isERC721) {
              try {
                approveWrite?.();
              } catch (error) {
                console.log("ERC-721 Approval Failed: ", error);
              }
            } else {
              try {
                approveWrite?.();
              } catch (error) {
                console.log("ERC-20 Approval Failed: ", error);
              }
            }
          }}
        />
      )}

      {openModal === "congrats" && (
        <div className="absolute top-[65%]">
          <CongratsModal
            isOpen={openModal === "congrats"}
            setIsOpen={(val) => {
              resetForm();
              setOpenModal(val ? "congrats" : false);
            }}
            resetForm={resetForm}
          />
        </div>
      )}

      <div className="flex flex-col text-left whitespace-pre-wrap">
        <h2 className="text-2xl text-base-100 mb-6">
            Enter your Friendtech wallet address:
        </h2>

        <input
          ref={inputRef}
          className="border-2 border-neutral-700 bg-transparent text-base-100 p-4 text-xl rounded-md"
          spellCheck={false}
          value={tokenAddress}
          onChange={handleTokenAddressChange}
          placeholder={"0x"}
        />

        <div className="flex flex-row align-middle gap-2 mt-2">
          <div className={`${pillStyle} border-black text-black`}>
            Friendtech
          </div>

          <div className={`${pillStyle} border-primary text-primary`}>
            {validToken ? (
              <>{`You have ${
                isERC721 ? tokenBalance?.toString() : formattedTokenBalance
              } ${tokenSymbol} to airdrop`}</>
            ) : (
              `Enter a valid token address to see your available balance.`
            )}
          </div>

          {!isBalanceZero && !isERC721 && allowance && (
            <div
              className={`${pillStyle} border-markPink-700 text-markPink-700`}
            >
              Your allowance is set to{" "}
              {formatUnits(
                BigInt(allowance!.toString()),
                balanceData.tokenDecimals
              )}{" "}
              {tokenSymbol}
            </div>
          )}
        </div>

        {(() => {
          if (isBalanceZero) {
            return (
              <p className="mt-8 text-blk-400 border border-white p-4 rounded-md">
                Please make sure you&apos;re connected with the correct wallet
                or top up your balance to perform an airdrop with {tokenSymbol}{" "}
                on {chain?.name}.
              </p>
            );
          } else {
            return (
              <AddressContainer
                show={validToken}
                isERC721={isERC721}
                tokenSymbol={tokenSymbol!}
                displayModal={displayModal}
                setRecipients={setRecipients}
              />
            );
          }
        })()}
      </div>
    </div>
  );
};

export default ERCContainer;
