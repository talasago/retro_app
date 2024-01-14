import { memo } from 'react';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { Frame1 } from './components/Frame1/Frame1';
import resets from './components/_resets.module.css';
import RegistrationForm from './features/SignUp/components/container/RegistrationForm';
import classes from './App.module.css';
interface Props {
  className?: string;
}

// 多分、classNameがそんなに変わらないのでmemo化してるのだと思われる。このprops辞退削除しても良さそうかも
// export const App: FC<Props> = memo(function App(props = {}) {
//  return (
//    <div className={`${resets.storybrainResets} ${classes.root}`}>
//      <Frame1 />
//    </div>
//  );
// });
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
