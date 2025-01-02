import { useState, useLayoutEffect, useMemo, useCallback } from 'react';
// eslint-disable-next-line import/extensions
import retrospectiveData from '../../../../assets/retrospective.json';
// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import RetrospectiveMethodListPresenter from '../presenter/RetrospectiveMethodListPresenter';

// HACK: どのコンポーネント向けのロジックかわかるようにリファクタしたい
const RetrospectiveMethodListContainer: React.FC = () => {
  const [isShowScrollToTop, setIsShowScrollToTop] = useState<boolean>(false);
  const [isShowRetrospectiveMethodList, setIsShowRetrospectiveMethodList] =
    useState<boolean>(false);
  const [checkedScenes, setCheckedScenes] = useState<number[]>([]);

  // MEMO: checkしてもstateが更新されなくなるため、useCallbackを使用
  // MEMO: checkしただけでRetrospectiveMethodPaperAreaが再度レンダリングされてしまうが、許容する。対処方法がわからない。
  const handleChangeScenesCheckbox = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const checkedTargetValue = parseInt(event.target.value, 10); // 10進数でパース
      setCheckedScenes(
        event.target.checked
          ? [...checkedScenes, checkedTargetValue]
          : checkedScenes.filter(
              (checkedScene) => checkedScene !== checkedTargetValue,
            ),
      );
      // TODO: 後で消す
      console.log(checkedScenes);
    },
    [checkedScenes],
  );

  // MEMO: スクロールするたびにレンダリングされる問題を回避するため、useCallbackを使用
  // これが無いと、恐らく毎回新しい関数インスタンスがが生成されてるぽい
  const handleClickRetroMethodListShowButton = useCallback(() => {
    setIsShowRetrospectiveMethodList(true);
  }, []);

  // MEMO: スクロールするたびにレンダリングされる問題を回避するため、useCallbackを使用
  const handleClickRetrospectiveMethodPaper = useCallback(() => {
    console.log('[tmp]Retro paper clicked.');
  }, []);

  const updateIsShowScrollToTop = (): void => {
    setIsShowScrollToTop(window.scrollY > 0 && isShowRetrospectiveMethodList);
  };

  useLayoutEffect(() => {
    window.addEventListener('resize', updateIsShowScrollToTop);
    window.addEventListener('scroll', updateIsShowScrollToTop);

    return () => {
      window.removeEventListener('resize', updateIsShowScrollToTop);
      window.removeEventListener('scroll', updateIsShowScrollToTop);
    };
  });

  const handleClickScrollToButton = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const memorizedPresenter = useMemo(
    () => (
      <RetrospectiveMethodListPresenter
        retrospectiveMethods={retrospectiveData.retrospectives}
        retrospectiveSceneNames={retrospectiveSceneName}
        isShowScrollToTop={isShowScrollToTop}
        isShowRetrospectiveMethodList={isShowRetrospectiveMethodList}
        onClickScrollToButton={handleClickScrollToButton}
        onClickRetrospectiveMethodPaper={handleClickRetrospectiveMethodPaper}
        onClickRetroMethodListShowButton={handleClickRetroMethodListShowButton}
        onChangeScenesCheckbox={handleChangeScenesCheckbox}
      />
    ),
    [
      isShowScrollToTop,
      isShowRetrospectiveMethodList,
      handleClickRetrospectiveMethodPaper,
      handleClickRetroMethodListShowButton,
      handleChangeScenesCheckbox,
    ],
  );

  return memorizedPresenter;
};

export default RetrospectiveMethodListContainer;
