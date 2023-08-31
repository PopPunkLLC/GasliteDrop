import React, { ReactNode } from 'react';

export interface IBaseModalProps {
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
  isCongrats?: boolean;
  resetForm?: () => void;
  children?: ReactNode;
}

function BaseModal(props: IBaseModalProps) {
  const { children, className, isOpen, setIsOpen, resetForm } = props;

  return (
    <div className="w-screen h-screen absolute z-10 left-[50%] top-[25%] -translate-y-1/3 -translate-x-1/2 bg-white text-black bg-opacity-20 ">
      <div className="w-1/2 mx-auto top-[50%] translate-y-1/4 bg-white text-black rounded-md border-2 border-grey/[.5] px-3 pb-3">
        <input
          type="checkbox"
          id="airdrop-modal"
          className="modal-toggle hidden"
          checked={isOpen}
          onChange={(e) => setIsOpen?.(e.currentTarget.checked)}
        />

        <label htmlFor="airdrop-modal" className="modal cursor-pointer">
          <label
            className={`modal-box relative text-grey ${className ?? ''}`}
            htmlFor=""
          >
            <label
              htmlFor="airdrop-modal"
              className="absolute right-6 top-4 cursor-pointer"
              onClick={() => resetForm?.()}
            >
              ✕
            </label>

            {children}
          </label>
        </label>
      </div>
    </div>
  );
}

export default BaseModal;
