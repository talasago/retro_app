import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export class AuthTokenSubject {
  // function型の配列を持つのが正しいのか？
  observers: Function[] = [];

  addObserver(observer: Function): void {
    this.observers.push(observer);
  }

  deleteObserver(observer: Function): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notifyObservers(): void {
    this.observers.forEach((observer) => observer());
  }
}

// FIXME: シングルトンの作り方を変える
// Create a single instance of AuthTokenSubject
const authTokenSubject = new AuthTokenSubject();


/**
 * Checks if the user is logged in.
 * @returns {boolean} Returns true if the user is logged in, otherwise returns false.
 */
export const isLoginedCheck = (): boolean => {
  const { accessToken, refreshToken } = getTokens();

  return !(
    accessToken === null ||
    refreshToken === null ||
    accessToken === '' ||
    refreshToken === '' ||
    accessToken === undefined ||
    refreshToken === undefined
  );
};

export const getTokens = (): {
  accessToken: string | undefined;
  refreshToken: string | undefined;
} => {
  return {
    accessToken: Cookies.get('accessToken'),
    refreshToken: Cookies.get('refreshToken'),
  };
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

  authTokenSubject.notifyObservers();
};

export const resetTokens = (): void => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  authTokenSubject.notifyObservers();
};

export function useAuthTokenObserver(): boolean {
  const [isLogined, setIsLogined] = useState<boolean>(isLoginedCheck());

  useEffect(() => {
    const observer = () => {
      // updateの役割も果たしている
      setIsLogined(isLoginedCheck());
    };
    authTokenSubject.addObserver(observer);

    // クリーンアップ関数??
    // コンポーネントがアンマウントされるとき、または、コンポーネントが再レンダリングされるときに実施される
    return () => {
      authTokenSubject.deleteObserver(observer);
    };
  }, [isLogined]); // TODO: 依存配列が何が良いかは後で検討

  return isLogined;
}
