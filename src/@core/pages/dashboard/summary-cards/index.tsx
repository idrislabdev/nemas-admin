import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';
import {
  Building02,
  CoinsStacked01,
  CoinsStacked02,
  Users01,
  UsersCheck,
  Wallet02,
} from '@untitled-ui/icons-react';
import React, { useCallback, useEffect, useState } from 'react';

export interface ISummary {
  total_active_user: number;
  total_toko_user: number;
  total_user: number;
}

export interface ISummaryGold {
  saldo_nemas: number;
  saldo_user: number;
}

export interface ISummaryWallet {
  balance: number;
}

const SummaryCards = () => {
  const [data, setData] = useState<ISummary>({} as ISummary);
  const [dataGold, setDataGold] = useState<ISummaryGold>({} as ISummaryGold);
  const [dataWallet, setDataWallet] = useState<ISummaryWallet>(
    {} as ISummaryWallet
  );
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(`/dashboard/user-summary`);
    setData(resp.data);
  }, []);

  const fetchDataGold = useCallback(async () => {
    const resp = await axiosInstance.get(`/dashboard/gold-balance`);
    setDataGold(resp.data);
  }, []);

  const fetchDataWallet = useCallback(async () => {
    const resp = await axiosInstance.get(`/dashboard/wallet-balance`);
    setDataWallet(resp.data);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchDataGold();
  }, []);

  useEffect(() => {
    fetchDataWallet();
  }, []);

  return (
    <div className="flex items-center gap-[8px]">
      <div className="w-1/3 flex flex-col justify-center gap-2 h-[120px] shadow-custom-1 rounded-md p-4">
        <div className="flex items-center gap-2">
          <span className="my-icon w-[36px] h-[36px] flex flex-col justify-center items-center rounded bg-green-500 text-white">
            <UsersCheck />
          </span>
          <span className="text-neutral-700 font-medium">
            {formatterNumber(data.total_active_user)}
          </span>
        </div>
        <label className="text-sm text-green-700">Total Pengguna Aktif</label>
      </div>
      <div className="w-1/3 flex flex-col justify-center gap-2 h-[120px] shadow-custom-1 rounded-md p-4">
        <div className="flex items-center gap-2">
          <span className="my-icon w-[36px] h-[36px] flex flex-col justify-center items-center rounded bg-green-500 text-white">
            <Users01 />
          </span>
          <span className="text-neutral-700 font-medium">
            {formatterNumber(data.total_user)}
          </span>
        </div>
        <label className="text-sm text-green-700">Total Pengguna</label>
      </div>
      <div className="w-1/3 flex flex-col justify-center gap-2 h-[120px] shadow-custom-1 rounded-md p-4">
        <div className="flex items-center gap-2">
          <span className="my-icon w-[36px] h-[36px] flex flex-col justify-center items-center rounded bg-green-500 text-white">
            <Building02 />
          </span>
          <span className="text-neutral-700 font-medium">
            {formatterNumber(data.total_toko_user)}
          </span>
        </div>
        <label className="text-sm text-green-700">Total Toko Terdaftar</label>
      </div>
      <div className="w-1/3 flex flex-col justify-center gap-2 h-[120px] shadow-custom-1 rounded-md p-4">
        <div className="flex items-center gap-2">
          <span className="my-icon w-[36px] h-[36px] flex flex-col justify-center items-center rounded bg-green-500 text-white">
            <CoinsStacked01 />
          </span>
          <span className="text-neutral-700 font-medium">
            {formatterNumber(dataGold.saldo_nemas)} Gr
          </span>
        </div>
        <label className="text-sm text-green-700">Saaldo Emas (Nemas)</label>
      </div>
      <div className="w-1/3 flex flex-col justify-center gap-2 h-[120px] shadow-custom-1 rounded-md p-4">
        <div className="flex items-center gap-2">
          <span className="my-icon w-[36px] h-[36px] flex flex-col justify-center items-center rounded bg-green-500 text-white">
            <CoinsStacked02 />
          </span>
          <span className="text-neutral-700 font-medium">
            {formatterNumber(dataGold.saldo_user)} Gr
          </span>
        </div>
        <label className="text-sm text-green-700">Saaldo Emas (User)</label>
      </div>
      <div className="w-1/3 flex flex-col justify-center gap-2 h-[120px] shadow-custom-1 rounded-md p-4">
        <div className="flex items-center gap-2">
          <span className="my-icon w-[36px] h-[36px] flex flex-col justify-center items-center rounded bg-green-500 text-white">
            <Wallet02 />
          </span>
          <span className="text-neutral-700 font-medium">
            Rp{formatterNumber(dataWallet.balance)}
          </span>
        </div>
        <label className="text-sm text-green-700">Saaldo Wallet</label>
      </div>
    </div>
  );
};

export default SummaryCards;
