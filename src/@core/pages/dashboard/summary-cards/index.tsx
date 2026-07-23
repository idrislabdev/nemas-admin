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

export interface ISummaryLoan {
  loan_weight: number;
}

export interface ISummaryInvestment {
  investment_weight: number;
}

const cardClass =
  'flex flex-col justify-center gap-3 h-[120px] rounded-xl border border-[#DCEBFF] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg';

const SummaryCards = () => {
  const [data, setData] = useState<ISummary>({} as ISummary);
  const [dataGold, setDataGold] = useState<ISummaryGold>({} as ISummaryGold);
  const [dataWallet, setDataWallet] = useState<ISummaryWallet>(
    {} as ISummaryWallet
  );
  const [dataInvestment, setDataInvestment] = useState<ISummaryInvestment>(
    {} as ISummaryInvestment
  );
  const [dataLoan, setDataLoan] = useState<ISummaryLoan>({} as ISummaryLoan);

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get('/dashboard/user-summary');
    setData(resp.data);
  }, []);

  const fetchDataGold = useCallback(async () => {
    const resp = await axiosInstance.get('/dashboard/gold-balance');
    setDataGold(resp.data);
  }, []);

  const fetchDataWallet = useCallback(async () => {
    const resp = await axiosInstance.get('/dashboard/wallet-balance');
    setDataWallet(resp.data);
  }, []);

  const fetchDataGadai = useCallback(async () => {
    const resp = await axiosInstance.get('/dashboard/loan');
    setDataLoan(resp.data);
  }, []);

  const fetchDataInvestment = useCallback(async () => {
    const resp = await axiosInstance.get('/dashboard/investment');
    setDataInvestment(resp.data);
  }, []);

  useEffect(() => {
    fetchData();
    fetchDataGold();
    fetchDataWallet();
    fetchDataInvestment();
    fetchDataGadai();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* ROW 1 */}
      <div className="flex gap-4">
        <div className={`w-1/4 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#2D7FF9]">
              <UsersCheck />
            </span>

            <span className="text-2xl font-bold text-[#1E3A5F]">
              {formatterNumber(data.total_active_user)}
            </span>
          </div>

          <label className="text-sm font-medium text-slate-500">
            Total Pengguna Aktif
          </label>
        </div>

        <div className={`w-1/4 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#2D7FF9]">
              <Users01 />
            </span>

            <span className="text-2xl font-bold text-[#1E3A5F]">
              {formatterNumber(data.total_user)}
            </span>
          </div>

          <label className="text-sm font-medium text-slate-500">
            Total Pengguna
          </label>
        </div>

        <div className={`w-1/4 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#2D7FF9]">
              <Building02 />
            </span>

            <span className="text-2xl font-bold text-[#1E3A5F]">
              {formatterNumber(data.total_toko_user)}
            </span>
          </div>

          <label className="text-sm font-medium text-slate-500">
            Total Toko Terdaftar
          </label>
        </div>

        <div className={`w-1/4 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#2D7FF9]">
              <Wallet02 />
            </span>

            <span className="text-2xl font-bold text-[#1E3A5F]">
              Rp{formatterNumber(dataWallet.balance)}
            </span>
          </div>

          <label className="text-sm font-medium text-slate-500">
            Saldo Wallet
          </label>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="flex gap-4">
        <div className={`w-1/3 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF7E8] text-[#D4A017]">
              <CoinsStacked01 />
            </span>

            <span className="text-2xl font-bold text-[#1E3A5F]">
              {formatterNumber(dataGold.saldo_nemas)} Gr
            </span>
          </div>

          <label className="text-sm font-medium text-slate-500">
            Saldo Emas (NEMAS)
          </label>
        </div>

        <div className={`w-1/3 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF7E8] text-[#D4A017]">
              <CoinsStacked02 />
            </span>

            <span className="text-2xl font-bold text-[#1E3A5F]">
              {formatterNumber(dataGold.saldo_user)} Gr
            </span>
          </div>

          <label className="text-sm font-medium text-slate-500">
            Saldo Emas (User)
          </label>
        </div>

        <div className={`w-1/3 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDECEC] text-[#E53935]">
              <CoinsStacked02 />
            </span>

            <span className="text-2xl font-bold text-[#1E3A5F]">
              {formatterNumber(dataLoan.loan_weight)} Gr
            </span>
          </div>

          <label className="text-sm font-medium text-slate-500">
            Gadai Emas
          </label>
        </div>

        <div className={`w-1/3 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAFBF3] text-[#16A34A]">
              <CoinsStacked02 />
            </span>

            <span className="text-2xl font-bold text-[#1E3A5F]">
              {formatterNumber(dataInvestment.investment_weight)} Gr
            </span>
          </div>

          <label className="text-sm font-medium text-slate-500">Deposito</label>
        </div>

        <div className={`w-1/3 ${cardClass}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3CD] text-[#C98A00]">
              <CoinsStacked02 />
            </span>

            <span className="text-2xl font-bold text-[#1E3A5F]">
              {formatterNumber(
                Number(
                  (
                    dataGold.saldo_nemas -
                    (dataGold.saldo_user +
                      dataInvestment.investment_weight +
                      dataLoan.loan_weight)
                  ).toFixed(2)
                )
              )}{' '}
              Gr
            </span>
          </div>

          <label className="text-sm font-medium text-slate-500">
            Sisa Stok Emas
          </label>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
