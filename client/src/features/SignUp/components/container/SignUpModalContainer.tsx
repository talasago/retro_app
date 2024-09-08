import React, { useMemo } from 'react';
import type { FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { SIGN_UP_URL } from 'domains/internal/constants/apiUrls';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import SignUpModalPresenter from '../presenter/SignUpModalPresenter';
import { registrationFormSchema } from '../schemas/registrationFormSchema';
import type { RegistrationFormSchema } from '../schemas/registrationFormSchema';

interface SignUpModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
}

const registUser = async (data: RegistrationFormSchema) => {
  return await axios.post(SIGN_UP_URL, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const SignUpModalContainer: FC<SignUpModalProps> = ({
  isOpen,
  onCloseModal,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;

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
      const response = await registUser(data);
      dispatch(
        setAlert({
          open: true,
          message:
            'ユーザー登録が成功しました。ログイン画面でログインしてください。',
          severity: 'success',
        }),
      );
      console.log('Response:', response.data);
      onCloseModal();
      reset();
    } catch (error) {
      // TODO:500エラーと400エラーでメッセージを変える
      dispatch(
        setAlert({
          open: true,
          message: 'ユーザー登録APIがエラーになってるで',
          severity: 'error',
        }),
      );
      console.error('Error:', error);
    }
  };

  const memoizedSignUpModalPresenter = useMemo(
    () => (
      <SignUpModalPresenter
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

  return memoizedSignUpModalPresenter;
};

export default React.memo(SignUpModalContainer);
