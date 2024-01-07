import { memo, useState } from 'react';
import type { FC } from 'react';

import resets from '../_resets.module.css';
import { Button_sizeDefaultIsDisabledFa2 } from './Button_sizeDefaultIsDisabledFa2/Button_sizeDefaultIsDisabledFa2';
import { Button_sizeSmallIsDisabledFals } from './Button_sizeSmallIsDisabledFals/Button_sizeSmallIsDisabledFals';
import { PasswordField_sizeDefaultIsDis } from './PasswordField_sizeDefaultIsDis/PasswordField_sizeDefaultIsDis';
import { UnionIcon } from './UnionIcon';
import classes from './Frame1.module.css';

interface Props {
  className?: string;
  hide?: {
    button?: boolean;
  };
}
const title = import.meta.env.VITE_APP_TITLE;

export const Frame1: FC<Props> = memo(function Frame1(props = {}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
  };

  return (
    <div className={`${resets.storybrainResets} ${classes.root}`}>
      <div className={classes.union}>
        <UnionIcon className={classes.icon} />
      </div>
      <div className={classes.welcomeWorld}>{title}</div>
      <div className={classes.textField}>
        <div className={classes.label4}>Email</div>
        <div className={classes.inputGroup}>
          <input type="email" className={classes.input} onChange={(e) => { setEmail(e.target.value); }}></input>
        </div>
      </div>
      <div className={classes.label5}>Name</div>
      <div className={classes.inputGroup2}>
        <input type="text" className={classes.input2} onChange={(e) => { setName(e.target.value); }}></input>
      </div>
      <PasswordField_sizeDefaultIsDis
        className={classes.passwordField}
        onPasswordChange={handlePasswordChange}
      />
      <Button_sizeDefaultIsDisabledFa2
        className={classes.button}
        text={{
          label: <div className={classes.label2}>Sign up</div>,
        }}
        name={name}
        email={email}
        password={password}
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
