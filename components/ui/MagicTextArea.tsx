import React, {
  FC,
  useState,
  Dispatch,
  SetStateAction,
  ChangeEvent,
  MouseEvent,
} from 'react';
import { toast } from 'sonner';
import { findDuplicateTokenIds } from '../types/parsers';

interface Props {
  isERC721: boolean;
  displayModal: () => void;
  setRecipients: Dispatch<SetStateAction<[string, string][]>>;
}

const MagicTextArea: FC<Props> = (props: Props) => {
  const { isERC721, displayModal, setRecipients } = props;

  const [textareaValue, setTextareaValue] = useState<string>('');
  const [localRecipients, setLocalRecipients] = useState<[string, string][]>(
    []
  );

  const placeholder = () => {
    if (isERC721) {
      return `0x3a6372B2013f9876a84761187d933DEe0653E377, 4
0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48=420
0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD 69`;
    }

    return `0x3a6372B2013f9876a84761187d933DEe0653E377, 4
0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48=4.20
0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD 4.20
0x1a0ad011913A150f69f6A19DF447A0CfD9551054=690000000000000`;
  };

  const instructions = isERC721
    ? 'Enter an address and a token ID to send. Accepts the following formats:'
    : 'Enter an address and an amount below. Accepts the following formats:';

  const handleERC721 = (value: string) => {
    const regex = /^0x[a-fA-F0-9]{40}[=,\s] *(\d+)$/;
    const lines = value.trim().split('\n');
    const validLines = lines.filter((line) => regex.test(line));

    const addressValueCombos: [string, string][] = [];

    for (let i = 0; i < validLines.length; i++) {
      const matches = validLines[i].match(regex);

      // Address is always the full 42 characters (0x plus 40 hex characters)
      const address = validLines[i].slice(0, 42);

      // Value will be the first capturing group from our regex match
      const val: string = matches![1];

      addressValueCombos.push([address, val]);
    }

    const duplicateIDs = findDuplicateTokenIds(addressValueCombos);
    if (duplicateIDs.length > 0) {
      toast.error(
        `Check your pasted data, duplicate IDs were found for ID${
          duplicateIDs.length === 1 ? '' : 's'
        }: ${duplicateIDs.join(', ')}`
      );
      return;
    }

    if (validLines.length === addressValueCombos.length) {
      setLocalRecipients(addressValueCombos);
    }
  };

  const handleERC20 = (value: string) => {
    const regex = /^0x[a-fA-F0-9]{40}(?= ?[^ ])([=,]?) *(\d+(\.\d+)?)$/;
    const lines = value.split('\n');
    const validLines = lines.filter((line) => regex.test(line));

    const addressValueCombos: [string, string][] = [];

    // Loop through validLines
    for (let i = 0; i < validLines.length; i++) {
      const regex = /(?=[=,\s]\s*\d)/;
      // Split the input on a space, a comma, or an = sign
      const parts: string[] = validLines[i].split(regex);

      // Address is the first element
      const address = parts[0];
      // The unsanitized value to send is the last element
      let val: string = parts[parts.length - 1];
      val = val.replace(/^[^0-9.]+/, '');

      addressValueCombos.push([address, val]);
    }

    if (validLines.length === addressValueCombos.length) {
      setLocalRecipients(addressValueCombos);
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (isERC721) {
      handleERC721(value);
      setTextareaValue(value);
    } else {
      handleERC20(value);
      setTextareaValue(value);
    }
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (localRecipients.length === 0) return;

    setRecipients(localRecipients);
    displayModal();
  };

  return (
    <div className="mt-12">
      <p className="text">{instructions}</p>

      <textarea
        value={textareaValue}
        className="w-full min-h-[300px] max-h-[600px] mt-4 p-3 text-black border-black border-2 rounded-md"
        onChange={handleTextareaChange}
        placeholder={placeholder()}
      />

      <button
        className={`py-4 rounded-md w-full my-4 text-white bg-markPink-900 font-bold tracking-wide ${
          localRecipients.length ? '' : 'opacity-50'
        }`}
        onClick={handleClick}
        disabled={localRecipients.length === 0}
      >
        Continue
      </button>
    </div>
  );
};

export default MagicTextArea;
