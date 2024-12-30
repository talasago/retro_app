import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import IndexRoutes from 'routes';
import Alert from 'components/container/Alert';
import Footer from 'components/container/Footer';
import HeaderContainer from 'components/container/HeaderContainer';
import Providers from './Providers';

const appTitle = import.meta.env.VITE_APP_TITLE;

const App: FC = () => (
  <Providers>
    <Helmet>
      <title>{appTitle}</title>
    </Helmet>
    <HeaderContainer />
    <IndexRoutes />
    <Footer />
    <Alert />
  </Providers>
);

export default App;
