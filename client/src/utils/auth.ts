import Cookies from 'js-cookie';

const accessToken: string | undefined = Cookies.get('accessToken');
const refreshToken: string | undefined = Cookies.get('refreshToken');

/**
 * Checks if the user is logged in.
 * @returns {boolean} Returns true if the user is logged in, otherwise returns false.
 */
export const isLogined = (): boolean => {
  return !(
    accessToken === null ||
    refreshToken === null ||
    accessToken === '' ||
    refreshToken === '' ||
    accessToken === undefined ||
    refreshToken === undefined
  );
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  const accessTokenExpireDateAfter10Minutes = new Date(
    new Date().getTime() + 10 * 60 * 1000,
  );
  const REFRESH_TOKEN_EXPIRE_DAYS = 10;

  Cookies.set('accessToken', accessToken, {
    expires: accessTokenExpireDateAfter10Minutes,
    path: '/',
    // domain: // TODO: 本番公開前までに修正する
    secure: true,
    sameSite: 'Strict',
  });

  Cookies.set('refreshToken', refreshToken, {
    expires: REFRESH_TOKEN_EXPIRE_DAYS,
    path: '/',
    // domain: '*', // TODO: 本番公開前までに修正する
    secure: true,
    sameSite: 'Strict',
  });
};

export const resetTokens = (): void => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
};
