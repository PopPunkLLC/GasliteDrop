import React, { ReactNode, ComponentProps } from 'react';

type IButtonProps = {
  children: ReactNode;
  className?: string;
} & ComponentProps<'button'>;

export default function Button(props: IButtonProps) {
  const { children, className, ...rest } = props;

  let baseButtonClasses =
    'bg-markPink-700 font-medium spacing-wide py-4 rounded-md text-white backdrop-blur w-full capitalize';

  return (
    <button
      {...rest}
      className={`${baseButtonClasses} bg-primary hover:bg-markPink-700/[.85] active:bg-markPink-700/[.92] ${
        className || ''
      }`}
    >
      {children}
    </button>
  );
}
