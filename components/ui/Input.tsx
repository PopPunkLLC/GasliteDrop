import React, { ChangeEvent } from "react";
import { Address } from "wagmi";
import clsx from "clsx";
import {
  FaSpinner as SpinnerIcon,
  FaTimesCircle as ClearIcon,
} from "react-icons/fa";

const Input = ({ containerClassName, onChange, isLoading, value, ...rest }) => {
  return (
    <div
      className={clsx(
        "flex items-center w-full bg-transparent text-base-100 p-4 text-lg rounded-md space-x-1",
        {
          "text-primary cursor-default": rest?.readOnly,
          "border-2 border-neutral-700": !rest?.readOnly,
        },
        containerClassName
      )}
    >
      <input
        className="border-none focus:outline-none w-full"
        spellCheck={false}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
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
