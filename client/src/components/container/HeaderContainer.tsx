import type { FC } from 'react';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { useProtectedApi } from 'hooks/useProtectedApi';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import { AuthToken, useAuthTokenObserver } from 'domains/AuthToken';
import LoginModalContainer from 'features/Login/components/container/LoginModalContainer';
import HeaderPresenter from '../presenter/HeaderPresenter';

const HeaderContainer: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;
  const callProtectedApi = useProtectedApi();
  const isLogined: boolean = useAuthTokenObserver() as boolean;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const handleOpenLoginModal = (): void => {
    setIsLoginModalOpen(true);
  };
  const handleCloseLoginModal = (): void => {
    setIsLoginModalOpen(false);
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
        onClose={handleCloseLoginModal}
      />
    </>
  );
};

export default React.memo(HeaderContainer);
