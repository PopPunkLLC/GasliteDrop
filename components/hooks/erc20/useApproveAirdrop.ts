import { useAccount, useChainId, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { Address, useWaitForTransaction } from 'wagmi';
import { AirdropRecipient } from '../../types/airdrop';
import { airdropContractAddress} from '../../airdropContractAddress'
import { abi } from '../../abi';

// Prepares and sends the tokens
export default function useApproveAirdrop(
  tokenAddress: Address,
  recipients: AirdropRecipient[],
  onPending: () => void,
  onSuccess: () => void,
  onError: (error: string) => void,
) {
  const { address } = useAccount();
  const chainId = useChainId();

  const { config } = usePrepareContractWrite({
    address: airdropContractAddress,
    abi,
    functionName: 'airdropERC20',
    args: [
      tokenAddress,
      recipients.map(({ address }) => address),
      recipients.map(({ amount }) => BigInt(amount.toString())),
      recipients.reduce((acc, { amount }) => acc + BigInt(amount.toString()), BigInt(0)),
    ],
    enabled: !!address && recipients.length > 0,
    chainId,
  });

  const { data, write } = useContractWrite({
    ...config,
    onSuccess: onPending,
    onError: error => {
      onError(error.message);
    },
  })

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess,
    onError: error => onError(error.message),
  });

  return {
    isLoading,
    data,
    write,
  };
}
