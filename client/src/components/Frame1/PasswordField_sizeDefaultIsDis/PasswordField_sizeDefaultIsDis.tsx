import { memo } from 'react';
import type { FC, ReactNode } from 'react';

import resets from '../../_resets.module.css';
import { Button_sizeDefaultIsDisabledFa } from '../Button_sizeDefaultIsDisabledFa/Button_sizeDefaultIsDisabledFa';
import classes from './PasswordField_sizeDefaultIsDis.module.css';

interface Props {
  className?: string;
  classes?: {
    root?: string;
  };
  hide?: {
    buttonIcon?: boolean;
    button?: boolean;
  };
  text?: {
    label?: ReactNode;
  };
}
/* @figmaId 107:371 */
export const PasswordField_sizeDefaultIsDis: FC<Props> = memo(function PasswordField_sizeDefaultIsDis(props = {}) {
  return (
    <div className={`${resets.storybrainResets} ${props.classes?.root || ''} ${props.className || ''} ${classes.root}`}>
      {props.text?.label != null ? props.text?.label : <div className={classes.label}>Label</div>}
      <div className={classes.inputGroup}>
        <div className={classes.input}>
          <div className={classes.placeholder}>Placeholder</div>
          {!props.hide?.button && (
            <Button_sizeDefaultIsDisabledFa
              className={classes.button}
              classes={{ buttonIcon: classes.buttonIcon }}
              hide={{
                buttonIcon: false,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
});
