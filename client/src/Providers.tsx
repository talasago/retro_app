import type { FC, PropsWithChildren } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router } from 'react-router-dom';

const Providers: FC<PropsWithChildren> = ({ children }) => (
  <HelmetProvider>
    <Router>{children}</Router>
  </HelmetProvider>
);

export default Providers;
