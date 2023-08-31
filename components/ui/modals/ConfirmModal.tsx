import React, { useMemo, Dispatch, SetStateAction } from 'react';
import { FetchBalanceResult } from 'wagmi/actions';
import { AirdropRecipient } from '../../types/airdrop';
import Button from '../Button';
import BaseModal, { IBaseModalProps } from './BaseModal';
import cls from '../classesUtil';
import { formatUnits } from 'viem';

type IModalProps = IBaseModalProps & {
  allowance?: BigInt;
  isApprovedForAll?: boolean;
  isERC721?: boolean;
  symbol: string;
  balanceData?: Partial<
    Pick<FetchBalanceResult, 'decimals' | 'value' | 'symbol'>
  >;
  recipients?: AirdropRecipient[];
  formattedBalance?: string;
  loadingMessage?: string;
  errorMessage?: string;
  setErrorMessage: Dispatch<SetStateAction<string | false>>;
  onSubmit?: () => void;
};

export function ConfirmModal({
  allowance,
  isApprovedForAll = false,
  isERC721 = false,
  recipients = [],
  balanceData = {},
  loadingMessage,
  errorMessage,
  isOpen,
  onSubmit,
  setErrorMessage,
  ...props
}: IModalProps) {
  const {
    decimals = 18,
    value: balance = BigInt(0),
    symbol = '',
  } = balanceData;

  const total = useMemo(
    () =>
      recipients.reduce((acc, { amount }) => {
        const a = BigInt(acc.toString());
        const b = BigInt(amount.toString());

        return a + b;
      }, BigInt(0)),
    [recipients]
  );

  const yourBalance = formatUnits(balance, isERC721 ? 0 : decimals);

  // Use this to pipe into a BigNumber, will work with decimals for ETH/ERC-20
  const remainingBalance: string = isERC721
    ? (parseInt(formatUnits(balance, 0)) - recipients.length).toString()
    : (balance - total).toString();

  // Use for ETH/ERC-20
  const formattedRemainingBalance = formatUnits(balance - total, decimals);

  const insufficientBalance: boolean = BigInt(remainingBalance) < 0;

  const disableButton = !!(
    insufficientBalance ||
    loadingMessage ||
    errorMessage
  );

  const buttonMessage = insufficientBalance
    ? 'Insufficient Tokens'
    : errorMessage ?? loadingMessage;

  const yourTotal: string = isERC721
    ? recipients.length.toString()
    : formatUnits(total, decimals);

  const formattedTotal = formatUnits(total, isERC721 ? 0 : decimals);

  const addressAndAmountStyle =
    'capitalize bg-transparent text-black bg-white p-3 border-t-2 border-neutral-700';

  const columnHeadersStyle = 'bg-white text-grey capitalize p-3 sticky top-0';

  return (
    <BaseModal
      {...props}
      isOpen={!!loadingMessage || isOpen}
      className="sm:w-1/2 max-w-5xl p-0 font-normal"
    >
      <div className="pt-4 px-10 pb-2">
        <h1 className="heading text-black">
          Confirm Recipients and {isERC721 ? 'Token IDs' : 'Amounts'}
        </h1>
        <h4 className="text text-grey my-2">
          Make sure everything looks good below before you send your{' '}
          {symbol ?? 'your token'}
        </h4>
      </div>

      <div className="pt-4 px-10">
        <div
          className="w-full border-2 border-neutral-700 bg-transparent rounded-lg border-separate border-spacing-0 overflow-auto"
          style={{ height: 'calc(50vh - 5em)' }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-neutral-700">
                <th className={cls(columnHeadersStyle, 'text-left')}>
                  Recipient
                </th>
                <th className={cls(columnHeadersStyle, 'text-right')}>
                  {isERC721 ? 'Token ID' : 'Amount'}
                </th>
              </tr>
            </thead>

            <tbody className="overflow-auto">
              {recipients.map((recipient, index) => (
                <tr key={recipient.address + index}>
                  <td className={cls(addressAndAmountStyle, 'text-left')}>
                    {recipient.address}
                  </td>
                  <td className={cls(addressAndAmountStyle, 'text-right')}>
                    {formatUnits(
                      BigInt(recipient.amount?.toString()),
                      isERC721 ? 0 : decimals
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 mt-4 text">
          <ConfirmModalRow
            title="Beginning balance"
            value={yourBalance}
            symbol={symbol}
          />

          <ConfirmModalRow
            title="Total to send"
            value={yourTotal}
            symbol={symbol}
          />

          <ConfirmModalRow
            title="Remaining"
            value={isERC721 ? remainingBalance : formattedRemainingBalance}
            symbol={symbol}
            critical={insufficientBalance}
          />
        </div>
      </div>

      <div className="p-4 px-10">
        <Button
          onClick={() => {
            if (disableButton) {
              // Clear the error
              setErrorMessage(false);
            } else {
              onSubmit?.();
            }
            // !disableButton && onSubmit?.()
          }}
          disabled={insufficientBalance}
          className={cls(
            '',
            loadingMessage ? 'loading' : false,
            insufficientBalance ? '!text-base-100/75' : false
          )}
        >
          {buttonMessage ? (
            buttonMessage.slice(0, 100)
          ) : (
            <div className="flex flex-row items-center font-bold tracking-wide">
              <div className="mx-auto flex flex-row items-center">
                {(() => {
                  if (isERC721) {
                    return isApprovedForAll ? (
                      <p className="ml-2">{`Send ${recipients.length} ${symbol}`}</p>
                    ) : (
                      <p className="ml-2">{`Set Approval for ${symbol}`}</p>
                    );
                  } else if (symbol === 'ETH') {
                    return (
                      <p className="ml-2">{`Send ${formattedTotal} ${symbol}`}</p>
                    );
                  } else {
                    return BigInt(allowance?.toString() ?? 0) >= total ? (
                      <p className="ml-2">{`Send ${formattedTotal} ${symbol}`}</p>
                    ) : (
                      <p className="ml-2">{`Approve ${formattedTotal} ${symbol}`}</p>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </Button>
      </div>
    </BaseModal>
  );
}

export default ConfirmModal;

interface Props {
  title: string;
  value: string;
  symbol: string;
  critical?: boolean;
}

const ConfirmModalRow = (props: Props) => {
  const { title, value, symbol, critical = false } = props;

  return (
    <span className="flex flex-row font-normal">
      <p className="text-grey text mr-auto">{title}:</p>
      <p className={`${critical ? 'text-critical' : 'text-black'}`}>
        {value} {symbol}
      </p>
    </span>
  );
};
