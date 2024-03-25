import { useEffect } from 'react';
import type { FC } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from '../components/presenter/Home';
import RegistrationForm from '../features/SignUp/components/container/RegistrationForm';
import LoginForm from '../features/Login/components/container/LoginForm';

const IndexRoutes: FC = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0); // 別ページに遷移するとき、#や戻る進むといった移動が無い場合にページトップにスクロールするようにしている
    }
  }, [hash, pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="sign_up" element={<RegistrationForm />} />
      <Route path="login" element={<LoginForm />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default IndexRoutes;
