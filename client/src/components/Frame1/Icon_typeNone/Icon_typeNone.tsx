import { memo } from 'react';
import type { FC } from 'react';

import resets from '../../_resets.module.css';
import classes from './Icon_typeNone.module.css';

interface Props {
  className?: string;
  classes?: {
    root?: string;
  };
}
/* @figmaId 107:551 */
export const Icon_typeNone: FC<Props> = memo(function Icon_typeNone(
  props = {},
) {
  return (
    <div
      className={`${resets.storybrainResets} ${props.classes?.root || ''} ${
        props.className || ''
      } ${classes.root}`}
    ></div>
  );
});
