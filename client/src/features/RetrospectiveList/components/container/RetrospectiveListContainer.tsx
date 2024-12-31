// eslint-disable-next-line import/extensions
import retrospectiveData from '../../../../assets/retrospective.json';
// eslint-disable-next-line import/extensions
import retrospectiveSceneName from '../../../../assets/retrospectiveSceneName.json';
import RetrospectiveListPresenter from '../presenter/RetrospectiveListPresenter';

const RetrospectiveListContainer: React.FC = () => {
  return (
    <RetrospectiveListPresenter
      retrospectiveMethods={retrospectiveData.retrospectives}
      retrospectiveSceneName={retrospectiveSceneName}
    />
  );
};

export default RetrospectiveListContainer;
