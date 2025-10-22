'use client';
import React, { useState } from 'react';
import WalletTopupTable from './table';
import {
  CheckDone01,
  CoinsHand,
  LayoutAlt02,
  Wallet03,
} from '@untitled-ui/icons-react';
import WalletTopupSummaryTable from '@/@core/pages/laporan/wallet/table/summary';
import WalletDisburstTable from '@/@core/pages/laporan/wallet/table/disburst';
import WalletFinancialSummary from '@/@core/pages/laporan/wallet/table/ringkasan-keuangan';

const LaporanWalletTablePage = () => {
  const [tabActive, setTabActive] = useState('list');
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[20px]">
        <div
          className={`flex items-center gap-[8px] rounded w-1/4 border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'list'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('list')}
        >
          <span
            className={`my-icon icon-xl ${
              tabActive === 'list' ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            <Wallet03 />
          </span>
          <h5 className="font-semibold text-[17px]/[21px]">TopUp Saldo</h5>
        </div>
        <div
          className={`flex items-center gap-[8px] rounded w-1/4 border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'summary'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('summary')}
        >
          <span
            className={`my-icon icon-xl ${
              tabActive === 'summary' ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            <CheckDone01 />
          </span>
          <h5 className="font-semibold text-[17px]/[21px]">Summary Saldo</h5>
        </div>
        <div
          className={`flex items-center gap-[8px] rounded w-1/4 border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'disburst'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('disburst')}
        >
          <span
            className={`my-icon icon-xl ${
              tabActive === 'disburst' ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            <CoinsHand />
          </span>
          <h5 className="font-semibold text-[17px]/[21px]">Penarikan Saldo</h5>
        </div>
        <div
          className={`flex items-center gap-[8px] rounded w-1/4 border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'ringkasan_keuangan'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('ringkasan_keuangan')}
        >
          <span
            className={`my-icon icon-xl ${
              tabActive === 'ringkasan_keuangan'
                ? 'text-neutral-600'
                : 'text-neutral-500'
            }`}
          >
            <LayoutAlt02 />
          </span>
          <h5 className="font-semibold text-[17px]/[21px]">
            Ringkasan Keuangan
          </h5>
        </div>
      </div>
      {tabActive === 'list' && <WalletTopupTable />}
      {tabActive === 'summary' && <WalletTopupSummaryTable />}
      {tabActive === 'disburst' && <WalletDisburstTable />}
      {tabActive === 'ringkasan_keuangan' && <WalletFinancialSummary />}
    </div>
  );
};

export default LaporanWalletTablePage;
