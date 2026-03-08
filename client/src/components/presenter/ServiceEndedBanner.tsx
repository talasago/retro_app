import type { FC } from 'react';
import { Alert } from '@mui/material';

const ServiceEndedBanner: FC = () => {
  return (
    <Alert severity="warning" sx={{ borderRadius: 0 }}>
      本サービスのユーザー登録・ログイン・コメント機能は終了しました。
    </Alert>
  );
};

export default ServiceEndedBanner;
