import type { FC } from 'react';
import React, { useState, useMemo } from 'react';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { useProtectedApi } from 'hooks/useProtectedApi';
import { useDispatch, useSelector } from 'react-redux';
import { alertSlice } from 'stores/alert';
import { signUpModalSlice } from 'stores/signUpModal';
import type { RootState, AppDispatch } from 'stores/store';
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

  const isSignUpModalOpen = useSelector(
    (state: RootState) => state.signUpModal.isOpen,
  );
  const { openSignUpModal, closeSignUpModal } = signUpModalSlice.actions;

  const handleOpenSignUpModal = (): void => {
    dispatch(openSignUpModal());
  };
  const handleCloseSignUpModal = (): void => {
    dispatch(closeSignUpModal());
  };

  const handleLogout = async (): Promise<void> => {
    const [_, error] = await callProtectedApi(LOGOUT_URL, 'POST');

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
        message: 'ログアウトが成功しました',
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
      <SignUpModalContainer
        isOpen={isSignUpModalOpen}
        onCloseModal={handleCloseSignUpModal}
      />
    </>
  );
};

export default React.memo(HeaderContainer);
