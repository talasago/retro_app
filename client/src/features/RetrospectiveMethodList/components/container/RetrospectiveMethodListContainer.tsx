import { useState, useLayoutEffect, useMemo, useCallback } from 'react';

import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';
// eslint-disable-next-line import/extensions
import retrospectiveData from '../../../../assets/retrospective.json';
// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import RetrospectiveMethodListPresenter from '../presenter/RetrospectiveMethodListPresenter';
import RetroMethodDetailModalContainer from './RetrospectiveMethodDetailModalContainer';

// HACK: どのコンポーネント向けのロジックかわかるようにリファクタしたい
const RetrospectiveMethodListContainer: React.FC = () => {
  const [isShowScrollToTop, setIsShowScrollToTop] = useState<boolean>(false);
  const [isShowRetrospectiveMethodList, setIsShowRetrospectiveMethodList] =
    useState<boolean>(false);
  const [checkedScenes, setCheckedScenes] = useState<number[]>([]);
  const [retrospectiveMethods, setRetrospectiveMethods] = useState<
    RetrospectiveMethod[]
  >(retrospectiveData.retrospectives);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRetrospectiveMethod, setSelectedRetrospectiveMethod] =
    useState<RetrospectiveMethod>();

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
    },
    [checkedScenes],
  );

  // MEMO: スクロールするたびにレンダリングされる問題を回避するため、useCallbackを使用
  // これが無いと、恐らく毎回新しい関数インスタンスがが生成されてるぽい
  const handleClickRetroMethodListShowButton = useCallback(() => {
    setIsShowRetrospectiveMethodList(true);
    setRetrospectiveMethods(
      retrospectiveData.retrospectives.filter((retrospective) => {
        // チェックボックスはAND条件で検索する
        return checkedScenes.every((checkedScene) => {
          return retrospective.easyToUseScenes.includes(checkedScene);
        });
      }),
    );
  }, [checkedScenes]);

  // MEMO: スクロールするたびにレンダリングされる問題を回避するため、useCallbackを使用
  const handleClickRetrospectiveMethodPaper = useCallback(
    (method: RetrospectiveMethod) => {
      setIsModalOpen(true);
      setSelectedRetrospectiveMethod(method);
    },
    [],
  );

  // MEMO: スクロールするたびにレンダリングされる問題を回避するため、useCallbackを使用
  const handleClickRandomButton = useCallback(() => {
    setIsModalOpen(true);
    setSelectedRetrospectiveMethod(
      retrospectiveMethods[
        Math.floor(Math.random() * retrospectiveMethods.length)
      ],
    );
  }, [retrospectiveMethods]);

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
        retrospectiveMethods={retrospectiveMethods}
        retrospectiveSceneNames={retrospectiveSceneName}
        isShowScrollToTop={isShowScrollToTop}
        isShowRetrospectiveMethodList={isShowRetrospectiveMethodList}
        onClickScrollToButton={handleClickScrollToButton}
        onClickRetrospectiveMethodPaper={handleClickRetrospectiveMethodPaper}
        onClickRetroMethodListShowButton={handleClickRetroMethodListShowButton}
        onClickRandomButton={handleClickRandomButton}
        onChangeScenesCheckbox={handleChangeScenesCheckbox}
      />
    ),
    [
      retrospectiveMethods,
      isShowScrollToTop,
      isShowRetrospectiveMethodList,
      handleClickRetrospectiveMethodPaper,
      handleClickRetroMethodListShowButton,
      handleChangeScenesCheckbox,
      handleClickRandomButton,
    ],
  );

  return (
    <>
      {memorizedPresenter}
      {selectedRetrospectiveMethod && (
        <RetroMethodDetailModalContainer
          isOpen={isModalOpen}
          retrospectiveMethod={selectedRetrospectiveMethod}
          onCloseModal={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default RetrospectiveMethodListContainer;
