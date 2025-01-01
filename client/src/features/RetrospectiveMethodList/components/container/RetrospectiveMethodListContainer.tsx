import { useState, useLayoutEffect, useMemo, useCallback } from 'react';
// eslint-disable-next-line import/extensions
import retrospectiveData from '../../../../assets/retrospective.json';
// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import RetrospectiveMethodListPresenter from '../presenter/RetrospectiveMethodListPresenter';

const RetrospectiveMethodListContainer: React.FC = () => {
  const [isShowScrollToTop, setIsShowScrollToTop] = useState<boolean>(false);

  const updateisShowScrollToTop = (): void => {
    setIsShowScrollToTop(window.scrollY > 0);
  };

  useLayoutEffect(() => {
    window.addEventListener('resize', updateisShowScrollToTop);
    window.addEventListener('scroll', updateisShowScrollToTop);

    return () => {
      window.removeEventListener('resize', updateisShowScrollToTop);
      window.removeEventListener('scroll', updateisShowScrollToTop);
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
        isShowScrollToTop={isShowScrollToTop}
        onScrollToButtonClick={handleScrollToButtonClick}
        onRetrospectiveMethodPaperClick={handleRetrospectiveMethodPaperClick}
      />
    ),
    [isShowScrollToTop, handleRetrospectiveMethodPaperClick],
  );

  return memorizedPresenter;
};

export default RetrospectiveMethodListContainer;
