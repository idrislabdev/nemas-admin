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
import { IUser } from '@/@core/@types/interface';

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
      alignment: 'right',
      render: (v: number) => new Intl.NumberFormat('id-ID').format(v),
    },
    {
      title: 'Nilai Transaksi (Rp)',
      dataIndex: 'nilai_transaksi',
      width: 180,
      alignment: 'right',
      render: (v: number) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Fee Transaksi (Rp)',
      dataIndex: 'fee_transaksi',
      width: 180,
      alignment: 'right',

      render: (v: number) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Cost Fee (Rp)',
      dataIndex: 'cost_fee',
      width: 180,
      alignment: 'right',
      render: (v: number) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Pendapatan (Rp)',
      dataIndex: 'pendapatan',
      width: 180,
      alignment: 'right',
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
      let user: IUser | Record<string, any> = {};
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        user = {};
      }

      const wb = new ExcelJS.Workbook();
      wb.creator = (user as IUser)?.name || 'System';
      wb.created = new Date();

      const ws = wb.addWorksheet('Summary Vendor 3rd Party');
      const totalColumns = 6;

      // Helper Border Standar
      const applyStandardBorder = (cell: ExcelJS.Cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      };

      // Native Number Formats
      const currencyFormat = '"Rp"#,##0;("Rp"#,##0);"-"';
      const integerFormat = '#,##0';

      // =============================
      // TITLE & METADATA (Row 1 - 5)
      // =============================
      ws.mergeCells(1, 1, 1, totalColumns);
      const titleCell = ws.getCell('A1');
      titleCell.value = 'LAPORAN SUMMARY VENDOR 3RD PARTY';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF0057B7' } };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      ws.getCell('A3').value = 'Dibuat Oleh';
      ws.getCell('B3').value = `: ${(user as IUser)?.name || '-'}`;

      ws.getCell('A4').value = 'Tanggal Export';
      ws.getCell('B4').value = `: ${dayjs().format('DD MMMM YYYY HH:mm:ss')}`;

      const periodeText =
        params?.start_date && params?.end_date
          ? `${dayjs(params.start_date).format('DD MMMM YYYY')} s/d ${dayjs(
              params.end_date
            ).format('DD MMMM YYYY')}`
          : '-';

      ws.getCell('A5').value = 'Periode';
      ws.getCell('B5').value = `: ${periodeText}`;

      ['A3', 'A4', 'A5'].forEach((key) => {
        ws.getCell(key).font = { bold: true };
      });

      ws.addRow([]); // Blank Row (Row 6)

      // Column Labels / Display Titles
      const headerDisplayNames: Record<string, string> = {
        payment_method: 'Metode Pembayaran',
        total_transaksi: 'Total Transaksi',
        nilai_transaksi: 'Nilai Transaksi',
        fee_transaksi: 'Fee Transaksi',
        cost_fee: 'Cost Fee',
        pendapatan: 'Pendapatan',
      };

      const headerKeys = [
        'payment_method',
        'total_transaksi',
        'nilai_transaksi',
        'fee_transaksi',
        'cost_fee',
        'pendapatan',
      ];

      const sections = Object.keys(summary) as (keyof IVendorSummaryResponse)[];

      for (const section of sections) {
        // ===== JUDUL VENDOR / SEKSI =====
        const sectionRow = ws.addRow([section.toUpperCase()]);
        const secRowNum = sectionRow.number;
        ws.mergeCells(`A${secRowNum}:F${secRowNum}`);

        const secCell = ws.getCell(`A${secRowNum}`);
        secCell.font = { bold: true, size: 11, color: { argb: 'FF0057B7' } };
        secCell.alignment = { horizontal: 'left', vertical: 'middle' };

        // ===== HEADER TABEL =====
        const displayHeaders = headerKeys.map(
          (k) => headerDisplayNames[k] || k
        );
        const hrow = ws.addRow(displayHeaders);
        hrow.height = 24;

        hrow.eachCell((c) => {
          c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          c.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0057B7' },
          };
          c.alignment = { horizontal: 'center', vertical: 'middle' };
          applyStandardBorder(c);
        });

        const dataStartRow = hrow.number + 1;
        const sectionData = summary[section] || [];

        // ===== DATA ROWS =====
        if (sectionData.length > 0) {
          sectionData.forEach((rowItem: any, idx: number) => {
            const rowVals = headerKeys.map((k) =>
              k === 'payment_method'
                ? rowItem[k] || '-'
                : Number(rowItem[k] || 0)
            );

            const r = ws.addRow(rowVals);

            // Zebra Striping
            if (idx % 2 === 1) {
              r.eachCell((c) => {
                c.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFF8FBFF' },
                };
              });
            }

            r.eachCell((c, colIdx) => {
              const key = headerKeys[colIdx - 1];

              if (key === 'payment_method') {
                c.alignment = { horizontal: 'left', vertical: 'middle' };
              } else if (key === 'total_transaksi') {
                c.alignment = { horizontal: 'right', vertical: 'middle' };
                c.numFmt = integerFormat;
              } else {
                c.alignment = { horizontal: 'right', vertical: 'middle' };
                c.numFmt = currencyFormat;
              }

              applyStandardBorder(c);
            });
          });
        } else {
          // JIKA DATA KOSONG
          const emptyVals = ['-', 0, 0, 0, 0, 0];
          const r = ws.addRow(emptyVals);

          r.eachCell((c, colIdx) => {
            const key = headerKeys[colIdx - 1];

            if (key === 'payment_method') {
              c.alignment = { horizontal: 'center', vertical: 'middle' };
            } else if (key === 'total_transaksi') {
              c.alignment = { horizontal: 'right', vertical: 'middle' };
              c.numFmt = integerFormat;
            } else {
              c.alignment = { horizontal: 'right', vertical: 'middle' };
              c.numFmt = currencyFormat;
            }

            applyStandardBorder(c);
          });
        }

        const dataEndRow =
          sectionData.length > 0
            ? dataStartRow + sectionData.length - 1
            : dataStartRow;

        // ===== TOTAL ROW =====
        const totalRowVals = headerKeys.map((k, colIdx) => {
          if (k === 'payment_method') return 'TOTAL';
          const colLetter = String.fromCharCode(65 + colIdx); // A, B, C, D, E, F
          return {
            formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`,
          };
        });

        const totalRow = ws.addRow(totalRowVals);
        totalRow.height = 22;

        totalRow.eachCell((c, colIdx) => {
          const key = headerKeys[colIdx - 1];

          c.font = { bold: true };
          c.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF59D' }, // Kuning Highlight
          };

          if (key === 'payment_method') {
            c.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (key === 'total_transaksi') {
            c.alignment = { horizontal: 'right', vertical: 'middle' };
            c.numFmt = integerFormat;
          } else {
            c.alignment = { horizontal: 'right', vertical: 'middle' };
            c.numFmt = currencyFormat;
          }

          applyStandardBorder(c);
        });

        ws.addRow([]); // Pemisah antar vendor
      }

      // ===== AUTO COLUMN WIDTH =====
      ws.columns.forEach((col: any) => {
        let maxLen = 15;

        col.eachCell({ includeEmpty: true }, (cell: any, rowNum: number) => {
          if (rowNum >= 7) {
            const val = cell.value ? cell.value.toString() : '';
            maxLen = Math.max(maxLen, val.length);
          }
        });

        col.width = Math.min(maxLen + 4, 35);
      });

      // ===== SAVE FILE =====
      const buffer = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `vendor_3rd_party_summary_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
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
            className="w-[320px] h-[40px]"
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
