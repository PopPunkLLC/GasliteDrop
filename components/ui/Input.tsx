import React, { ChangeEvent } from "react";
import { Address } from "wagmi";
import clsx from "clsx";
import {
  FaSpinner as SpinnerIcon,
  FaTimesCircle as ClearIcon,
} from "react-icons/fa";

const Input = ({ onChange, isLoading, value, ...rest }) => {
  return (
    <div
      className={clsx(
        "flex items-center w-full bg-transparent text-base-100 p-4 text-xl rounded-md space-x-1",
        {
          "text-primary cursor-default": rest?.readOnly,
          "border-2 border-neutral-700": !rest?.readOnly,
        }
      )}
    >
      <input
        className="border-none focus:outline-none w-full"
        spellCheck={false}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const address = e.target.value as Address;
          if (address.length > 42) return; // Validate address
          onChange(address);
        }}
        placeholder="0x"
        value={value || ""}
        autoFocus
        {...rest}
      />
      {isLoading && (
        <div className="px-2">
          <SpinnerIcon className="animate-spin" />
        </div>
      )}
      {!isLoading && value && (
        <button
          onClick={() => {
            onChange("");
          }}
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
};

export default Input;
