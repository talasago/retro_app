import { memo } from 'react';
import type { FC } from 'react';

import classes from './App.module.css';
import resets from './components/_resets.module.css';
import { Frame1 } from './components/Frame1/Frame1';

interface Props {
  className?: string;
}

// 多分、classNameがそんなに変わらないのでmemo化してるのだと思われる。このprops辞退削除しても良さそうかも
export const App: FC<Props> = memo(function App(props = {}) {
  return (
    <div className={`${resets.storybrainResets} ${classes.root}`}>
      <Frame1 />
    </div>
  );
});
