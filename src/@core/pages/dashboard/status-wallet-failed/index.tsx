'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import { AlertTriangle } from '@untitled-ui/icons-react';

interface WalletFailedStatus {
  failed_topup: number;
  failed_disburst: number;
}

const StatusWalletFailed = () => {
  const [status, setStatus] = useState<WalletFailedStatus>({
    failed_topup: 0,
    failed_disburst: 0,
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
    <div className="bg-red-50 border border-red-200 rounded-md p-5 flex flex-col items-center justify-center shadow-sm">
      <div className="flex items-center justify-center text-red-600 mb-2">
        <AlertTriangle className="w-6 h-6 mr-2" />
      </div>

      <h5 className="text-red-700 font-semibold text-lg mb-2 text-center">
        Topup & Tarik Saldo Gagal
      </h5>

      <div className="text-sm text-gray-700 text-center leading-relaxed">
        <p>Topup Gagal: {status.failed_topup} transaksi</p>
        <p>Tarik Saldo Gagal: {status.failed_disburst} transaksi</p>
      </div>
    </div>
  );
};

export default StatusWalletFailed;
