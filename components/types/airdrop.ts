import { Address } from 'wagmi';

export const AirdropType = {
  ERC20: 'ERC20',
  ERC721: 'ERC721',
  ETH: 'ETH',
  FRIENDTECH: 'FRIENDTECH',
  unset: 'UNSET'
} as const;

export type AirdropTypeEnum = (typeof AirdropType)[keyof typeof AirdropType];

// NOTE: For ERC721 the amount is the ID of the piece to be airdropped
export type AirdropRecipient = {
  address: Address;
  amount: BigInt;
};

export interface IAirdropEthProps {
  contractAddress?: string | null;
  selected: AirdropTypeEnum;
  setContractAddress?: (contractAddress: string | null) => void;
  setSelected: (selected: AirdropTypeEnum) => void;
}
