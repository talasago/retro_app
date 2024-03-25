import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import IndexRoutes from 'routes';
import Providers from './Providers';

const appTitle = import.meta.env.VITE_APP_TITLE;

const App: FC = () => (
  <Providers>
    <Helmet>
      <title>{appTitle}</title>
    </Helmet>
    <IndexRoutes />
  </Providers>
);

export default App;
