import {
  Address,
  useAccount,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi';
import { AirdropRecipient } from '../../types/airdrop';
import { airdropContractAddress} from '../../airdropContractAddress'
import { abi } from '../../abi';

// Prepares and sends the token
export default function useApproveAirdrop(
  tokenAddress: Address,
  recipients: AirdropRecipient[],
  onPending: () => void,
  onSuccess: () => void,
  onError: (error: string) => void,
  enabled: boolean,
) {
  const { address } = useAccount();
  const chainId = useChainId();

  const { config, error, isError } = usePrepareContractWrite({
    address: airdropContractAddress,
    abi,
    functionName: 'airdropERC721',
    args: [
      tokenAddress,
      recipients.map(({ address }) => address),
      recipients.map(({ amount }) => BigInt(amount.toString())),
    ],
    enabled: !!address && enabled && recipients.length > 0,
    chainId,
  });

  const { data, write } = useContractWrite({
    ...config,
    onSuccess: onPending,
    onError: error => {
      onError(error.message);
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess,
    onError: error => onError(error.message),
    enabled,
    chainId,
  });

  return {
    isLoading,
    data,
    write,
  };
}
