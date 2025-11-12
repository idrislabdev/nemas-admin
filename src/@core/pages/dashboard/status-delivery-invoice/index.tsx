'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import { AlertTriangle } from '@untitled-ui/icons-react';
import Link from 'next/link';

interface DeliveryInvoiceStatus {
  pending_delivery: number;
  pending_invoice: number;
  pending_loan_payment: number;
  pending_monthly_cost: number;
}

const StatusDeliveryInvoice = () => {
  const [status, setStatus] = useState<DeliveryInvoiceStatus>({
    pending_delivery: 0,
    pending_invoice: 0,
    pending_loan_payment: 0,
    pending_monthly_cost: 0,
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
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-5 flex flex-col items-center justify-center shadow-sm h-[250px]">
      <div className="flex items-center justify-center text-yellow-600 mb-2">
        <AlertTriangle className="w-6 h-6 mr-2" />
      </div>

      <h5 className="text-yellow-700 font-semibold text-lg mb-2 text-center">
        Status Delivery & Payment
      </h5>

      <div className="text-sm text-gray-700 text-center leading-relaxed space-y-1">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>Order Belum Dikirim: {status.pending_delivery} transaksi</span>
          <div className="flex items-center gap-2">
            (
            <Link
              href={`/transaksi/emas-fisik?is_picked_up=false`}
              className="text-blue-500 underline"
            >
              Emas Fisik
            </Link>
            <span className="text-blue-500"> | </span>
            <Link
              href={`/transaksi/tarik-emas?is_picked_up=false`}
              className="text-blue-500 underline"
            >
              Tarik Emas
            </Link>
            )
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>Invoice Belum Dibayar: {status.pending_invoice} transaksi</span>
          <div className="flex items-center gap-2">
            (
            <Link
              href={`/transaksi/emas-fisik?status=unpaid`}
              className="text-blue-500 underline"
            >
              Emas Fisik
            </Link>
            <span className="text-blue-500"> | </span>
            <Link
              href={`/transaksi/tarik-emas?status=unpaid`}
              className="text-blue-500 underline"
            >
              Tarik Emas
            </Link>
            )
          </div>
        </div>

        <p>Gadai Belum Dibayar H-3: {status.pending_loan_payment} transaksi</p>
        <p>
          Biaya Bulanan Belum Dibayar: {status.pending_monthly_cost} transaksi
        </p>
      </div>
    </div>
  );
};

export default StatusDeliveryInvoice;
