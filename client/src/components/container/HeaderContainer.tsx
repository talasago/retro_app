import type { FC } from 'react';
import { LOGOUT_URL } from 'domains/internal/constants/apiUrls';
import { useProtectedApi } from 'hooks/useProtectedApi';
import { useDispatch } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AppDispatch } from 'stores/store';
import { AuthToken, useAuthTokenObserver } from 'domains/AuthToken';
import HeaderPresenter from '../presenter/HeaderPresenter';

const HeaderContainer: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { setAlert } = alertSlice.actions;
  const callProtectedApi = useProtectedApi();
  const isLogined: boolean = useAuthTokenObserver() as boolean;

  const handleLogout = async () => {
    const [response, error] = await callProtectedApi(LOGOUT_URL, 'POST');

    if (error) {
      dispatch(
        setAlert({
          open: true,
          message: error.message,
          severity: 'error',
        }),
      );
      console.error('Error:', error);

      return;
    }

    dispatch(
      setAlert({
        open: true,
        message: 'ログアウトが成功したで',
        severity: 'success',
      }),
    );
    AuthToken.resetTokens();
    console.log('Response:', response?.data);
  };

  return <HeaderPresenter isLogined={isLogined} onLogout={handleLogout} />;
};

export default HeaderContainer;
