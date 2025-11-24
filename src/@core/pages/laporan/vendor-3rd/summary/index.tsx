'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatePicker, Table } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/id';
dayjs.locale('id');

import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const { RangePicker } = DatePicker;

/* ------------------------
    INTERFACE
------------------------ */
export interface ISummaryRow {
  payment_method: string;
  total_transaksi: number;
  nilai_transaksi: number;
  fee_transaksi: number;
  cost_fee: number;
  pendapatan: number;
}

export interface IVendorSummaryResponse {
  topup_saldo: ISummaryRow[];
  tarik_saldo: ISummaryRow[];
  tarik_emas: ISummaryRow[];
  beli_emas: ISummaryRow[];
  bayar_gadai_emas: ISummaryRow[];
  bayar_biaya_bulanan: ISummaryRow[];
}

const Vendor3rdPartySummary = () => {
  const url = `/reports/transaction-cost/summary`;

  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    start_date: defaultStart,
    end_date: defaultEnd,
  });

  const [summary, setSummary] = useState<IVendorSummaryResponse | null>(null);

  /* -----------------------------
      Fetch Summary Data
  ----------------------------- */
  const fetchSummary = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setSummary(resp.data);
    } catch (err) {
      console.error(err);
    }
  }, [params]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  /* -----------------------------
      Date Range Change
  ----------------------------- */
  const onRangeChange = (_: null | (Dayjs | null)[], dateStrings: string[]) => {
    setParams({
      ...params,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  /* -----------------------------
      TABLE COLUMNS
  ----------------------------- */
  const columns = [
    { title: 'Metode Pembayaran', dataIndex: 'payment_method', width: 180 },
    {
      title: 'Total Transaksi',
      dataIndex: 'total_transaksi',
      width: 150,
      render: (v: number) => new Intl.NumberFormat('id-ID').format(v),
    },
    {
      title: 'Nilai Transaksi (Rp)',
      dataIndex: 'nilai_transaksi',
      width: 180,
      render: (v: number) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Fee Transaksi (Rp)',
      dataIndex: 'fee_transaksi',
      width: 180,
      render: (v: number) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Cost Fee (Rp)',
      dataIndex: 'cost_fee',
      width: 180,
      render: (v: number) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Pendapatan (Rp)',
      dataIndex: 'pendapatan',
      width: 180,
      render: (v: number) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
  ];

  /* -----------------------------
      EXPORT EXCEL
  ----------------------------- */
  const exportExcel = async () => {
    if (!summary) return;

    setIsModalLoading(true);
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Summary Vendor 3rd Party');

      ws.mergeCells('A1:F1');
      ws.getCell('A1').value = 'LAPORAN SUMMARY VENDOR 3RD PARTY';
      ws.getCell('A1').font = { size: 14, bold: true };

      ws.mergeCells('A2:F2');
      ws.getCell('A2').value = `Periode: ${dayjs(params.start_date).format(
        'DD-MM-YYYY'
      )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;

      ws.addRow([]);

      const sections = Object.keys(summary) as (keyof IVendorSummaryResponse)[];

      for (const section of sections) {
        ws.addRow([section.toUpperCase()]);
        ws.getCell(`A${ws.lastRow!.number}`).font = { bold: true };
        ws.addRow([]);

        // FIX HEADER — tetap muncul meski data kosong
        const defaultHeader = [
          'payment_method',
          'total_transaksi',
          'nilai_transaksi',
          'fee_transaksi',
          'cost_fee',
          'pendapatan',
        ];

        const header =
          summary[section].length > 0
            ? Object.keys(summary[section][0])
            : defaultHeader;

        const hrow = ws.addRow(header);

        hrow.eachCell((c) => {
          c.font = { bold: true };
          c.alignment = { horizontal: 'center' };
          c.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

        // DATA ROWS
        summary[section].forEach((row) => {
          const vals = header.map((k) => (row as any)[k]);
          const r = ws.addRow(vals);

          r.eachCell((c, idx) => {
            const key = header[idx - 1];
            const isNum = key !== 'payment_method';

            c.alignment = { horizontal: isNum ? 'right' : 'left' };
            c.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };

            if (isNum) {
              c.value = new Intl.NumberFormat('id-ID').format(Number(c.value));
            }
          });
        });

        // JIKA DATA KOSONG → maintain satu row kosong
        if (summary[section].length === 0) {
          const emptyVals = header.map((h) =>
            h === 'payment_method' ? '-' : 0
          );

          const r = ws.addRow(emptyVals);
          r.eachCell((c, idx) => {
            const key = header[idx - 1];
            const isNum = key !== 'payment_method';

            c.alignment = { horizontal: isNum ? 'right' : 'left' };
            c.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };

            if (isNum) c.value = '0';
          });
        }

        // TOTAL ROW
        const totalValues = header.map((k) => {
          if (k === 'payment_method') return 'TOTAL';
          return summary[section].reduce(
            (acc, cur: any) => acc + Number(cur[k] || 0),
            0
          );
        });

        const totalRow = ws.addRow(totalValues);

        totalRow.eachCell((c, idx) => {
          const key = header[idx - 1];
          const isNum = key !== 'payment_method';

          c.font = { bold: true };
          c.alignment = { horizontal: isNum ? 'right' : 'left' };
          c.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          if (isNum) {
            c.value = new Intl.NumberFormat('id-ID').format(Number(c.value));
          }
        });

        // EMPTY BORDERED ROW
        const empty = ws.addRow([]);
        empty.eachCell((c) => {
          c.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      // Auto column width
      ws.columns.forEach((col: any) => {
        let max = 0;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';
          max = Math.max(max, val.length);
        });
        col.width = Math.min(max + 2, 50);
      });

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `vendor_3rd_party_summary_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } finally {
      setIsModalLoading(false);
    }
  };

  /* -----------------------------
      UI RENDER
  ----------------------------- */
  const renderSection = (title: string, rows: ISummaryRow[]) => (
    <div className="mb-6 border border-gray-200 rounded-md p-4">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <Table
        columns={columns}
        dataSource={rows}
        pagination={false}
        rowKey="payment_method"
        scroll={{ x: 'max-content' }}
        size="small"
      />
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
          />
        </div>

        <button className="btn !h-[40px] btn-primary" onClick={exportExcel}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="mt-4">
        {summary && renderSection('Topup Saldo', summary.topup_saldo)}

        {summary && renderSection('Tarik Saldo', summary.tarik_saldo)}

        {summary && renderSection('Tarik Emas', summary.tarik_emas)}

        {summary && renderSection('Beli Emas', summary.beli_emas)}

        {summary && renderSection('Bayar Gadai Emas', summary.bayar_gadai_emas)}

        {summary &&
          renderSection('Bayar Biaya Bulanan', summary.bayar_biaya_bulanan)}
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default Vendor3rdPartySummary;
