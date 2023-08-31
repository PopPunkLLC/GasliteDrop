import {
  Address,
  erc20ABI,
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { airdropContractAddress } from '@/components/airdropContractAddress';

// Approves the airdrop
export default function useApproveAllowance(
  tokenAddress: Address,
  amount: BigInt,
  onPending: () => void,
  onSuccess: () => void,
  onError: (error: string) => void,
) {
  const { address } = useAccount();
  const chainId = useChainId();

  const { config: approveConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [airdropContractAddress, BigInt(amount.toString())],
    enabled: Boolean(tokenAddress),
    chainId,
  });

  const { data, write } = useContractWrite({
    ...approveConfig,
    onSuccess: onPending,
    // onError: error => onError(error.message),
  });

  const { data: allowance } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, airdropContractAddress],
    chainId,
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess,
    onError: error => onError(error.message),
    chainId,
  });

  return {
    allowance,
    data,
    isLoading,
    write,
  };
}
