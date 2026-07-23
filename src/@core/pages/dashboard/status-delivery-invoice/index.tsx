'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import { AlertTriangle } from '@untitled-ui/icons-react';
import Link from 'next/link';
import dayjs from 'dayjs';

interface DeliveryInvoiceStatus {
  pending_delivery: number;
  pending_invoice: number;
  pending_loan_payment: number;
  pending_monthly_cost: number;
  pending_loan_payment_today: number;
}

const StatusDeliveryInvoice = () => {
  const [status, setStatus] = useState<DeliveryInvoiceStatus>({
    pending_delivery: 0,
    pending_invoice: 0,
    pending_loan_payment: 0,
    pending_monthly_cost: 0,
    pending_loan_payment_today: 0,
  });

  const today = dayjs().format('YYYY-MM-DD');
  const today3 = dayjs().add(3, 'day').format('YYYY-MM-DD');

  const fetchStatus = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(
        '/dashboard/delivery-invoice-pending'
      );

      setStatus(resp.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="rounded-xl border border-[#D9E7FB] bg-white p-5 shadow-sm h-[560px] flex flex-col">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF6FF]">
          <AlertTriangle className="h-6 w-6 text-primary" />
        </div>

        <div>
          <h5 className="text-lg font-semibold text-primary">
            Action Required
          </h5>

          <p className="text-xs text-slate-500">
            Delivery, invoice dan pembayaran yang memerlukan tindak lanjut.
          </p>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {/* Delivery */}
        <div className="rounded-lg border border-[#EEF4FB] p-3 hover:bg-[#F8FBFF] transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-700">
                Order Belum Dikirim
              </div>

              <div className="mt-1 flex gap-2 text-xs">
                <Link
                  href="/transaksi/emas-fisik?is_picked_up=false"
                  className="text-primary hover:underline"
                >
                  Emas Fisik
                </Link>

                <span>|</span>

                <Link
                  href="/transaksi/tarik-emas?is_picked_up=false"
                  className="text-primary hover:underline"
                >
                  Tarik Emas
                </Link>
              </div>
            </div>

            <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-sm font-semibold text-primary">
              {status.pending_delivery}
            </span>
          </div>
        </div>

        {/* Invoice */}
        <div className="rounded-lg border border-[#EEF4FB] p-3 hover:bg-[#F8FBFF] transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-700">
                Invoice Belum Dibayar
              </div>

              <div className="mt-1 flex gap-2 text-xs">
                <Link
                  href="/transaksi/emas-fisik?status=unpaid"
                  className="text-primary hover:underline"
                >
                  Emas Fisik
                </Link>

                <span>|</span>

                <Link
                  href="/transaksi/tarik-emas?status=unpaid"
                  className="text-primary hover:underline"
                >
                  Tarik Emas
                </Link>
              </div>
            </div>

            <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-sm font-semibold text-primary">
              {status.pending_invoice}
            </span>
          </div>
        </div>

        {/* Gadai H-3 */}
        <Link
          href={`/laporan/gadai-emas?loan_status_name=Approved&due_end_date=${today3}`}
          className="flex items-center justify-between rounded-lg border border-[#EEF4FB] p-3 transition hover:bg-[#F8FBFF]"
        >
          <div>
            <div className="font-medium text-slate-700">
              Gadai Belum Dibayar H-3
            </div>
            <div className="text-xs text-slate-500">
              Jatuh tempo dalam 3 hari
            </div>
          </div>

          <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-sm font-semibold text-primary">
            {status.pending_loan_payment}
          </span>
        </Link>

        {/* Biaya Bulanan */}
        <Link
          href="/laporan/tagihan-bulanan?is_paid=false"
          className="flex items-center justify-between rounded-lg border border-[#EEF4FB] p-3 transition hover:bg-[#F8FBFF]"
        >
          <div>
            <div className="font-medium text-slate-700">Biaya Bulanan</div>

            <div className="text-xs text-slate-500">
              Belum dilakukan pembayaran
            </div>
          </div>

          <span className="rounded-full bg-[#EEF6FF] px-3 py-1 text-sm font-semibold text-primary">
            {status.pending_monthly_cost}
          </span>
        </Link>

        {/* Hari Ini */}
        <Link
          href={`/laporan/gadai-emas?loan_status_name=Approved&start_date=${today}&end_date=${today}`}
          className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 transition hover:bg-red-100"
        >
          <div>
            <div className="font-medium text-red-700">
              Gadai Wajib Bayar Hari Ini
            </div>

            <div className="text-xs text-red-500">
              Prioritas untuk segera diproses
            </div>
          </div>

          <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
            {status.pending_loan_payment_today}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default StatusDeliveryInvoice;
