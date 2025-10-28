import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';
import React, { useCallback, useEffect, useState } from 'react';

export interface ISummary {
  total_active_user: number;
  total_toko_user: number;
  total_user: number;
}

const SummaryCards = () => {
  const [data, setData] = useState<ISummary>({} as ISummary);
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(`/dashboard/user-summary`);
    setData(resp.data);
  }, []);

  useEffect(() => {
    fetchData();
  });

  return (
    <div className="flex items-center gap-[8px]">
      <div className="w-1/3 flex flex-col justify-center h-[120px] shadow-custom-1 rounded-md p-4">
        <label className="text-2xl text-green-700 font-semibold line-clamp-2">
          Total Pengguna Aktif
        </label>
        <span className="text-neutral-700 text-xl font-medium">
          {formatterNumber(data.total_active_user)}
        </span>
      </div>
      <div className="w-1/3 flex flex-col justify-center h-[120px] shadow-custom-1 rounded-md p-4">
        <label className="text-2xl text-green-700 font-semibold line-clamp-2">
          Total Pengguna Keseluruhan
        </label>
        <span className="text-neutral-700 text-xl font-medium">
          {formatterNumber(data.total_user)}
        </span>
      </div>
      <div className="w-1/3 flex flex-col justify-center h-[120px] shadow-custom-1 rounded-md p-4">
        <label className="text-2xl text-green-700 font-semibold line-clamp-2">
          Total Toko Terdaftar
        </label>
        <span className="text-neutral-700 text-xl font-medium">
          {formatterNumber(data.total_toko_user)}
        </span>
      </div>
    </div>
  );
};

export default SummaryCards;
