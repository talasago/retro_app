import { memo } from 'react';
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
    />
  );
};

export default memo(RetroMethodDetailModalContainer);
