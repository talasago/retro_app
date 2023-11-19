import { memo } from 'react';
import type { FC, ReactNode } from 'react';

import resets from '../../_resets.module.css';
import classes from './Button_sizeDefaultIsDisabledFa2.module.css';

interface Props {
  className?: string;
  classes?: {
    root?: string;
  };
  text?: {
    label?: ReactNode;
  };
  name: string;
  email: string;
  password: string;
}
/* @figmaId 107:436 */
export const Button_sizeDefaultIsDisabledFa2: FC<Props> = memo(function Button_sizeDefaultIsDisabledFa2(props) {
  const handleClick = () => {
    console.log('Name:', props.name);
    console.log('Email:', props.email);
    console.log('Password:', props.password);

    // ここでname、emailを使ってHTTPリクエストを送信する処理を実装
  };

  return (
    <button
      onClick={handleClick}
      className={`${resets.storybrainResets} ${props.classes?.root || ''} ${props.className || ''} ${classes.root}`}
    >
      {props.text?.label != null ? props.text?.label : <div className={classes.label}>Button</div>}
    </button>
  );
});
