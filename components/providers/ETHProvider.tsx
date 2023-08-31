import React, { useState, useMemo, Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { useBalance, useAccount } from 'wagmi';
import AddressContainer from '../containers/AddressContainer';
import useAirdrop from '../hooks/eth/useAirdrop';
import { AirdropRecipient, AirdropTypeEnum } from '../types/airdrop';
import { ModalSelector } from '../types/modals';
import { recipientsParser } from '../types/parsers';
import ConfirmModal from '../ui/modals/ConfirmModal';
import CongratsModal from '../ui/modals/CongratsModal';
import { useNetwork, useChainId } from 'wagmi';
import useNetworkNativeToken from '../hooks/networkNativeToken';

interface Props {
  tokenBalance: BigInt | undefined;
  setSelected: Dispatch<SetStateAction<AirdropTypeEnum>>;
  setContractAddress: Dispatch<SetStateAction<string | null>>;
}

export default function AirdropETH(props: Props) {
  const { tokenBalance, setContractAddress, setSelected } = props;

  const { nativeToken } = useNetworkNativeToken();
  const { chain } = useNetwork();
  const chainId = useChainId();

  const pillStyle =
    'flex items-center border rounded-md md:rounded-full md:inline-block px-4 py-2 md:py-2 md:px-3 text-sm mt-2 min-h-fit';

  const [recipients, setRecipients] = useState<[string, string][]>([]);
  const [openModal, setOpenModal] = useState<ModalSelector | false>(false);
  const [loadingMessage, setLoadingMessage] = useState<string | false>(false);
  const [errorMessage, setErrorMessage] = useState<string | false>(false);

  const displayMessage = (message: string, type?: 'success' | 'error') => {
    if (type === 'error') {
      setLoadingMessage(false);
      setErrorMessage(message);
      toast[type](message);
    } else if (type === 'success') {
      setLoadingMessage(message);
      setErrorMessage(false);
      toast[type](message);
    } else {
      setLoadingMessage(message);
      setErrorMessage(false);
      toast(message);
    }
  };

  const displayModal = () => {
    setOpenModal('confirm');
    setLoadingMessage(false);
    setErrorMessage(false);
  };

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
    onError: (error) => displayMessage(error.message, 'error'),
    chainId,
  });

  const parsedRecipients = useMemo(() => {
    try {
      return (
        recipients.length
          ? recipientsParser(balance?.decimals).parse(recipients)
          : []
      ) as AirdropRecipient[];
    } catch (e) {
      displayMessage((e as Error).message, 'error');
      return [] as AirdropRecipient[];
    }
  }, [balance?.decimals, recipients]);

  const { write: airdropWrite } = useAirdrop(
    parsedRecipients,
    () => displayMessage('Airdrop transaction pending...'),
    function onSuccess() {
      displayMessage('Airdrop transaction successful!', 'success');
      setOpenModal('congrats');
    },
    function onError(error: string) {
      displayMessage(error, 'error');
    }
  );

  const isBalanceZero = tokenBalance === BigInt(0);

  const resetForm = () => {
    setSelected('UNSET');
    setRecipients([]);
    setContractAddress?.('');
  };

  return (
    <div className="container">
      {openModal === 'confirm' && (
        <ConfirmModal
          isOpen={openModal === 'confirm'}
          setIsOpen={(val) => setOpenModal(val ? 'confirm' : false)}
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
              console.log('ETH: ', error);
            }
          }}
        />
      )}

      {openModal === 'congrats' && (
        <div className="absolute top-[65%]">
          <CongratsModal
            isOpen={openModal === 'congrats'}
            setIsOpen={(val) => {
              resetForm();
              setOpenModal(val ? 'congrats' : false);
            }}
            resetForm={resetForm}
          />
        </div>
      )}

      <div className="flex flex-col text-left whitespace-pre-wrap">
        <h2 className="bigText black">Airdrop {nativeToken}</h2>

        <div className="flex flex-row gap-3">
          <div className={`${pillStyle} border-black text-black`}>
            {nativeToken}
          </div>

          <div className={`${pillStyle} border-primary text-primary`}>
            You have {balance?.formatted} {nativeToken} to airdrop
          </div>
        </div>

        {(() => {
          if (isBalanceZero) {
            return (
              <p className="mt-8 text-blk-400 border border-white p-4 rounded-md">
                Please make sure you&apos;re connected with the correct wallet
                or top up your balance to perform an airdrop with {nativeToken}{' '}
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
              />
            );
          }
        })()}
      </div>
    </div>
  );
}
