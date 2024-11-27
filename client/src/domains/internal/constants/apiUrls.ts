import { getEnvVar } from 'utils/getEnvVar'; // ユーティリティ関数のパスに置き換えてください

const prefix = getEnvVar('VITE_BACKEND_API_URL') + '/api/v1';
export const SIGN_UP_URL = `${prefix}/sign_up`;
export const LOGIN_URL = `${prefix}/token`;
export const LOGOUT_URL = `${prefix}/logout`;
export const REFRESH_TOKEN_URL = `${prefix}/refresh_token`;
