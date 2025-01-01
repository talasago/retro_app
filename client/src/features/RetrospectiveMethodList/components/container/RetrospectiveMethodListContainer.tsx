import { useState, useLayoutEffect, useMemo } from 'react';
// eslint-disable-next-line import/extensions
import retrospectiveData from '../../../../assets/retrospective.json';
// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import RetrospectiveMethodListPresenter from '../presenter/RetrospectiveMethodListPresenter';

const RetrospectiveMethodListContainer: React.FC = () => {
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

  const memorizedPresenter = useMemo(
    () => (
      <RetrospectiveMethodListPresenter
        retrospectiveMethods={retrospectiveData.retrospectives}
        retrospectiveSceneName={retrospectiveSceneName}
        scrollY={scrollY}
      />
    ),
    [scrollY],
  );

  return memorizedPresenter;
};

export default RetrospectiveMethodListContainer;
