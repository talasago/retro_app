const prefix = import.meta.env.VITE_BACKEND_API_URL;
export const SIGN_UP_URL = `${prefix}/api/v1/sign_up`;
export const LOGIN_URL = `${prefix}/token`;
export const LOGOUT_URL = `${prefix}/api/v1/logout`;
export const REFRESH_TOKEN_URL = `${prefix}/refresh_token`;
