import { memo } from 'react';
import type { FC, ReactNode } from 'react';

import resets from '../../_resets.module.css';
import { Icon_typeNone } from '../Icon_typeNone/Icon_typeNone';
import classes from './Button_sizeDefaultIsDisabledFa2.module.css';

interface Props {
  className?: string;
  classes?: {
    root?: string;
  };
  text?: {
    label?: ReactNode;
  };
}
/* @figmaId 107:436 */
export const Button_sizeDefaultIsDisabledFa2: FC<Props> = memo(function Button_sizeDefaultIsDisabledFa2(props = {}) {
  return (
    <button
      className={`${resets.storybrainResets} ${props.classes?.root || ''} ${props.className || ''} ${classes.root}`}
    >
      {props.text?.label != null ? props.text?.label : <div className={classes.label}>Button</div>}
    </button>
  );
});
