'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import { AlertTriangle } from '@untitled-ui/icons-react'; // gunakan ikon sesuai setup kamu

interface DeliveryInvoiceStatus {
  pending_delivery: number;
  pending_invoice: number;
}

const StatusDeliveryInvoice = () => {
  const [status, setStatus] = useState<DeliveryInvoiceStatus>({
    pending_delivery: 0,
    pending_invoice: 0,
  });

  const fetchStatus = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(
        '/dashboard/delivery-invoice-pending'
      );
      setStatus(resp.data);
    } catch (error) {
      console.error('Gagal memuat data status delivery & payment:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-5 flex flex-col items-center justify-center shadow-sm">
      <div className="flex items-center justify-center text-yellow-600 mb-2">
        <AlertTriangle className="w-6 h-6 mr-2" />
      </div>

      <h5 className="text-yellow-700 font-semibold text-lg mb-2 text-center">
        Status Delivery & Payment
      </h5>

      <div className="text-sm text-gray-700 text-center leading-relaxed">
        <p>Delivery Pending: {status.pending_delivery} transaksi</p>
        <p>Invoice Belum Dibayar: {status.pending_invoice} transaksi</p>
      </div>
    </div>
  );
};

export default StatusDeliveryInvoice;
