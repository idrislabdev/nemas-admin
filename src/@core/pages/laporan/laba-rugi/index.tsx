/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { IUser } from '@/@core/@types/interface';

const { RangePicker } = DatePicker;

interface IRevenue {
  selisih_beli_emas: number;
  selisih_jual_emas: number;
  biaya_admin: number;
  biaya_transfer: number;
  biaya_bulanan: number;
}

interface ICost {
  fee_toko: number;
  fee_third_party: number;
}

const formatTwoDecimal = (num: number) => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num || 0);
};

const LaporanLabaRugi = () => {
  const revenueUrl = `/dashboard/revenue`;
  const costUrl = `/dashboard/cost`;

  const [revenue, setRevenue] = useState<IRevenue | null>(null);
  const [cost, setCost] = useState<ICost | null>(null);

  const [isModalLoading, setIsModalLoading] = useState(false);

  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [params, setParams] = useState({
    start_date: defaultStart,
    end_date: defaultEnd,
  });

  const fetchData = useCallback(async () => {
    try {
      const [revResp, costResp] = await Promise.all([
        axiosInstance.get(revenueUrl, { params }),
        axiosInstance.get(costUrl, { params }),
      ]);

      setRevenue(revResp.data);
      setCost(costResp.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [params]);

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams({
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      let user: IUser | Record<string, any> = {};
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        user = {};
      }

      const [revResp, costResp] = await Promise.all([
        axiosInstance.get(revenueUrl, { params }),
        axiosInstance.get(costUrl, { params }),
      ]);

      const revenue: IRevenue = revResp.data || {};
      const cost: ICost = costResp.data || {};

      const workbook = new ExcelJS.Workbook();
      workbook.creator = (user as IUser)?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Laba Rugi');

      // Number Format Native Excel
      const currencyFormat = '"Rp"#,##0.00;("Rp"#,##0.00);"-"';

      // Helper untuk style border & alignment dasar
      const applyStandardBorder = (cell: ExcelJS.Cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      };

      // =============================
      // TITLE & METADATA (Row 1 - 5)
      // =============================
      worksheet.mergeCells('A1:C1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN LABA RUGI';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF0057B7' } };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${(user as IUser)?.name || '-'}`;

      worksheet.getCell('A4').value = 'Tanggal Export';
      worksheet.getCell('B4').value =
        `: ${dayjs().format('DD MMMM YYYY HH:mm:ss')}`;

      const periodeText =
        params?.start_date && params?.end_date
          ? `${dayjs(params.start_date).format('DD MMMM YYYY')} s/d ${dayjs(
              params.end_date
            ).format('DD MMMM YYYY')}`
          : '-';

      worksheet.getCell('A5').value = 'Periode';
      worksheet.getCell('B5').value = `: ${periodeText}`;

      ['A3', 'A4', 'A5'].forEach((cellKey) => {
        worksheet.getCell(cellKey).font = { bold: true };
      });

      worksheet.addRow([]); // Baris kosong (Row 6)

      // =============================
      // SECTION 1: PENDAPATAN
      // =============================
      worksheet.mergeCells('A7:C7');
      const secPendapatan = worksheet.getCell('A7');
      secPendapatan.value = 'PENDAPATAN';
      secPendapatan.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      secPendapatan.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0057B7' },
      };
      secPendapatan.alignment = { horizontal: 'left', vertical: 'middle' };
      ['A7', 'B7', 'C7'].forEach((k) =>
        applyStandardBorder(worksheet.getCell(k))
      );

      // Header Table Pendapatan (Row 8)
      const header1Row = worksheet.addRow(['No', 'Keterangan', 'Jumlah (Rp)']);
      header1Row.height = 22;
      header1Row.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        applyStandardBorder(cell);
      });

      const revenueItems = [
        ['Selisih Beli Emas', Number(revenue.selisih_beli_emas || 0)],
        ['Selisih Jual Emas', Number(revenue.selisih_jual_emas || 0)],
        ['Biaya Admin', Number(revenue.biaya_admin || 0)],
        ['Biaya Transfer', Number(revenue.biaya_transfer || 0)],
        ['Biaya Bulanan', Number(revenue.biaya_bulanan || 0)],
      ];

      const revStartRow = 9;
      revenueItems.forEach(([label, val], idx) => {
        const row = worksheet.addRow([idx + 1, label, val]);

        // Zebra Striping
        if (idx % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FBFF' },
            };
          });
        }

        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
        row.getCell(3).numFmt = currencyFormat;

        row.eachCell((cell) => applyStandardBorder(cell));
      });
      const revEndRow = revStartRow + revenueItems.length - 1;

      // Total Pendapatan Row
      const totRevRow = worksheet.addRow([
        '',
        'TOTAL PENDAPATAN',
        { formula: `SUM(C${revStartRow}:C${revEndRow})` },
      ]);
      totRevRow.height = 22;
      const totRevRowNum = totRevRow.number;

      totRevRow.getCell(2).font = { bold: true };
      totRevRow.getCell(2).alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      const totRevCell = totRevRow.getCell(3);
      totRevCell.font = { bold: true };
      totRevCell.alignment = { horizontal: 'right', vertical: 'middle' };
      totRevCell.numFmt = currencyFormat;

      totRevRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6F0FA' }, // Soft Blue Highlight
        };
        applyStandardBorder(cell);
      });

      worksheet.addRow([]); // Blank Row

      // =============================
      // SECTION 2: BIAYA
      // =============================
      const secBiayaRow = worksheet.addRow(['BIAYA', '', '']);
      const secBiayaRowNum = secBiayaRow.number;
      worksheet.mergeCells(`A${secBiayaRowNum}:C${secBiayaRowNum}`);

      const secBiaya = worksheet.getCell(`A${secBiayaRowNum}`);
      secBiaya.value = 'BIAYA';
      secBiaya.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      secBiaya.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0057B7' },
      };
      secBiaya.alignment = { horizontal: 'left', vertical: 'middle' };
      [
        `A${secBiayaRowNum}`,
        `B${secBiayaRowNum}`,
        `C${secBiayaRowNum}`,
      ].forEach((k) => applyStandardBorder(worksheet.getCell(k)));

      // Header Table Biaya
      const header2Row = worksheet.addRow(['No', 'Keterangan', 'Jumlah (Rp)']);
      header2Row.height = 22;
      header2Row.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        applyStandardBorder(cell);
      });

      const costItems = [
        ['Fee Toko', Number(cost.fee_toko || 0)],
        ['Fee Third Party', Number(cost.fee_third_party || 0)],
      ];

      const costStartRow = header2Row.number + 1;
      costItems.forEach(([label, val], idx) => {
        const row = worksheet.addRow([idx + 1, label, val]);

        if (idx % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FBFF' },
            };
          });
        }

        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
        row.getCell(3).numFmt = currencyFormat;

        row.eachCell((cell) => applyStandardBorder(cell));
      });
      const costEndRow = costStartRow + costItems.length - 1;

      // Total Biaya Row
      const totCostRow = worksheet.addRow([
        '',
        'TOTAL BIAYA',
        { formula: `SUM(C${costStartRow}:C${costEndRow})` },
      ]);
      totCostRow.height = 22;
      const totCostRowNum = totCostRow.number;

      totCostRow.getCell(2).font = { bold: true };
      totCostRow.getCell(2).alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      const totCostCell = totCostRow.getCell(3);
      totCostCell.font = { bold: true };
      totCostCell.alignment = { horizontal: 'right', vertical: 'middle' };
      totCostCell.numFmt = currencyFormat;

      totCostRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6F0FA' },
        };
        applyStandardBorder(cell);
      });

      worksheet.addRow([]); // Blank Row

      // =============================
      // SECTION 3: LABA RUGI NETTO
      // =============================
      const labaRugiRow = worksheet.addRow([
        '',
        'TOTAL LABA RUGI',
        { formula: `C${totRevRowNum}-C${totCostRowNum}` },
      ]);
      labaRugiRow.height = 24;

      labaRugiRow.getCell(2).font = { bold: true, size: 11 };
      labaRugiRow.getCell(2).alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      const labaRugiCell = labaRugiRow.getCell(3);
      labaRugiCell.font = { bold: true, size: 11 };
      labaRugiCell.alignment = { horizontal: 'right', vertical: 'middle' };
      labaRugiCell.numFmt = currencyFormat;

      labaRugiRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF59D' }, // Kuning Highlight
        };
        applyStandardBorder(cell);
      });

      // Set Column Widths
      worksheet.columns = [
        { width: 10 }, // No
        { width: 38 }, // Keterangan
        { width: 28 }, // Jumlah (Rp)
      ];

      // =============================
      // SAVE FILE
      // =============================
      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `laporan_laba_rugi_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPendapatan = revenue
    ? revenue.selisih_beli_emas +
      revenue.selisih_jual_emas +
      revenue.biaya_admin +
      revenue.biaya_transfer +
      revenue.biaya_bulanan
    : 0;

  const totalBiaya = cost ? cost.fee_toko + cost.fee_third_party : 0;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <RangePicker
          size="small"
          className="w-[320px] h-[40px]"
          onChange={onRangeChange}
          defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
        />

        <button className="btn !h-[40px] btn-primary" onClick={exportData}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="mt-4 p-4 border rounded-md bg-white">
        {revenue && cost ? (
          <>
            <h3 className="font-bold mb-2">Tabel Pendapatan</h3>
            <table className="w-full text-sm border mb-4">
              <thead>
                <tr className="font-bold bg-gray-100">
                  <th className="p-2 border w-[10%]">No</th>
                  <th className="p-2 border w-[70%]">Keterangan</th>
                  <th className="p-2 border">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Selisih Beli Emas', revenue.selisih_beli_emas],
                  ['Selisih Jual Emas', revenue.selisih_jual_emas],
                  ['Biaya Admin', revenue.biaya_admin],
                  ['Biaya Transfer', revenue.biaya_transfer],
                  ['Biaya Bulanan', revenue.biaya_bulanan],
                ].map(([label, value], index) => (
                  <tr key={index}>
                    <td className="p-2 border text-center">{index + 1}</td>
                    <td className="p-2 border">{label}</td>
                    <td className="p-2 border text-right">
                      Rp{formatTwoDecimal(Number(value))}
                    </td>
                  </tr>
                ))}

                <tr className="font-bold">
                  <td className="p-2 border"></td>
                  <td className="p-2 border">TOTAL PENDAPATAN</td>
                  <td className="p-2 border text-right">
                    Rp{formatTwoDecimal(totalPendapatan)}
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className="font-bold mb-2">Tabel Biaya</h3>
            <table className="w-full text-sm border mb-4">
              <thead>
                <tr className="font-bold bg-gray-100">
                  <th className="p-2 border w-[10%]">No</th>
                  <th className="p-2 border w-[70%]">Keterangan</th>
                  <th className="p-2 border">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Fee Toko', cost.fee_toko],
                  ['Fee Third Party', cost.fee_third_party],
                ].map(([label, value], index) => (
                  <tr key={index}>
                    <td className="p-2 border text-center">{index + 1}</td>
                    <td className="p-2 border">{label}</td>
                    <td className="p-2 border text-right">
                      Rp{formatTwoDecimal(Number(value))}
                    </td>
                  </tr>
                ))}

                <tr className="font-bold">
                  <td className="p-2 border"></td>
                  <td className="p-2 border">TOTAL BIAYA</td>
                  <td className="p-2 border text-right">
                    Rp{formatTwoDecimal(totalBiaya)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="font-bold text-lg">
              TOTAL LABA RUGI: Rp
              {formatTwoDecimal(totalPendapatan - totalBiaya)}
            </div>
          </>
        ) : (
          <p>Memuat data...</p>
        )}
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default LaporanLabaRugi;
