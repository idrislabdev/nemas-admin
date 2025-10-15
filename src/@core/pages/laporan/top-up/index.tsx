'use client';
import React, { useState } from 'react';
import WalletTopupTable from './table';
import { CheckDone01, Wallet03 } from '@untitled-ui/icons-react';
import WalletTopupSummaryTable from '@/@core/pages/laporan/top-up/table/summary';

const LaporanTopupPage = () => {
  const [tabActive, setTabActive] = useState('list');
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center gap-[20px]">
        <div
          className={`flex items-center gap-[8px] rounded w-full border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'list'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('list')}
        >
          <span
            className={`my-icon icon-72px ${
              tabActive === 'list' ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            <Wallet03 />
          </span>
          <h5 className="font-semibold text-2xl">TopUp Saldo</h5>
        </div>
        <div
          className={`flex items-center gap-[8px] rounded w-full border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'summary'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('summary')}
        >
          <span
            className={`my-icon icon-72px ${
              tabActive === 'summary' ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            <CheckDone01 />
          </span>
          <h5 className="font-semibold text-2xl">Summary TopUp Saldo</h5>
        </div>
      </div>
      {tabActive === 'list' && <WalletTopupTable />}
      {tabActive === 'summary' && <WalletTopupSummaryTable />}
    </div>
  );
};

export default LaporanTopupPage;
