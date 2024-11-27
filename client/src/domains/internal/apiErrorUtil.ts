import axios, { type AxiosError } from 'axios';
import { type apiSchemas } from './apiSchema';

export const isClientErrorResponseBody = (
  error: unknown,
): error is AxiosError<apiSchemas['schemas']['ClientErrorResponseBody']> => {
  return (
    axios.isAxiosError(error) &&
    error.response !== undefined &&
    (error.response?.data as apiSchemas['schemas']['ClientErrorResponseBody'])
      .message !== undefined
  );
};

export const isHTTPValidationError = (
  error: unknown,
): error is AxiosError<apiSchemas['schemas']['HTTPValidationError']> => {
  return (
    axios.isAxiosError(error) &&
    error.response !== undefined &&
    (error.response?.data as apiSchemas['schemas']['HTTPValidationError'])
      .detail !== undefined
  );
};
