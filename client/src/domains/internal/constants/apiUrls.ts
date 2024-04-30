import { getEnvVar } from 'utils/getEnvVar'; // ユーティリティ関数のパスに置き換えてください

const prefix = getEnvVar('VITE_BACKEND_API_URL');
export const SIGN_UP_URL = `${prefix}/api/v1/sign_up`;
export const LOGIN_URL = `${prefix}/token`;
export const LOGOUT_URL = `${prefix}/api/v1/logout`;
export const REFRESH_TOKEN_URL = `${prefix}/refresh_token`;
