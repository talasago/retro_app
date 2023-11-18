import { memo } from 'react';
import type { FC } from 'react';

import resets from '../../_resets.module.css';
import { Icon_typeNone } from '../Icon_typeNone/Icon_typeNone';
import classes from './Button_sizeDefaultIsDisabledFa.module.css';

interface Props {
  className?: string;
  classes?: {
    buttonIcon?: string;
    root?: string;
  };
  hide?: {
    buttonIcon?: boolean;
  };
}
/* @figmaId 107:484 */
export const Button_sizeDefaultIsDisabledFa: FC<Props> = memo(function Button_sizeDefaultIsDisabledFa(props = {}) {
  return (
    <button
      className={`${resets.storybrainResets} ${props.classes?.root || ''} ${props.className || ''} ${classes.root}`}
    >
      <div className={classes.label}>Button</div>
      {props.hide?.buttonIcon === false && <Icon_typeNone className={props.classes?.buttonIcon || ''} />}
    </button>
  );
});
