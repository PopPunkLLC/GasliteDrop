import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  KeyboardEvent,
  ClipboardEvent,
  ChangeEvent,
} from 'react';
import { Address, useNetwork } from 'wagmi';
import { AirdropType, IAirdropEthProps } from '../types/airdrop';
import useTokenData from '../hooks/erc20/useTokenData';
import useNetworkNativeToken from '../hooks/networkNativeToken';

const NewProvider = (props: IAirdropEthProps) => {
  const { contractAddress = null, setSelected, setContractAddress } = props;

  const { chain } = useNetwork();
  const { nativeToken } = useNetworkNativeToken();

  const pattern = useMemo(() => /^0x[a-fA-F0-9]{40}$/, []);
  const validChars = useMemo(() => /^[0-9a-fA-Fx]$/, []);

  const inputRef = useRef<HTMLInputElement>(null);

  const [tokenAddress, setTokenAddress] = useState<Address>(
    (contractAddress as Address) || ''
  );

  // Focus on the input when rendered
  useEffect(() => inputRef.current?.focus(), []);

  const {
    name: tokenName,
    symbol: tokenSymbol,
    isERC721,
    nameSuccess,
    symbolSuccess,
  } = useTokenData(tokenAddress);

  useEffect(() => {
    if (!pattern.test(tokenAddress)) return;

    if (isERC721) {
      setSelected(AirdropType.ERC721);
    } else if (tokenName && tokenSymbol) {
      setSelected(AirdropType.ERC20);
    }

    setContractAddress?.(tokenAddress);
  }, [tokenName, tokenSymbol, isERC721]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 32 is the keyCode for space
    if (e.key === ' ' || e.keyCode === 32) {
      e.preventDefault();
      return;
    }

    // Allow backspace and delete keys
    if (e.key === 'Backspace' || e.key === 'Delete') return;

    // Allow paste
    if (e.metaKey && e.key === 'v') return;

    // Check if the key is a valid character for an Ethereum address
    if (!validChars.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const input = e.clipboardData.getData('text');
    if (input.length > 42) return;
  };

  const handleTokenAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // Can't enter past 42 chars
    if (rawInput.length > 42) return;

    const address = rawInput as Address;
    setTokenAddress(address);

    if (!pattern.test(address)) {
      setSelected(AirdropType.unset);
    }

    setContractAddress?.(address);
  };

  const notAContractAddress =
    contractAddress &&
    contractAddress.length > 0 &&
    contractAddress.length === 42 &&
    !nameSuccess &&
    !symbolSuccess;

  return (
    <div className="flex flex-col">
      <p className="mb-2 heading text-grey">Let&apos;s get started!</p>
      <p className="heading mb-8 text-grey">
        Enter an ERC-20 or ERC-721 contract address:
      </p>

      <input
        ref={inputRef}
        className="border-2 border-neutral-700 bg-transparent text-base-100 p-4 text-xl rounded-md placeholder-blk-900 active:border-black focu"
        spellCheck={false}
        value={tokenAddress}
        onChange={handleTokenAddressChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={"0x"}
      />

      <button
        className="text-black text underline text-left mt-4"
        onClick={() => setSelected(AirdropType.ETH)}
      >
        or airdrop {nativeToken}
      </button>

      <button
        className="text-black text underline text-left mt-4"
        onClick={() => setSelected(AirdropType.FRIENDTECH)}
      >
        or airdrop to Friendtech Key holders
      </button>

      {contractAddress &&
        contractAddress.length === 42 &&
        notAContractAddress && (
          <p className="mt-8 text-black border border-grey p-4 rounded-md">
            Oops! That doesn&apos;t look like a valid contract address on{" "}
            {chain?.name}. Double check the address and please try again.
          </p>
        )}
    </div>
  );
};

export default NewProvider;
