import React, { useMemo } from 'react';
import type { FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import axios, { type AxiosResponse } from 'axios';
import { isClientErrorResponseBody } from 'domains/internal/apiErrorUtil';
import { type apiSchemas } from 'domains/internal/apiSchema';
import { SIGN_UP_URL } from 'domains/internal/constants/apiUrls';
import { DEFAULT_ERROR_MESSAGE } from 'domains/internal/constants/errorMessage';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { alertSlice } from 'stores/alert';
import { signUpModalSlice } from 'stores/signUpModal';
import type { AppDispatch, RootState } from 'stores/store';
import SignUpModalPresenter from '../presenter/SignUpModalPresenter';
import { registrationFormSchema } from '../schemas/registrationFormSchema';
import type { RegistrationFormSchema } from '../schemas/registrationFormSchema';

const registUser = async (
  data: RegistrationFormSchema,
): Promise<AxiosResponse<apiSchemas['schemas']['SignInApiResponseBody']>> => {
  return await axios.post(SIGN_UP_URL, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const SignUpModalContainer: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;

  const isOpen = useSelector((state: RootState) => state.signUpModal.isOpen);
  const { closeSignUpModal } = signUpModalSlice.actions;
  const handleCloseSignUpModal = (): void => {
    dispatch(closeSignUpModal());
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormSchema>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: yupResolver(registrationFormSchema),
  });

  const onSubmit: SubmitHandler<RegistrationFormSchema> = async (data) => {
    try {
      // メッセージはフロントで変えたいのでresponceは使わない
      await registUser(data);
    } catch (error: unknown) {
      let errorMessage = DEFAULT_ERROR_MESSAGE;
      if (isClientErrorResponseBody(error)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        errorMessage = error.response!.data.message;
      }

      // 422の時の考慮が必要
      dispatch(
        setAlert({
          open: true,
          message: errorMessage,
          severity: 'error',
        }),
      );

      return;
    }

    dispatch(
      setAlert({
        open: true,
        message:
          'ユーザー登録が成功しました。ログイン画面でログインしてください。',
        severity: 'success',
      }),
    );
    handleCloseSignUpModal();
    reset();
  };

  const memoizedSignUpModalPresenter = useMemo(
    () => (
      <SignUpModalPresenter
        isOpen={isOpen}
        onClose={handleCloseSignUpModal}
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

  return memoizedSignUpModalPresenter;
};

export default React.memo(SignUpModalContainer);
