import type { FC } from 'react';
import React, { useState, useMemo } from 'react';
import type { AxiosResponse } from 'axios';
import type { apiSchemas } from 'domains/internal/apiSchema';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { useProtectedApi } from 'hooks/useProtectedApi';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import { signUpModalSlice } from 'stores/signUpModal';
import type { AppDispatch } from 'stores/store';
import { AuthToken, useAuthTokenObserver } from 'domains/AuthToken';
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const handleOpenLoginModal = (): void => {
    setIsLoginModalOpen(true);
  };
  const handleCloseLoginModal = (): void => {
    setIsLoginModalOpen(false);
  };

  const { openSignUpModal } = signUpModalSlice.actions;

  const handleOpenSignUpModal = (): void => {
    dispatch(openSignUpModal());
  };

  const callLogoutApi = async (): Promise<
    [
      AxiosResponse<apiSchemas['schemas']['LogoutApiResponseBody']> | null,
      Error | null,
    ]
  > => {
    return await callProtectedApi(LOGOUT_URL, 'POST');
  };

  const handleLogout = async (): Promise<void> => {
    const [response, error] = await callLogoutApi();

    if (error) {
      dispatch(
        setAlert({
          open: true,
          message: error.message,
          severity: 'error',
        }),
      );

      return;
    }

    AuthToken.resetTokens();
    dispatch(
      setAlert({
        open: true,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        message: response!.data.message,
        severity: 'success',
      }),
    );
  };

  const memoizedHeaderPresenter = useMemo(
    () => (
      <HeaderPresenter
        isLogined={isLogined}
        onLogout={handleLogout}
        onOpenLoginModal={handleOpenLoginModal}
        onOpenSignUpModal={handleOpenSignUpModal}
      />
    ),
    // ログイン状態が変化したときだけ、表示が変わるので再レンダリングする
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLogined],
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
