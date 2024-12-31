import { useEffect } from 'react';
import type { FC } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ServiceTerm from 'components/container/ServiceTerm';
import HomeContainer from '../components/container/HomeContainer';
import RetrospectiveListContainer from '../features/RetrospectiveList/components/container/RetrospectiveListContainer';
export const ROUTES_LISTS = {} as const;

const IndexRoutes: FC = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0); // 別ページに遷移するとき、#や戻る進むといった移動が無い場合にページトップにスクロールするようにしている
    }
  }, [hash, pathname]);

  return (
    <Routes>
      <Route path="/" element={<HomeContainer />} />
      <Route path="*" element={<HomeContainer />} />
      <Route path="service_term" element={<ServiceTerm />} />
      <Route
        path="retrospective_list"
        element={<RetrospectiveListContainer />}
      />
    </Routes>
  );
};

export default IndexRoutes;
