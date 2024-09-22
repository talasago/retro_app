import React, { useMemo } from 'react';
import type { FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import axios, { type AxiosResponse, type AxiosError } from 'axios';
import type { apiSchemas } from 'domains/internal/apiSchema';
import { LOGIN_URL } from 'domains/internal/constants/apiUrls';
import { DEFAULT_ERROR_MESSAGE } from 'domains/internal/constants/errorMessage';
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
  onCloseModal: () => void;
}

const loginUser = async (
  requestBody: LoginFormSchema,
): Promise<AxiosResponse<apiSchemas['schemas']['TokenApiResponseBody']>> => {
  const params = new URLSearchParams();
  params.append('username', requestBody.name);
  params.append('password', requestBody.password);

  return await axios.post(LOGIN_URL, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

const isClientErrorResponseBody = (
  error: unknown,
): error is AxiosError<apiSchemas['schemas']['ClientErrorResponseBody']> => {
  return (
    axios.isAxiosError(error) &&
    error.response !== undefined &&
    (error.response?.data as apiSchemas['schemas']['ClientErrorResponseBody'])
      .message !== undefined
  );
};

const LoginModalContainer: FC<LoginModalProps> = ({ isOpen, onCloseModal }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormSchema>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: yupResolver(loginFormSchema),
  });

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
          message: response.data.message,
          severity: 'success',
        }),
      );
      onCloseModal();
      reset();
    } catch (error: unknown) {
      // フロントバリデの関係で422は返って来るケースはないため、その場合は考慮しない。

      dispatch(
        setAlert({
          open: true,
          // message: errorMessage,
          message: isClientErrorResponseBody(error)
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              error.response!.data.message
            : DEFAULT_ERROR_MESSAGE,
          severity: 'error',
        }),
      );
    }
  };

  const memoizedLoginModalPresenter = useMemo(
    () => (
      <LoginModalPresenter
        isOpen={isOpen}
        onClose={onCloseModal}
        register={register}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        errors={errors}
        isSubmitting={isSubmitting}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, isSubmitting],
  );

  return memoizedLoginModalPresenter;
};

export default React.memo(LoginModalContainer);
