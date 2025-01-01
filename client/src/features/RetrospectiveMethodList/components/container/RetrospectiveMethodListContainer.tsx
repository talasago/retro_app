import { useState, useLayoutEffect, useMemo, useCallback } from 'react';
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

  const handleScrollToButtonClick = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // MEMO: スクロールするたびにレンダリングされる問題を回避するため、useCallbackを使用
  // これが無いと、恐らく毎回新しい関数インスタンスがが生成されてるぽい
  const handleRetrospectiveMethodPaperClick = useCallback(() => {
    console.log('[tmp]Retro paper clicked.');
  }, []);

  const memorizedPresenter = useMemo(
    () => (
      <RetrospectiveMethodListPresenter
        retrospectiveMethods={retrospectiveData.retrospectives}
        retrospectiveSceneName={retrospectiveSceneName}
        scrollY={scrollY}
        onScrollToButtonClick={handleScrollToButtonClick}
        onRetrospectiveMethodPaperClick={handleRetrospectiveMethodPaperClick}
      />
    ),
    [scrollY, handleRetrospectiveMethodPaperClick],
  );

  return memorizedPresenter;
};

export default RetrospectiveMethodListContainer;
