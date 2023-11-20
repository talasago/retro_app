import { memo } from 'react';
import type { FC, ReactNode } from 'react';

import resets from '../../_resets.module.css';
import { Icon_typeNone } from '../Icon_typeNone/Icon_typeNone';
import classes from './Button_sizeSmallIsDisabledFals.module.css';

interface Props {
  className?: string;
  text?: {
    label?: ReactNode;
  };
}
/* @figmaId 107:528 */
export const Button_sizeSmallIsDisabledFals: FC<Props> = memo(function Button_sizeSmallIsDisabledFals(props = {}) {
  return (
    <div className={`${resets.storybrainResets} ${classes.root}`}>
      {props.text?.label != null ? props.text?.label : <div className={classes.label}>Button</div>}
    </div>
  );
});
