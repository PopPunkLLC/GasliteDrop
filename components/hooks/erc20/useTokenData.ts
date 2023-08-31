import {
  Address,
  erc20ABI,
  useAccount,
  useChainId,
  useContractRead
} from 'wagmi';

// Fetches the relevant metadata of the token at the provided address
export default function useTokenData(tokenAddress: Address) {
  const { address } = useAccount();
  const chainId = useChainId();

  const { data: name, isSuccess: nameSuccess, error: nameError, } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'name',
    enabled: !!address,
    chainId,
  });

  const { data: symbol, isSuccess: symbolSuccess, error: symbolError } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'symbol',
    chainId,
    enabled: !!name && !!address,
  });

  const { data: balance, isSuccess: balanceOfSuccess, error: balanceOfError } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address!],
    enabled: !!name && !!symbol && !!address,
    chainId,
  });

  const {
    data: decimals,
    error: decimalsError,
    status,
  } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'decimals',
    enabled: !!name && !!symbol && !!address,
    chainId,
  });

  const isERC721 = (!!decimalsError) ? true : false;

  return {
    balance,
    decimals,
    decimalsError,
    isERC721,
    name,
    status,
    symbol,
    nameSuccess,
    symbolSuccess,
  };
}
