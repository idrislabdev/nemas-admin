'use client';
import { IInvestmentSummary } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { CoinsStacked02 } from '@untitled-ui/icons-react';
import React, { useCallback, useEffect, useState } from 'react';
import GoldInvestmentTable from './table';

const LaporanGoldInvestment = () => {
  const [dataReport, setDataReport] = useState<IInvestmentSummary>(
    {} as IInvestmentSummary
  );
  const [tabActive, setTabActive] = useState('physic');
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(`reports/gold-investment/summary`);
    const { data } = resp;
    setDataReport(data);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[20px]">
        <div
          className={`flex items-center gap-[8px] rounded w-full border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'physic'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('physic')}
        >
          <span
            className={`my-icon icon-72px ${
              tabActive === 'physic' ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            <CoinsStacked02 />
          </span>
          <div className="flex flex-col">
            <h5 className="font-semibold text-xl">Investasi Emas</h5>
            <label className="text-sm">
              Total Investasi :{' '}
              <span>
                {dataReport.total_investment
                  ? `${formatDecimal(dataReport.total_investment)} Gram`
                  : '-'}
              </span>
            </label>
            <label className="text-sm">
              Total Aktif :{' '}
              <span>
                {dataReport.total_active
                  ? `${formatDecimal(dataReport.total_active)} Gram`
                  : '-'}
              </span>
            </label>
            <label className="text-sm">
              Total Return :{' '}
              <span>
                {dataReport.total_return
                  ? `${formatDecimal(dataReport.total_return)} Gram`
                  : '-'}
              </span>
            </label>
          </div>
        </div>
      </div>
      <GoldInvestmentTable />
    </div>
  );
};

export default LaporanGoldInvestment;
