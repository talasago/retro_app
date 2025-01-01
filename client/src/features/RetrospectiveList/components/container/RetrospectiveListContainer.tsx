import type React from 'react';
import { useState, useLayoutEffect } from 'react';
// eslint-disable-next-line import/extensions
import retrospectiveData from '../../../../assets/retrospective.json';
// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import RetrospectiveListPresenter from '../presenter/RetrospectiveListPresenter';

const RetrospectiveListContainer: React.FC = () => {
  const [scrollY, setScrollY] = useState<number>(0);

  const updateScrollYPosition = (): void => {
    setScrollY(window.scrollY);
  };

  useLayoutEffect(() => {
    window.addEventListener('resize', updateScrollYPosition);
    window.addEventListener('scroll', updateScrollYPosition);

    return () => {
      window.removeEventListener('resize', updateScrollYPosition);
      window.removeEventListener('scroll', updateScrollYPosition);
    };
  });

  return (
    <RetrospectiveListPresenter
      retrospectiveMethods={retrospectiveData.retrospectives}
      retrospectiveSceneName={retrospectiveSceneName}
      scrollY={scrollY}
    />
  );
};

export default RetrospectiveListContainer;
