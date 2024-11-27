import { useDispatch } from 'react-redux';
import { signUpModalSlice } from 'stores/signUpModal';
import type { AppDispatch } from 'stores/store';
import HomePresenter from 'components/presenter/HomePresenter';

const HomeContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { openSignUpModal } = signUpModalSlice.actions;

  const handleOpenSignUpModal = (): void => {
    dispatch(openSignUpModal());
  };

  return <HomePresenter onOpenSignUpModal={handleOpenSignUpModal} />;
};

export default HomeContainer;
