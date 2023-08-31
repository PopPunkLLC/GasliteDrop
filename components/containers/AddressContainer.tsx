import React, { Dispatch, SetStateAction, useState } from 'react';
import CSVContainer from './CSVContainer';
import MagicTextArea from '../ui/MagicTextArea';

interface Props {
  show: boolean;
  isERC721: boolean;
  tokenSymbol: string;
  displayModal: () => void;
  setRecipients: Dispatch<SetStateAction<[string, string][]>>;
}

const AddressContainer = (props: Props) => {
  const { show, isERC721, tokenSymbol, displayModal, setRecipients } = props;

  const [showCSVUpload, setShowCSVUpload] = useState(false);

  return (() => {
    if (!show) return null;

    if (showCSVUpload) {
      return (
        <>
          <CSVContainer
            isERC721={isERC721}
            tokenSymbol={tokenSymbol!}
            displayModal={displayModal}
            setRecipients={setRecipients}
          />
          <button
            className="text underline text-left mt-4"
            onClick={() => setShowCSVUpload(false)}
          >
            Or paste in addresses
          </button>
        </>
      );
    } else {
      return (
        <>
          <MagicTextArea
            isERC721={isERC721}
            displayModal={displayModal}
            setRecipients={setRecipients}
          />
          <button
            className="underline text-left smallertText text-black"
            onClick={() => setShowCSVUpload(true)}
          >
            Or upload a CSV
          </button>
        </>
      );
    }
  })();
};

export default AddressContainer;
