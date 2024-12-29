import * as React from 'react';
import { CheckboxItemProps } from '../types';

export const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  checked = false,
}) => {
  return (
    <div className="flex gap-2.5">
      <div
        className={`flex shrink-0 my-auto w-3.5 h-3.5 bg-white rounded border border-solid ${
          checked ? 'border-black' : 'border-zinc-800'
        }`}
      />
      <div className="basis-auto">{label}</div>
    </div>
  );
};
