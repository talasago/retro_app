import { useState, useEffect, type SetStateAction, type Dispatch } from 'react';
import Cookies from 'js-cookie';

class AuthTokenSubject {
  private static instance: AuthTokenSubject;
  private observers: AuthTokenObserver[] = [];

  static getInstance(): AuthTokenSubject {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this.instance) {
      this.instance = new AuthTokenSubject();
    }

    return this.instance;
  }

  addObserver(observer: AuthTokenObserver): void {
    this.observers.push(observer);
  }

  deleteObserver(observer: AuthTokenObserver): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notifyObservers(): void {
    this.observers.forEach((observer) => {
      observer.update();
    });
  }
}

const authTokenSubject = AuthTokenSubject.getInstance();

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthToken {
  static readonly REFRESH_TOKEN_EXPIRE_DAYS = 10;
  static readonly ACCESS_TOKEN_KEY = 'accessToken';
  static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  /**
   * Checks if the user is logged in.
   * @returns {boolean} Returns true if the user is logged in, otherwise returns false.
   */

  static isLoginedCheck(): boolean {
    const { accessToken, refreshToken } = this.getTokens();

    return !(
      accessToken === null ||
      refreshToken === null ||
      accessToken === '' ||
      refreshToken === '' ||
      accessToken === undefined ||
      refreshToken === undefined
    );
  }

  static getTokens(): {
    accessToken: string | undefined;
    refreshToken: string | undefined;
  } {
    return {
      accessToken: Cookies.get(this.ACCESS_TOKEN_KEY),
      refreshToken: Cookies.get(this.REFRESH_TOKEN_KEY),
    };
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    const accessTokenExpireDateAfter10Minutes = new Date(
      new Date().getTime() + 10 * 60 * 1000,
    );
    const REFRESH_TOKEN_EXPIRE_DAYS = 10;

    Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, {
      expires: accessTokenExpireDateAfter10Minutes,
      path: '/',
      // domain: // TODO: 本番公開前までに修正する
      secure: true,
      sameSite: 'Strict',
    });

    Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, {
      expires: REFRESH_TOKEN_EXPIRE_DAYS,
      path: '/',
      // domain: '*', // TODO: 本番公開前までに修正する
      secure: true,
      sameSite: 'Strict',
    });

    authTokenSubject.notifyObservers();
  }

  static resetTokens(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);

    authTokenSubject.notifyObservers();
  }
}

class AuthTokenObserver {
  setIsLogined: Dispatch<SetStateAction<boolean>>;

  constructor(setIsLogined: Dispatch<SetStateAction<boolean>>) {
    this.setIsLogined = setIsLogined;
  }

  update(): void {
    this.setIsLogined(AuthToken.isLoginedCheck());
  }
}

export function useAuthTokenObserver(): boolean {
  const [isLogined, setIsLogined] = useState<boolean>(
    AuthToken.isLoginedCheck(),
  );
  const observer = new AuthTokenObserver(setIsLogined);

  useEffect(() => {
    authTokenSubject.addObserver(observer);

    // クリーンアップ関数??
    // コンポーネントがアンマウントされるとき、または、コンポーネントが再レンダリングされるときに実施される
    return () => {
      authTokenSubject.deleteObserver(observer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogined]); // TODO: 依存配列が何が良いかは後で検討

  return isLogined;
}
