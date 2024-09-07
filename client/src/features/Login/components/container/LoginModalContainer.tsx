// TODO:各パラメータの調整確認
// TODO:デザインとの差異確認
// TODO:モーダル閉じない時があるもんだい

import type { FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { LOGIN_URL } from 'domains/internal/constants/apiUrls';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import { AuthToken } from 'domains/AuthToken';
import LoginModalPresenter from '../presenter/LoginModalPresenter';
import { loginFormSchema } from '../schemas/loginFormSchema';
import type { LoginFormSchema } from '../schemas/loginFormSchema';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loginUser = async (requestBody: LoginFormSchema) => {
  const params = new URLSearchParams();
  params.append('username', requestBody.name);
  params.append('password', requestBody.password);

  return await axios.post(LOGIN_URL, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// TODO: ヘッダーとこれはuseMemoを使ってもいいかも
const LoginModalContainer: FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormSchema>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: yupResolver(loginFormSchema),
  });
  // MEMO: ほんとは戻り値を使ってresetとかclearErrorsの実装した方が良さげ

  const onSubmit: SubmitHandler<LoginFormSchema> = async (loginFormData) => {
    try {
      const response = await loginUser(loginFormData);

      AuthToken.setTokens(
        response.data.access_token,
        response.data.refresh_token,
      );

      dispatch(
        setAlert({
          open: true,
          message: 'ログインしました',
          severity: 'success',
        }),
      );
      console.log('Response:', response.data);
    } catch (error) {
      // TODO:500エラーと400エラーでメッセージを変える
      dispatch(
        setAlert({
          open: true,
          message: 'ログインAPIがエラーになってるで',
          severity: 'error',
        }),
      );
      console.error('Error:', error);
    }
  };

  return (
    <LoginModalPresenter
      isOpen={isOpen}
      onClose={onClose}
      register={register}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
};

export default LoginModalContainer;
