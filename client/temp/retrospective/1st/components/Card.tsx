import * as React from 'react';
import { CardProps } from '../types';

export const Card: React.FC<CardProps> = ({
  title,
  description,
  commentCount,
}) => {
  return (
    <div className="flex flex-col p-8 mx-auto w-full font-medium whitespace-nowrap bg-white rounded-3xl border-2 border-emerald-300 border-solid text-zinc-800 max-md:px-5 max-md:mt-8">
      <div className="self-start text-xl font-bold tracking-widest text-emerald-500">
        {title}
      </div>
      <div className="mt-5 text-base tracking-wider leading-6 max-md:mr-1.5">
        {description}
      </div>
      <div className="flex gap-1.5 self-end mt-8 text-sm tracking-wider text-right">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/af82e856a843c0fb70e6e5de9e55031880adea0139ae2c28eb4452920a1af60b?placeholderIfAbsent=true&apiKey=adcdaa0e1cd24da697f74d33e1bb3e3d"
          className="object-contain shrink-0 my-auto aspect-square w-[18px]"
          alt=""
        />
        <div>コメント({commentCount})</div>
      </div>
    </div>
  );
};
