import Cookies from 'js-cookie';
import { AuthToken } from './AuthToken';

export type UserInfoType = {
  userName: string;
  userUuid: string;
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserInfo {
  static readonly EXPIRE_DATE =
    AuthToken.ACCESS_TOKEN_EXPIRE_DATE_AFTER9_MINUTES;

  static readonly USER_NAME_KEY = 'userName';
  static readonly USER_UUID_KEY = 'userUuid';

  static getUserInfo(): UserInfoType {
    return {
      userName: Cookies.get(this.USER_NAME_KEY) ?? '',
      userUuid: Cookies.get(this.USER_UUID_KEY) ?? '',
    };
  }

  static setUserInfo(
    userName: UserInfoType['userUuid'],
    userUuid: UserInfoType['userUuid'],
  ): void {
    Cookies.set(this.USER_NAME_KEY, userName, {
      expires: this.EXPIRE_DATE,
      path: '/',
      // domain: // サーバーにcookieを送信しないので指定しない
      secure: true,
      sameSite: 'Strict',
    });

    Cookies.set(this.USER_UUID_KEY, userUuid, {
      expires: this.EXPIRE_DATE,
      path: '/',
      // domain: '*', // サーバーにcookieを送信しないので指定しない
      secure: true,
      sameSite: 'Strict',
    });
  }

  static resetUserInfo(): void {
    Cookies.remove(this.USER_NAME_KEY);
    Cookies.remove(this.USER_UUID_KEY);
  }
}
