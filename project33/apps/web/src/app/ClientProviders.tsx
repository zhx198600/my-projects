'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>{children}</AuthProvider>
    </ConfigProvider>
  );
}
