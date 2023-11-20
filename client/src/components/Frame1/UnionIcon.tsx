import { memo, SVGProps } from 'react';

const UnionIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg preserveAspectRatio='none' viewBox='0 0 62 53' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M38.4007 52.5483C38.5392 52.7877 38.7951 52.9352 39.0721 52.9352H45.1029C45.6996 52.9352 46.0726 52.2904 45.7742 51.7747L23.8677 13.9062C23.5693 13.3904 22.8233 13.3904 22.525 13.9062L19.3056 19.4713C19.2933 19.4925 19.2933 19.5186 19.3056 19.5398L19.3095 19.5465C19.3342 19.5892 19.3033 19.6425 19.2539 19.6425C19.231 19.6425 19.2098 19.6547 19.1983 19.6745L0.614949 51.813C0.316703 52.3287 0.689688 52.9733 1.28638 52.9733H29.5335C30.1302 52.9733 30.5032 52.3286 30.2048 51.8128L27.3154 46.8181C27.177 46.5787 26.921 46.4313 26.6441 46.4313H12.1967C11.8983 46.4313 11.7118 46.1089 11.861 45.851L22.858 26.8412C23.0072 26.5833 23.3802 26.5833 23.5294 26.8412L38.4007 52.5483Z'
      fill='#40AABF'
    />
    <path
      d='M27.3228 5.61237C27.1844 5.85175 27.1844 6.14667 27.3228 6.38605L54.0273 52.5483C54.1658 52.7877 54.4217 52.9352 54.6986 52.9352H60.7136C61.3104 52.9352 61.6834 52.2904 61.385 51.7747L31.6731 0.413485C31.3747 -0.102306 30.6287 -0.102305 30.3303 0.413486L27.3228 5.61237Z'
      fill='#40AABF'
    />
  </svg>
);
const Memo = memo(UnionIcon);
export { Memo as UnionIcon };
