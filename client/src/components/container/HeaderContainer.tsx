import type { FC } from 'react';
import React, { useMemo, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { isClientErrorResponseBody } from 'domains/internal/apiErrorUtil';
import type { apiSchemas } from 'domains/internal/apiSchema';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { DEFAULT_ERROR_MESSAGE } from 'domains/internal/constants/errorMessage';
import { useProtectedApi } from 'hooks/useProtectedApi';
import { useDispatch, useSelector } from 'react-redux';
import { alertSlice } from 'stores/alert';
import { loginModalSlice } from 'stores/loginModal';
import { signUpModalSlice } from 'stores/signUpModal';
import type { AppDispatch, RootState } from 'stores/store';
import { AuthToken, useAuthTokenObserver } from 'domains/AuthToken';
import { UserInfo } from 'domains/UserInfo';
import LoginModalContainer from 'features/Login/components/container/LoginModalContainer';
import SignUpModalContainer from 'features/SignUp/components/container/SignUpModalContainer';
import HeaderPresenter from '../presenter/HeaderPresenter';

const HeaderContainer: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;
  const callProtectedApi = useProtectedApi();
  const isLogined: boolean = useAuthTokenObserver() as boolean;

  // MEMO: HeaderPresenterのprops、ボタンをクリックするためにも必要なため、
  //      ここで管理している
  const { closeLoginModal, openLoginModal } = loginModalSlice.actions;
  const isLoginModalOpen = useSelector(
    (state: RootState) => state.loginModal.isOpen,
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleOpenLoginModal = (): void => {
    dispatch(openLoginModal());
  };

  const handleCloseLoginModal = (): void => {
    dispatch(closeLoginModal());
  };

  const { openSignUpModal } = signUpModalSlice.actions;

  const handleOpenSignUpModal = (): void => {
    dispatch(openSignUpModal());
  };

  const callLogoutApi = async (): Promise<
    AxiosResponse<apiSchemas['schemas']['LogoutApiResponseBody']>
  > => {
    return await callProtectedApi({ url: LOGOUT_URL, method: 'POST' });
  };

  const handleLogout = async (): Promise<void> => {
    let message: string = '';
    setIsSubmitting(true);
    try {
      const response = await callLogoutApi();
      message = response.data.message;
    } catch (error) {
      let errorMessage: string = DEFAULT_ERROR_MESSAGE;
      if (isClientErrorResponseBody(error)) {
        // refreshTokenapiでエラーの場合にこのエラーレスポンスが返ってくる
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        errorMessage = error.response!.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      dispatch(
        setAlert({
          open: true,
          message: errorMessage,
          severity: 'error',
        }),
      );
      setIsSubmitting(false);

      return;
    }

    AuthToken.resetTokens();
    UserInfo.resetUserInfo();

    dispatch(
      setAlert({
        open: true,
        message,
        severity: 'success',
      }),
    );
    setIsSubmitting(false);
  };

  const memoizedHeaderPresenter = useMemo(
    () => (
      <HeaderPresenter
        isLogined={isLogined}
        onLogout={handleLogout}
        onOpenLoginModal={handleOpenLoginModal}
        onOpenSignUpModal={handleOpenSignUpModal}
        isSubmitting={isSubmitting}
      />
    ),
    // ログイン状態が変化したときだけ、表示が変わるので再レンダリングする
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLogined, isSubmitting],
  );

  return (
    <>
      {memoizedHeaderPresenter}
      <LoginModalContainer
        isOpen={isLoginModalOpen}
        onCloseModal={handleCloseLoginModal}
      />
      <SignUpModalContainer />
    </>
  );
};

export default React.memo(HeaderContainer);
