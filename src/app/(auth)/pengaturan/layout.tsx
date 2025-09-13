'use client';

import { IUser } from '@/@core/@types/interface';
import React from 'react';

const PengaturanLayout = ({ children }: { children: React.ReactNode }) => {
  const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      {user &&
      user.menus.some((x) => x.name === 'Pengaturan' && x.accessible) ? (
        children
      ) : (
        <div className="main-container flex flex-col justify-center items-center">
          <h5>Not Authorize</h5>
        </div>
      )}
    </>
  );
};

export default PengaturanLayout;
