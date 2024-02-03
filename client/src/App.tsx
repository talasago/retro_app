import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import RegistrationForm from './features/SignUp/components/container/RegistrationForm';

const appTitle = import.meta.env.VITE_APP_TITLE;

const App: FC = () => (
  <div>
    <Helmet>
      <title>{appTitle}</title>
    </Helmet>
    <RegistrationForm />
  </div>
);

export default App;
