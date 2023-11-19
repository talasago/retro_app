import { memo } from 'react';
import type { FC } from 'react';

import resets from '../_resets.module.css';
import { Button_sizeDefaultIsDisabledFa2 } from './Button_sizeDefaultIsDisabledFa2/Button_sizeDefaultIsDisabledFa2';
import { Button_sizeSmallIsDisabledFals } from './Button_sizeSmallIsDisabledFals/Button_sizeSmallIsDisabledFals';
import classes from './Frame1.module.css';
import { PasswordField_sizeDefaultIsDis } from './PasswordField_sizeDefaultIsDis/PasswordField_sizeDefaultIsDis';
import { UnionIcon } from './UnionIcon';

interface Props {
  className?: string;
  hide?: {
    button?: boolean;
  };
}
/* @figmaId 113:70 */
export const Frame1: FC<Props> = memo(function Frame1(props = {}) {
  return (
    <div className={`${resets.storybrainResets} ${classes.root}`}>
      <div className={classes.union}>
        <UnionIcon className={classes.icon} />
      </div>
      <div className={classes.welcomeWorld}>Welcome world!</div>
      <div className={classes.textField}>
        <div className={classes.label4}>Email</div>
        <div className={classes.inputGroup}>
          <input type="email" className={classes.input}></input>
        </div>
      </div>
      <div className={classes.label5}>Name</div>
      <div className={classes.inputGroup2}>
        <input type="text" className={classes.input2}></input>
      </div>
      <PasswordField_sizeDefaultIsDis
        className={classes.passwordField}
        text={{
          label: <div className={classes.label}>Password</div>,
        }}
      />
      <Button_sizeDefaultIsDisabledFa2
        className={classes.button}
        text={{
          label: <div className={classes.label2}>Sign up</div>,
        }}
      />
      <div className={classes.signUp}>
        <div className={classes.doHaveAnAccount}>Do have an account? </div>
        <Button_sizeSmallIsDisabledFals
          text={{
            label: <div className={classes.label3}>Log in </div>,
          }}
        />
      </div>
    </div>
  );
});
