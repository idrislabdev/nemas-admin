'use client';
import { IGoldSTock } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { Certificate02, CoinsStacked02 } from '@untitled-ui/icons-react';
import React, { useCallback, useEffect, useState } from 'react';

const LaporanStockView = () => {
  const [dataStock, setDataStock] = useState<IGoldSTock>({} as IGoldSTock);
  const [tabActive, setTabActive] = useState('physic');
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(`reports/gold-stock/summary`);
    const { data } = resp;
    setDataStock(data);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[20px]">
        <div
          className={`flex items-center gap-[8px] rounded w-1/2 border px-[20px] py-[10px] cursor-pointer ${
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
            <h5 className="font-semibold text-xl">Stock Emas Fisik</h5>
            <label className="text-sm">
              Stock :{' '}
              <span>
                {dataStock.physical_stock
                  ? `${formatDecimal(
                      dataStock.physical_stock.total_stock
                    )} Gram`
                  : '-'}
              </span>
            </label>
            <label className="text-sm">
              In :{' '}
              <span>
                {dataStock.physical_stock
                  ? `${formatDecimal(dataStock.physical_stock.total_in)} Gram`
                  : '-'}
              </span>
            </label>
            <label className="text-sm">
              Out :{' '}
              <span>
                {dataStock.physical_stock
                  ? `${formatDecimal(dataStock.physical_stock.total_out)} Gram`
                  : '-'}
              </span>
            </label>
          </div>
        </div>
        <div
          className={`flex items-center gap-[8px] rounded w-1/2 border px-[20px] py-[10px] cursor-pointer ${
            tabActive === 'digital'
              ? 'bg-gray-100 text-neutral-600 border-gray-300'
              : 'border-gray-200'
          }`}
          onClick={() => setTabActive('digital')}
        >
          <span
            className={`my-icon icon-72px ${
              tabActive === 'digital' ? 'text-neutral-600' : 'text-neutral-500'
            }`}
          >
            <Certificate02 />
          </span>
          <div className="flex flex-col">
            <h5 className="font-semibold text-xl">Stock Emas Digital</h5>
            <label className="text-sm">
              Stock :{' '}
              <span>
                {dataStock.digital_stock
                  ? `${formatDecimal(dataStock.digital_stock.total_stock)} Gram`
                  : '-'}
              </span>
            </label>
            <label className="text-sm">
              In :{' '}
              <span>
                {dataStock.digital_stock
                  ? `${formatDecimal(dataStock.digital_stock.total_in)} Gram`
                  : '-'}
              </span>
            </label>
            <label className="text-sm">
              Out :{' '}
              <span>
                {dataStock.digital_stock
                  ? `${formatDecimal(dataStock.digital_stock.total_out)} Gram`
                  : '-'}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanStockView;
