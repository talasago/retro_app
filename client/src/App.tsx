import type { FC } from 'react';
import { Box } from '@mui/material';
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '98vh',
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <HeaderContainer />
      </Box>
      <Box sx={{ flex: '1 0 auto' }}>
        <IndexRoutes />
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <Footer />
      </Box>
    </Box>
    <Alert />
  </Providers>
);

export default App;
