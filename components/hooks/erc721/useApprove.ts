import {
  Address,
  erc721ABI,
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { airdropContractAddress } from '@/components/airdropContractAddress';

// Approves the airdrop
export default function useApprove(
  tokenAddress: Address,
  onPending: () => void,
  onSuccess: () => void,
  onError: (error: string) => void,
  enabled: boolean,
) {
  const { address } = useAccount();
  const chainId = useChainId();

  const { config: approveConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc721ABI,
    functionName: 'setApprovalForAll',
    args: [airdropContractAddress, true],
    enabled,
    chainId,
  });

  const { data, write } = useContractWrite({
    ...approveConfig,
    onSuccess: onPending,
    // onError: error => onError(error.message),
  });

  const { data: isApprovedForAll, refetch } = useContractRead({
    address: tokenAddress,
    abi: erc721ABI,
    functionName: 'isApprovedForAll',
    args: [address!, airdropContractAddress], // the signing wallet, the airdrop contract (operator)
    enabled,
    chainId,
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess,
    onError: error => onError(error.message),
    enabled,
    chainId,
  });

  return {
    isApprovedForAll,
    isLoading,
    data,
    refetch,
    write,
  };
}
