import { useChainId, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { AirdropRecipient } from '../../types/airdrop';
import { airdropContractAddress} from '../../airdropContractAddress'
import { useAccount } from 'wagmi';
import { abi } from '../../abi';

// Prepares the airdrop
export default function useAirdrop(
  recipients: AirdropRecipient[],
  onPending: () => void,
  onSuccess: () => void,
  onError: (error: string) => void,
) {
  const { address } = useAccount();
  const chainId = useChainId();

  // NOTE: The airdropETH function will airdrop the native token on the corresponding network
  // ex. it'll airdrop MATIC on Polygon, Sepolia ETH on Sepolia, ETH on Mainnet, etc.
  const { config } = usePrepareContractWrite({
    address: airdropContractAddress,
    abi,
    functionName: 'airdropETH',
    args: [
      recipients.map(({ address }) => address),
      recipients.map(({ amount }) => BigInt(amount.toString()))
    ],
    value: recipients.reduce((acc, { amount }) => acc + BigInt(amount.toString()), BigInt(0)),
    enabled: !!address && recipients.length > 0,
    chainId,
  });

  const { data, write } = useContractWrite({
    ...config,
    onSuccess: onPending,
    onError: error => onError(error.message),
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess,
    onError: error => onError(error.message),
    chainId,
  });

  return {
    isLoading,
    data,
    write,
  };
}
