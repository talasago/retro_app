import { memo } from 'react';
import axios, { type AxiosResponse } from 'axios';
import { type apiSchemas } from 'domains/internal/apiSchema';
import { COMMENT_URL } from 'domains/internal/constants/apiUrls';
import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';
import RetrospectiveMethodDetailModalPresenter from '../presenter/RetrospectiveMethodDetailModalPresenter';

interface RetrospectiveMethodDetailModalContainerProps {
  isOpen: boolean;
  retrospectiveMethod: RetrospectiveMethod;
  onCloseModal: () => void;
}

const RetroMethodDetailModalContainer: React.FC<
  RetrospectiveMethodDetailModalContainerProps
> = ({ isOpen, retrospectiveMethod, onCloseModal }) => {
  return (
    <RetrospectiveMethodDetailModalPresenter
      isOpen={isOpen}
      onCloseModal={onCloseModal}
      retrospectiveMethod={retrospectiveMethod}
      fetchComments={fetchComments}
    />
  );
};

export default memo(RetroMethodDetailModalContainer);

const fetchComments = async (
  retrospectiveMethodId: number,
): Promise<
  AxiosResponse<apiSchemas['schemas']['GetCommentApiResponseBody']>
> => {
  return await axios.get(COMMENT_URL(retrospectiveMethodId));
};
