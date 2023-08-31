import { Address, erc721ABI, useAccount, useContractRead } from 'wagmi';

// Fetches the relevant metadata of the token at the provided address
export default function useTokenData(tokenAddress: Address) {
  const { address } = useAccount();

  const { data: name, isSuccess: nameSuccess, error: nameError } = useContractRead({
    abi: erc721ABI,
    address: tokenAddress,
    functionName: 'name',
    enabled: !!address,
  });

  const { data: symbol, isSuccess: symbolSuccess, error: symbolError } = useContractRead({
    abi: erc721ABI,
    address: tokenAddress,
    functionName: 'symbol',
    enabled: !!address && !!name
  });

  const { data: balance, isSuccess: balanceOfSuccess, error: balanceOfError } = useContractRead({
    abi: erc721ABI,
    address: tokenAddress,
    functionName: 'balanceOf',
    args: [address!],
    enabled: !!address && !!symbol,
  });

  const { data, error: supportsInterfaceError } = useContractRead({
    abi: [
      {
        inputs: [
          {
            internalType: 'bytes4',
            name: 'interfaceId',
            type: 'bytes4',
          },
        ],
        name: 'supportsInterface',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address: tokenAddress,
    functionName: 'supportsInterface',
    args: ['0x80ac58cd'],
    enabled: !!address && !!name && !!symbol,
  });

  const isERC721: boolean = (supportsInterfaceError) ? false : (data as boolean);

  return {
    name,
    symbol,
    balance,
    isERC721,
    nameSuccess,
    symbolSuccess,
  };
}
