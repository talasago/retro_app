import { useState, useLayoutEffect, useMemo, useCallback } from 'react';
import type { RetrospectiveMethod } from 'domains/internal/retrospectiveJsonType';
import { mutate } from 'swr';
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
  const [isNextMutate, setIsNextMutate] = useState<boolean>(false); // TODO:後で名前変える

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
    async (method: RetrospectiveMethod) => {
      if (isNextMutate) {
        // キャッシュが無効化され、APIをコールするようになる
        await mutate(`retrospectiveMethodId/${method.id}`, undefined, {
          revalidate: true,
        });
        setIsNextMutate(false);
      }
      setIsModalOpen(true);
      setSelectedRetrospectiveMethod(method);
    },
    [isNextMutate],
  );

  // MEMO: スクロールするたびにレンダリングされる問題を回避するため、useCallbackを使用
  const handleClickRandomButton = useCallback(() => {
    // MEMO: コメント登録削除後にこのボタンを押しても、再フェッチ出来ない仕様。
    // そのユースケースが考えにくいのと、1/72の確率でしか発生しないため、このままにしておく。
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
          setIsNextMutate={setIsNextMutate}
        />
      )}
    </>
  );
};

export default RetrospectiveMethodListContainer;
