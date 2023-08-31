import React, { Dispatch, SetStateAction } from 'react';
import CSVUpload from '../ui/CsvUpload';

interface ICSVContainerProps {
  isERC721: boolean;
  tokenSymbol: string;
  setRecipients: Dispatch<SetStateAction<[string, string][]>>;
  displayModal: () => void;
}

const CSVContainer = (props: ICSVContainerProps) => {
  const { isERC721, tokenSymbol, displayModal, setRecipients } = props;

  return (
    <div className="min-h-fit mt-16">
      <h2 className="title heading mb-2">Recipients and Amounts</h2>

      <h4 className="text-grey mb-8">
        Upload a CSV containing one address and amount of {tokenSymbol} in each
        row
      </h4>

      <CSVUpload
        isERC721={isERC721}
        onUpload={({ data }) => {
          setRecipients(data as [string, string][]);
          displayModal();
        }}
        onReset={() => setRecipients([])}
      />
    </div>
  );
};

export default CSVContainer;
