import type { FC, PropsWithChildren } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from 'stores/store';

const Providers: FC<PropsWithChildren> = ({ children }) => (
  <HelmetProvider>
    <ReduxProvider store={store}>
      <Router>{children}</Router>
    </ReduxProvider>
  </HelmetProvider>
);

export default Providers;
