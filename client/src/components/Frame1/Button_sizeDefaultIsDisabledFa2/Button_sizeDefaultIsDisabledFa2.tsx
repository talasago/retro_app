import { memo } from 'react';
import type { FC, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

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
  const handleClick = async () => {
    console.log('Name:', props.name);
    console.log('Email:', props.email);
    console.log('Password:', props.password);

    try {
      const urlPath = '/api/v1/sign_up';

      const data = {
        name: props.name,
        email: props.email,
        password: props.password,
      };

      const response = await axios.post(`${process.env.BACKEND_API_URL}${urlPath}`, data, {
        headers: {
          'Content-Type': 'application/json' // ヘッダーにapplication/jsonを追加
        },
      });
      window.alert('ユーザー登録API正常終了したで')
      console.log('Response:', response.data);
    } catch (error: any) {
      window.alert('ユーザー登録APIエラーになってるで');
      console.error('Error:', error);
    }
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
