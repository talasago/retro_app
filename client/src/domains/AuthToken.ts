import { useState, useEffect, type SetStateAction, type Dispatch } from 'react';
import Cookies from 'js-cookie';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthToken {
  static readonly REFRESH_TOKEN_EXPIRE_DAYS = 10;
  static readonly ACCESS_TOKEN_EXPIRE_DATE_AFTER9_MINUTES = new Date(
    new Date().getTime() + 9 * 60 * 1000,
  );

  static readonly ACCESS_TOKEN_KEY = 'accessToken';
  static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  // TODO: tokenたちはプロパティに保存してもいいかも。そうなると、シングルトンにしないとだ。
  // isLoginedCheck()とか、getTokens()せずに、プロパティから取得してもいいと思ったので。
  // useProtectedApi.tsのupdatedAccessTokenとか、呼び出し元で管理しなくてよくなるかも。

  /**
   * ユーザーがログインしているかどうかをチェックする。ログインしているかどうかの判定は、
   * accessTokenが先に有効期限切れになるため、refreshTokenの有無で判断する。
   * @returns {boolean} ユーザーがログインしている場合はtrueを返す。
   */
  static isLoginedCheck(): boolean {
    return this.isExistRefreshToken();
  }

  /**
   * アクセストークンが存在するかどうかをチェックする。
   * @returns {boolean} アクセストークンが存在する場合はtrueを返す。
   */
  static isExistAccessToken(): boolean {
    const { accessToken } = this.getTokens();

    return (
      accessToken !== '' && accessToken !== undefined && accessToken !== null
    );
  }

  /**
   * リフレッシュトークンが存在するかどうかをチェックする。
   * @returns {boolean} リフレッシュトークンが存在する場合はtrueを返す。
   */

  static isExistRefreshToken(): boolean {
    const { refreshToken } = this.getTokens();

    return (
      refreshToken !== '' && refreshToken !== undefined && refreshToken !== null
    );
  }

  static getTokens(): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: Cookies.get(this.ACCESS_TOKEN_KEY) ?? '',
      refreshToken: Cookies.get(this.REFRESH_TOKEN_KEY) ?? '',
    };
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, {
      expires: this.ACCESS_TOKEN_EXPIRE_DATE_AFTER9_MINUTES,
      path: '/',
      // domain: // サーバーにcookieを送信しないので指定しない
      secure: true,
      sameSite: 'Strict',
    });

    Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, {
      expires: this.REFRESH_TOKEN_EXPIRE_DAYS,
      path: '/',
      // domain: '*', // サーバーにcookieを送信しないので指定しない
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
