'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import { AlertTriangle } from '@untitled-ui/icons-react';
import Link from 'next/link';

interface WalletFailedStatus {
  failed_topup: number;
  failed_disburst: number;
  failed_redeem: number;
  failed_buy: number;
  failed_loan: number;
  failed_monthly_cost: number;
}

const StatusWalletFailed = () => {
  const [status, setStatus] = useState<WalletFailedStatus>({
    failed_topup: 0,
    failed_disburst: 0,
    failed_redeem: 0,
    failed_buy: 0,
    failed_loan: 0,
    failed_monthly_cost: 0,
  });

  const fetchStatus = useCallback(async () => {
    try {
      const resp = await axiosInstance.get('/dashboard/wallet-failed-topup');
      setStatus(resp.data);
    } catch (error) {
      console.error('Gagal memuat data status wallet gagal:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="rounded-xl border border-[#D9E7FB] bg-white p-5 shadow-sm  flex flex-col">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        <div>
          <h5 className="text-lg font-semibold text-primary">
            3rd Party Failed Transactions
          </h5>

          <p className="text-xs text-slate-500">
            Daftar transaksi pihak ketiga yang gagal diproses.
          </p>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <Link
          href="/laporan/vendor-3rd?transaction_type=Topup%20Saldo&is_failed=true"
          className="flex items-center justify-between rounded-lg border border-[#EEF4FB] p-3 transition hover:bg-[#F8FBFF]"
        >
          <div>
            <div className="font-medium text-slate-700">Topup Saldo</div>
            <div className="text-xs text-slate-500">
              Gagal transfer dana ke wallet
            </div>
          </div>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
            {status.failed_topup}
          </span>
        </Link>

        <Link
          href="/laporan/vendor-3rd?transaction_type=Tarik%20Saldo&is_failed=true"
          className="flex items-center justify-between rounded-lg border border-[#EEF4FB] p-3 transition hover:bg-[#F8FBFF]"
        >
          <div>
            <div className="font-medium text-slate-700">Tarik Saldo</div>
            <div className="text-xs text-slate-500">Gagal pencairan saldo</div>
          </div>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
            {status.failed_disburst}
          </span>
        </Link>

        <Link
          href="/laporan/vendor-3rd?transaction_type=Tarik%20Emas&is_failed=true"
          className="flex items-center justify-between rounded-lg border border-[#EEF4FB] p-3 transition hover:bg-[#F8FBFF]"
        >
          <div>
            <div className="font-medium text-slate-700">Pay Tarik Emas</div>
            <div className="text-xs text-slate-500">
              Gagal pembayaran tarik emas
            </div>
          </div>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
            {status.failed_redeem}
          </span>
        </Link>

        <Link
          href="/laporan/vendor-3rd?transaction_type=Beli%20Produk%20Emas&is_failed=true"
          className="flex items-center justify-between rounded-lg border border-[#EEF4FB] p-3 transition hover:bg-[#F8FBFF]"
        >
          <div>
            <div className="font-medium text-slate-700">
              Pay Beli Produk Emas
            </div>
            <div className="text-xs text-slate-500">
              Gagal pembayaran pembelian emas
            </div>
          </div>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
            {status.failed_buy}
          </span>
        </Link>

        <Link
          href="/laporan/vendor-3rd?transaction_type=Transfer%20Gadai&is_failed=true"
          className="flex items-center justify-between rounded-lg border border-[#EEF4FB] p-3 transition hover:bg-[#F8FBFF]"
        >
          <div>
            <div className="font-medium text-slate-700">Transfer Gadai</div>
            <div className="text-xs text-slate-500">
              Gagal transfer dana gadai
            </div>
          </div>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
            {status.failed_loan}
          </span>
        </Link>

        <Link
          href="/laporan/vendor-3rd?transaction_type=Bayar%20Biaya%20Bulanan&is_failed=true"
          className="flex items-center justify-between rounded-lg border border-[#EEF4FB] p-3 transition hover:bg-[#F8FBFF]"
        >
          <div>
            <div className="font-medium text-slate-700">Pay Cost Bulanan</div>
            <div className="text-xs text-slate-500">
              Gagal pembayaran biaya bulanan
            </div>
          </div>

          <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
            {status.failed_monthly_cost}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default StatusWalletFailed;
