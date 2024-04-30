import { type ReactNode } from 'react';
import {
  renderHook,
  type WrapperComponent,
} from '@testing-library/react-hooks';
import axios, { type AxiosResponse } from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import { useProtectedApi } from '../useProtectedApi';

jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('#useProtectedApi', () => {
  const mockIsLoginedCheck = jest.fn();
  const mockGetTokens = jest.fn();
  const mockResetTokens = jest.fn();
  const mockUpdateTokenUseRefreshToken = jest.fn();

  const mockAccessToken = 'mockAccessToken';
  const mockRefreshToken = 'mockRefreshToken';

  const NOT_LOGINED_MESSAGE = 'Not logged in';
  const GENERIC_ERROR_MESSAGE = 'Generic error';
  const EXPIRED_TOKEN_MESSAGE = 'Expired token';

  // beforeAll(() => {
  //   jest.spyOn(window, 'alert').mockImplementation(() => {});
  //   jest.spyOn(console, 'error').mockImplementation(() => {});
  // });

  beforeEach(() => {
    // jest.clearAllMocks();
    // jest.resetModules();

    jest.mock('utils/AuthToken', () => ({
      // isLoginedCheck: mockIsLoginedCheck,
      getTokens: mockGetTokens,
      resetTokens: mockResetTokens,
      updateTokenUseRefreshToken: mockUpdateTokenUseRefreshToken,
    }));
  });

  it('should return response and error as null when user is not logged in', async () => {
    const wrapper: WrapperComponent<{ children: ReactNode }> = ({
      children,
    }) => <Router>{children}</Router>;

    const { result } = renderHook(() => useProtectedApi(), { wrapper });

    const callProtectedApi = result.current;
    const [resultResponse, resultError] = await callProtectedApi(
      'https://api.example.com',
      'POST',
    );

    expect(resultResponse).toBeNull();
    expect(resultError).toEqual(new Error('ログインしてください。'));
  });

  //  it.skip('should return response and error when API call is successful', async () => {
  //    const mockResponse: AxiosResponse = {
  //      data: {},
  //      status: 200,
  //      statusText: 'OK',
  //      headers: {},
  //      config: {},
  //    };
  //
  //    mockIsLoginedCheck.mockReturnValue(true);
  //    mockGetTokens.mockReturnValue({
  //      accessToken: mockAccessToken,
  //      refreshToken: mockRefreshToken,
  //    });
  //    axios.mockResolvedValue(mockResponse);
  //
  //    const { result } = renderHook(() => useProtectedApi());
  //
  //    const [response, error] = await result.current(
  //      'https://api.example.com',
  //      'GET',
  //    );
  //
  //    expect(response).toEqual(mockResponse);
  //    expect(error).toBeNull();
  //  });
  //
  //  it.skip('should return error when API call fails with non-expired token', async () => {
  //    const mockError = new Error('API call failed');
  //
  //    mockIsLoginedCheck.mockReturnValue(true);
  //    mockGetTokens.mockReturnValue({
  //      accessToken: mockAccessToken,
  //      refreshToken: mockRefreshToken,
  //    });
  //    axios.mockRejectedValue(mockError);
  //
  //    const { result } = renderHook(() => useProtectedApi());
  //
  //    const [response, error] = await result.current(
  //      'https://api.example.com',
  //      'GET',
  //    );
  //
  //    expect(response).toBeNull();
  //    expect(error).toEqual(new Error(GENERIC_ERROR_MESSAGE));
  //  });
  //
  //  it.skip('should return error when API call fails with expired token and token refresh fails', async () => {
  //    const mockError = new Error('API call failed');
  //
  //    mockIsLoginedCheck.mockReturnValue(true);
  //    mockGetTokens.mockReturnValue({
  //      accessToken: mockAccessToken,
  //      refreshToken: mockRefreshToken,
  //    });
  //    axios.mockRejectedValueOnce({ response: { status: 401 } });
  //    mockUpdateTokenUseRefreshToken.mockRejectedValue(mockError);
  //
  //    const { result } = renderHook(() => useProtectedApi());
  //
  //    const [response, error] = await result.current(
  //      'https://api.example.com',
  //      'GET',
  //    );
  //
  //    expect(response).toBeNull();
  //    expect(error).toEqual(new Error(EXPIRED_TOKEN_MESSAGE));
  //    expect(mockResetTokens).toHaveBeenCalled();
  //    expect(mockNavigate).toHaveBeenCalledWith('/login');
  //  });
  //
  //  it.skip('should return response and error when API call fails with expired token and token refresh succeeds', async () => {
  //    const mockResponse: AxiosResponse = {
  //      data: {},
  //      status: 200,
  //      statusText: 'OK',
  //      headers: {},
  //      config: {},
  //    };
  //
  //    mockIsLoginedCheck.mockReturnValue(true);
  //    mockGetTokens.mockReturnValue({
  //      accessToken: mockAccessToken,
  //      refreshToken: mockRefreshToken,
  //    });
  //    axios.mockRejectedValueOnce({ response: { status: 401 } });
  //    mockUpdateTokenUseRefreshToken.mockResolvedValue(mockAccessToken);
  //    axios.mockResolvedValue(mockResponse);
  //
  //    const { result } = renderHook(() => useProtectedApi());
  //
  //    const [response, error] = await result.current(
  //      'https://api.example.com',
  //      'GET',
  //    );
  //
  //    expect(response).toEqual(mockResponse);
  //    expect(error).toBeNull();
  //  });
});
