import { useEffect } from 'react';
import type { FC } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import RegistrationForm from '../features/SignUp/components/container/RegistrationForm';

const IndexRoutes: FC = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0); // 別ページに遷移するとき、#や戻る進むといった移動が無い場合にページトップにスクロールするようにしている
    }
  }, [hash, pathname]);

  return (
    <Routes>
      <Route path="*" element={<RegistrationForm />} />
    </Routes>
  );
};

export default IndexRoutes;
