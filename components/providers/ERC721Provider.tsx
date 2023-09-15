import React, { useState, useMemo, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { Address } from 'wagmi';
import ERCContainer from '../containers/ERCContainer';
import useApprove from '../hooks/erc721/useApprove';
import useApproveAirdrop from '../hooks/erc721/useApproveAirdrop';
import useTokenData from '../hooks/erc721/useTokenData';
import { AirdropRecipient, IAirdropEthProps } from '../types/airdrop';
import { ModalSelector } from '../types/modals';
import { erc721RecipientsParser } from '../types/parsers';

export default function ERC721(props: IAirdropEthProps) {
  const { contractAddress = null, setSelected, setContractAddress } = props;

  // tokenAddress is the contract token address (e.g. the OKPC contract)
  const [tokenAddress, setTokenAddress] = useState<Address>(
    (contractAddress as Address) || ''
  );
  const [recipients, setRecipients] = useState<[string, string][]>([]);
  const [openModal, setOpenModal] = useState<ModalSelector>('');
  const [loadingMessage, setLoadingMessage] = useState<string | false>(false);
  const [errorMessage, setErrorMessage] = useState<string | false>(false);

  const pattern = useMemo(() => /^0x[a-fA-F0-9]{40}$/, []);

  const displayMessage = (message: string, type?: 'success' | 'error') => {
    const errorMsg = type === 'error' ? message : false;
    setErrorMessage(errorMsg);

    const loadingMsg = type === 'error' ? false : message;
    setLoadingMessage(loadingMsg);

    type === 'success' || type === 'error'
      ? toast[type](message)
      : toast(message);
  };

  const displayModal = () => {
    setOpenModal('confirm');
    setLoadingMessage(false);
    setErrorMessage(false);
  };

  const {
    name: tokenName,
    symbol: tokenSymbol,
    balance: tokenBalance,
    isERC721,
    nameSuccess,
    symbolSuccess,
  } = useTokenData(tokenAddress);

  // const tokenName = 'fake';
  // const tokenSymbol = 'fake';
  // const tokenBalance = BigNumber.from('1');
  // const isERC721 = true;

  const balanceData = useMemo(
    () => ({
      name: tokenName,
      symbol: tokenSymbol,
      value: tokenBalance,
      isERC721,
    }),
    [tokenName, tokenSymbol, tokenBalance, isERC721]
  );

  // Switch over to ERC-20 if the contract entered is a 20
  if (
    tokenAddress &&
    balanceData.name &&
    balanceData.symbol &&
    !balanceData.isERC721
  ) {
    setSelected('ERC20');
    setContractAddress?.(tokenAddress);
  }

  const parsedRecipients = useMemo(() => {
    try {
      return (
        recipients.length ? erc721RecipientsParser().parse(recipients) : []
      ) as AirdropRecipient[];
    } catch (e) {
      displayMessage((e as Error).message, 'error');
      return [] as AirdropRecipient[];
    }
  }, [recipients]);

  // Send the tokens
  const { write: airdropWrite } = useApproveAirdrop(
    tokenAddress,
    parsedRecipients,
    () => displayMessage('Airdrop transaction pending...'),
    function onSuccess() {
      displayMessage('Airdrop transaction successful!', 'success');
      setOpenModal('congrats');
    },
    function onError(error) {
      displayMessage(error, 'error');
    },
    !!tokenName && !!tokenSymbol && isERC721 && parsedRecipients.length > 0
  );

  // Approve
  const { write: approveWrite, isApprovedForAll } = useApprove(
    tokenAddress,
    () => displayMessage('Approval transaction pending...'),
    function onSuccess() {
      displayMessage('Approval transaction submitted!', 'success');
      airdropWrite?.();
    },
    function onError(error) {
      displayMessage(error, 'error');
    },
    !!tokenName && !!tokenSymbol && isERC721
  );

  const handleTokenAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    if (rawInput.length > 42) return;

    const address = rawInput as Address;
    setTokenAddress(address);
    setContractAddress?.(address);

    if (!pattern.test(rawInput)) {
      setSelected('UNSET');
    }
  };

  const validToken = tokenName && tokenSymbol ? true : false;

  const resetForm = () => {
    setSelected('UNSET');
    setRecipients([]);
    setContractAddress?.('');
  };

  return (
    <ERCContainer
      balanceData={balanceData}
      errorMessage={errorMessage}
      formattedTokenBalance={undefined}
      isERC721={true}
      loadingMessage={loadingMessage}
      openModal={openModal}
      parsedRecipients={parsedRecipients}
      tokenAddress={tokenAddress}
      tokenBalance={tokenBalance}
      tokenSymbol={tokenSymbol || ''}
      validToken={validToken}
      approveWrite={approveWrite}
      displayModal={displayModal}
      handleTokenAddressChange={handleTokenAddressChange}
      resetForm={resetForm}
      setErrorMessage={setErrorMessage}
      setOpenModal={setOpenModal}
      setRecipients={setRecipients}
    />
  );
}
