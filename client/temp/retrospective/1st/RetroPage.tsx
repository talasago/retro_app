import * as React from "react";
import { Header } from "./retrospective/components/Header";
import { Footer } from "./retrospective/components/Footer";
import { Card } from "./components/Card";
import { CheckboxItem } from "./components/CheckboxItem";
import { cardData } from "./data/cards";

export const RetroPage: React.FC = () => {
  return (
    <div className="flex overflow-hidden flex-col items-center bg-white">
      <Header />
      <div className="flex flex-col items-center self-stretch px-20 pt-28 pb-16 w-full bg-green-50 max-md:px-5 max-md:pt-24 max-md:max-w-full">
        <div className="flex flex-col max-w-full w-[656px]">
          <div className="flex flex-wrap gap-5 justify-between w-full text-base font-medium whitespace-nowrap text-zinc-800 max-md:max-w-full">
            <CheckboxItem label="ふりかえりの場をつくる" />
            <CheckboxItem label="出来事を思い出す" checked />
            <CheckboxItem label="アイデアを出し合う" checked />
          </div>
          <div className="mt-8 max-w-full w-[433px]">
            <div className="flex gap-5 max-md:flex-col">
              <div className="flex flex-col w-6/12 max-md:ml-0 max-md:w-full">
                <CheckboxItem label="ふりかえりを改善する" />
              </div>
              <div className="flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full">
                <div className="flex flex-col w-full text-base whitespace-nowrap max-md:mt-10">
                  <CheckboxItem label="アクションを決める" checked />
                  <button className="px-14 py-3.5 mt-16 font-bold tracking-wider text-white bg-emerald-500 rounded-[150px] max-md:px-5 max-md:mt-10">
                    ランダム表示
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {[0, 1, 2].map((rowIndex) => (
        <div key={rowIndex} className={`${rowIndex === 0 ? 'mt-16' : 'mt-10'} w-full max-w-[990px] max-md:mt-10 max-md:max-w-full`}>
          <div className="flex gap-5 max-md:flex-col">
            {cardData.slice(rowIndex * 4, (rowIndex + 1) * 4).map((card, index) => (
              <div key={index} className="flex flex-col w-3/12 max-md:ml-0 max-md:w-full">
                <Card {...card} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/242d3d3be378691d2114a03788e3f0a3056de2793a05b0be4159c7c3307033d2?placeholderIfAbsent=true&apiKey=adcdaa0e1cd24da697f74d33e1bb3e3d"
        className="object-contain mt-16 aspect-square w-[74px] max-md:mt-10"
        alt=""
      />
      <Footer />
    </div>
  );
};
</
