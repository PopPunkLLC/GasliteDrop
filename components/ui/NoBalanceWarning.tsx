import React from "react";
import { MdWarning as WarningIcon } from "react-icons/md";

const NoBalanceWarning = ({ chainName, symbol }) => (
  <div className="flex flex-row items-center space-x-4 bg-markPink-100 bg-opacity-50 border border-markPink-200 py-4 pl-4 pr-6 rounded-md mt-10">
    <WarningIcon className="flex-shrink-0 text-2xl text-primary" />
    <p className="text-primary">
      {`Top up your balance to perform an airdrop with ${symbol} on ${chainName}.`}
    </p>
  </div>
);

export default NoBalanceWarning;
