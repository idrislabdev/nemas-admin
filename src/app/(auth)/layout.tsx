'use client';

import MainSidebar from '@/@core/components/main-sidebar';
import { GlobalsProvider } from '@/@core/context/globalContext';
import withAuthPage from '@/@core/hoc/withAuthPage';
import React from 'react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <GlobalsProvider>
      <main className="xadmin-page">
        <MainSidebar />
        <section className="xadmin-section">{children}</section>
      </main>
    </GlobalsProvider>
  );
};

export default withAuthPage(AuthLayout);
