import { memo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import resets from '../../_resets.module.css';
import classes from './PasswordField_sizeDefaultIsDis.module.css';

interface Props {
  className?: string;
  onPasswordChange: (newPassword: string) => void;
}
/* @figmaId 107:371 */
export const PasswordField_sizeDefaultIsDis: FC<Props> = memo(function PasswordField_sizeDefaultIsDis(props) {
  const handlePasswordChange = (newPassword: string) => {
    props.onPasswordChange(newPassword); // 親コンポーネントに通知
  };

  return (
    <div className={`${resets.storybrainResets} ${props.className} ${classes.root}`}>
      <div className={classes.label}>Password</div>
      <div className={classes.inputGroup}>
        <input type="password" className={classes.input} onChange={(e) => { handlePasswordChange(e.target.value); }} ></input>
      </div>
    </div>
  );
});
