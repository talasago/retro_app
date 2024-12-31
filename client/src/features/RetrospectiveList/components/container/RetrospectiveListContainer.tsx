// eslint-disable-next-line import/extensions
import retrospectiveData from '../../../../assets/retrospective.json';
import RetrospectiveListPresenter from '../presenter/RetrospectiveListPresenter';

const RetrospectiveListContainer: React.FC = () => {
  return (
    <RetrospectiveListPresenter
      RetrospectiveMethods={retrospectiveData.retrospectives}
    />
  );
};

export default RetrospectiveListContainer;
