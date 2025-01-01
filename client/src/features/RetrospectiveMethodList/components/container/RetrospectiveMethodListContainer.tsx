import { useState, useLayoutEffect, useMemo, useCallback } from 'react';
// eslint-disable-next-line import/extensions
import retrospectiveData from '../../../../assets/retrospective.json';
// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import RetrospectiveMethodListPresenter from '../presenter/RetrospectiveMethodListPresenter';

const RetrospectiveMethodListContainer: React.FC = () => {
  const [isShowScrollToTop, setIsShowScrollToTop] = useState<boolean>(false);
  const [isShowRetrospectiveMethodList, setIsShowRetrospectiveMethodList] =
    useState<boolean>(false);

  const updateIsShowScrollToTop = (): void => {
    setIsShowScrollToTop(window.scrollY > 0 && isShowRetrospectiveMethodList);
  };

  const handleRetroMethodListShowButtonClick = (): void => {
    setIsShowRetrospectiveMethodList(true);
  };

  useLayoutEffect(() => {
    window.addEventListener('resize', updateIsShowScrollToTop);
    window.addEventListener('scroll', updateIsShowScrollToTop);

    return () => {
      window.removeEventListener('resize', updateIsShowScrollToTop);
      window.removeEventListener('scroll', updateIsShowScrollToTop);
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
        retrospectiveSceneNames={retrospectiveSceneName}
        isShowScrollToTop={isShowScrollToTop}
        isShowRetrospectiveMethodList={isShowRetrospectiveMethodList}
        onScrollToButtonClick={handleScrollToButtonClick}
        onRetrospectiveMethodPaperClick={handleRetrospectiveMethodPaperClick}
        onRetroMethodListShowButtonClick={handleRetroMethodListShowButtonClick}
      />
    ),
    [
      isShowScrollToTop,
      isShowRetrospectiveMethodList,
      handleRetrospectiveMethodPaperClick,
    ],
  );

  return memorizedPresenter;
};

export default RetrospectiveMethodListContainer;
