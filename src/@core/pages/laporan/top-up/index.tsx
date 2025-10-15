'use client';
import React, { useState } from 'react';
import WalletTopupTable from './table';
import { CheckDone01, CoinsHand, Wallet03 } from '@untitled-ui/icons-react';
import WalletTopupSummaryTable from '@/@core/pages/laporan/top-up/table/summary';
import WalletDisburstTable from '@/@core/pages/laporan/top-up/table/disburst';

const LaporanWalletTablePage = () => {
  const [tabActive, setTabActive] = useState('list');
  return (
    <div className="flex flex-col gap-[20px]">
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
          <h5 className="font-semibold text-2xl">Summary Saldo</h5>
        </div>
        <div
          className={`flex items-center gap-[8px] rounded w-full border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'disburst'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('disburst')}
        >
          <span
            className={`my-icon icon-72px ${
              tabActive === 'disburst' ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            <CoinsHand />
          </span>
          <h5 className="font-semibold text-2xl">Penarikan Saldo</h5>
        </div>
      </div>
      {tabActive === 'list' && <WalletTopupTable />}
      {tabActive === 'summary' && <WalletTopupSummaryTable />}
      {tabActive === 'disburst' && <WalletDisburstTable />}
    </div>
  );
};

export default LaporanWalletTablePage;
