import React from 'react';
import BaseModal, { IBaseModalProps } from './BaseModal';
import Button from '../Button';

function CongratsModal(props: IBaseModalProps) {
  const { setIsOpen } = props;

  return (
    <BaseModal {...props}>
      <div className="mx-auto text-center mt-8">
        <h1 className="bigText text-black">Congratulations!</h1>
        <p className="heading text-grey mt-2 mb-10">
          Your tokens have been sent <br /> <br />
          Thanks for using Gaslite Drop
        </p>
      </div>

      <Button
        className="bg-markPink-700 rounded-md w-full p-4 tracking-wide font-semibold"
        onClick={() => setIsOpen?.(false)}
      >
        Close
      </Button>
    </BaseModal>
  );
}

export default CongratsModal;
