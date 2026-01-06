'use client';
import React, { useState } from 'react';
import { CoinsStacked01, Wallet05 } from '@untitled-ui/icons-react';
import TarikEmasListTable from '@/@core/pages/laporan/tarik-emas/table/detail';
import TarikEmasSummaryTable from '@/@core/pages/laporan/tarik-emas/table/summary';

const LaporanTarikEmasTablePage = () => {
  const [tabActive, setTabActive] = useState('ringkasan');
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[20px]">
        <div
          className={`flex items-center gap-[8px] rounded w-1/2 border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'ringkasan'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('ringkasan')}
        >
          <span
            className={`my-icon icon-xl ${
              tabActive === 'ringkasan'
                ? 'text-neutral-600'
                : 'text-neutral-500'
            }`}
          >
            <Wallet05 />
          </span>
          <h5 className="font-semibold text-[17px]/[21px]">
            Rekapitulasi Tarik Emas
          </h5>
        </div>
        <div
          className={`flex items-center gap-[8px] rounded w-1/2 border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'detail'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('detail')}
        >
          <span
            className={`my-icon icon-xl ${
              tabActive === 'detail' ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            <CoinsStacked01 />
          </span>
          <h5 className="font-semibold text-[17px]/[21px]">
            Detail Tarik Emas
          </h5>
        </div>
      </div>
      {tabActive === 'detail' && <TarikEmasListTable />}
      {tabActive === 'ringkasan' && <TarikEmasSummaryTable />}
    </div>
  );
};

export default LaporanTarikEmasTablePage;
