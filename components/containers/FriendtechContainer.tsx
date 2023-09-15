import React, {
  Dispatch,
  ChangeEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { toast } from "sonner";
import { useChainId, useNetwork } from "wagmi";
import { useBalance, useAccount } from "wagmi";
import { AirdropRecipient } from "../types/airdrop";
import { ModalSelector } from "../types/modals";
import { recipientsParser } from "../types/parsers";
import ConfirmModal from "../ui/modals/ConfirmModal";
import CongratsModal from "../ui/modals/CongratsModal";
import AddressContainer from "./AddressContainer";
import useAirdrop from "../hooks/eth/useAirdrop";
import { formatUnits } from "viem";
import useNetworkNativeToken from "../hooks/networkNativeToken";

interface Props {
  holders: string[];  
  allowance?: BigInt;
  errorMessage: string | false;
  isERC721: boolean;
  loadingMessage: string | false;
  openModal: false | ModalSelector;
  displayModal: () => void;
  handleTokenAddressChange: (e: ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
  setErrorMessage: Dispatch<SetStateAction<string | false>>;
  setOpenModal: Dispatch<SetStateAction<false | ModalSelector>>;
  setRecipients: Dispatch<SetStateAction<[string, string][]>>;
}

const FriendtechContainer = (props: Props) => {
  const {
    holders,
    isERC721,
    displayModal,
    handleTokenAddressChange,
    resetForm,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const [recipients, setRecipients] = useState<[string, string][]>([]);
  const [openModal, setOpenModal] = useState<ModalSelector | false>(false);
  const [loadingMessage, setLoadingMessage] = useState<string | false>(false);
  const [errorMessage, setErrorMessage] = useState<string | false>(false);

  const displayMessage = (message: string, type?: "success" | "error") => {
    if (type === "error") {
      setLoadingMessage(false);
      setErrorMessage(message);
      toast[type](message);
    } else if (type === "success") {
      setLoadingMessage(message);
      setErrorMessage(false);
      toast[type](message);
    } else {
      setLoadingMessage(message);
      setErrorMessage(false);
      toast(message);
    }
  };

  const { nativeToken } = useNetworkNativeToken();

  const { data: balance } = useBalance({
    address: address,
    onError: (error) => displayMessage(error.message, "error"),
    chainId,
  });

  const { chain } = useNetwork();

  const parsedRecipients = useMemo(() => {
    try {
      return (
        recipients.length
          ? recipientsParser(balance?.decimals).parse(recipients)
          : []
      ) as AirdropRecipient[];
    } catch (e) {
      displayMessage((e as Error).message, "error");
      return [] as AirdropRecipient[];
    }
  }, [balance?.decimals, recipients]);

  const { write: airdropWrite } = useAirdrop(
    parsedRecipients,
    () => displayMessage("Airdrop transaction pending..."),
    function onSuccess() {
      displayMessage("Airdrop transaction successful!", "success");
      setOpenModal("congrats");
    },
    function onError(error: string) {
      displayMessage(error, "error");
    }
  );

  const pillStyle =
    "flex items-center border rounded-md md:rounded-full md:inline-block py-2 px-2 md:px-3 text-sm mt-2 min-h-fit";

  // Focus on the input when rendered
  useEffect(() => inputRef.current?.focus(), []);

  return (
    <div className="container">
      {openModal === "confirm" && (
        <ConfirmModal
          isOpen={openModal === "confirm"}
          setIsOpen={(val) => setOpenModal(val ? "confirm" : false)}
          symbol="ETH"
          recipients={parsedRecipients}
          balanceData={balance}
          loadingMessage={loadingMessage ? loadingMessage : undefined}
          errorMessage={errorMessage ? errorMessage : undefined}
          setErrorMessage={setErrorMessage}
          onSubmit={() => {
            try {
              airdropWrite?.();
            } catch (error) {
              console.log("ETH: ", error);
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
          onChange={handleTokenAddressChange}
          placeholder={"0x"}
        />

        <div className="flex flex-row align-middle gap-2 mt-2">
          <div className={`${pillStyle} border-black text-black`}>
            Friendtech
          </div>

          <div className={`${pillStyle} border-primary text-primary`}>
            {holders ? (
              <>{`You have ${
                holders.length > 0 ? holders.length : "0"
              } key holders to airdrop to`}</>
            ) : (
              `Enter your friendtech wallet address to airdrop.`
            )}
          </div>
        </div>

        {(() => {
          if (!holders || holders.length === 0) {
            return (
              <p className="mt-8 text-blk-400 border border-white p-4 rounded-md">
                Please enter your Friendtech wallet address to perform an airdrop with {nativeToken}{" "}
                on {chain?.name}.
              </p>
            );
          } else {
            return (
              <AddressContainer
                show={isConnected}
                isERC721={false}
                tokenSymbol="ETH"
                displayModal={displayModal}
                setRecipients={setRecipients}
                holderAddresses={holders}
              />
            );
          }
        })()}
      </div>
    </div>
  );
};

export default FriendtechContainer;
