import React from "react";

interface Props {
  title: string;
  value: string | number;
  symbol: string;
  critical?: boolean;
}

const AirdropDetail = ({ title, value, symbol, critical = false }: Props) => {
  return (
    <div className="flex flex-row w-full justify-between font-normal">
      <span className="text-grey mr-auto">{title}:</span>
      <span className={critical ? "text-critical" : "text-black"}>
        {value} {symbol}
      </span>
    </div>
  );
};

export default AirdropDetail;
