'use client';

import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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

      const [revResp, costResp] = await Promise.all([
        axiosInstance.get(revenueUrl, { params }),
        axiosInstance.get(costUrl, { params }),
      ]);

      const revenue: IRevenue = revResp.data;
      const cost: ICost = costResp.data;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Laba Rugi');

      const applyBorder = (row: ExcelJS.Row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      };

      worksheet.mergeCells('A1:C1');
      worksheet.getCell('A1').value = 'LAPORAN LABA RUGI';
      worksheet.getCell('A1').font = { size: 14, bold: true };

      worksheet.mergeCells('A2:C2');
      worksheet.getCell('A2').value =
        `Periode: ${dayjs(params.start_date).format('DD-MM-YYYY')} s/d ${dayjs(
          params.end_date
        ).format('DD-MM-YYYY')}`;

      worksheet.addRow([]);

      // ===== SECTION PENDAPATAN =====
      const pendapatanTitle = worksheet.addRow(['PENDAPATAN']);
      applyBorder(pendapatanTitle);

      const header1 = worksheet.addRow(['No', 'Keterangan', 'Jumlah (Rp)']);
      header1.font = { bold: true };
      applyBorder(header1);

      const revenueRows = [
        ['Selisih Beli Emas', revenue.selisih_beli_emas],
        ['Selisih Jual Emas', revenue.selisih_jual_emas],
        ['Biaya Admin', revenue.biaya_admin],
        ['Biaya Transfer', revenue.biaya_transfer],
        ['Biaya Bulanan', revenue.biaya_bulanan],
      ];

      revenueRows.forEach(([label, value], index) => {
        const row = worksheet.addRow([
          index + 1,
          label,
          formatTwoDecimal(Number(value)),
        ]);
        applyBorder(row);
      });

      const totalPendapatan =
        revenue.selisih_beli_emas +
        revenue.selisih_jual_emas +
        revenue.biaya_admin +
        revenue.biaya_transfer +
        revenue.biaya_bulanan;

      const totalPendapatanRow = worksheet.addRow([
        '',
        'TOTAL PENDAPATAN',
        formatTwoDecimal(totalPendapatan),
      ]);
      totalPendapatanRow.font = { bold: true };
      applyBorder(totalPendapatanRow);

      worksheet.addRow([]);

      // ===== SECTION BIAYA =====
      const biayaTitle = worksheet.addRow(['BIAYA']);
      applyBorder(biayaTitle);

      const header2 = worksheet.addRow(['No', 'Keterangan', 'Jumlah (Rp)']);
      header2.font = { bold: true };
      applyBorder(header2);

      const costRows = [
        ['Fee Toko', cost.fee_toko],
        ['Fee Third Party', cost.fee_third_party],
      ];

      costRows.forEach(([label, value], index) => {
        const row = worksheet.addRow([
          index + 1,
          label,
          formatTwoDecimal(Number(value)),
        ]);
        applyBorder(row);
      });

      const totalBiaya = cost.fee_toko + cost.fee_third_party;

      const totalBiayaRow = worksheet.addRow([
        '',
        'TOTAL BIAYA',
        formatTwoDecimal(totalBiaya),
      ]);
      totalBiayaRow.font = { bold: true };
      applyBorder(totalBiayaRow);

      worksheet.addRow([]);

      // ===== LABA RUGI =====
      const labaRugiRow = worksheet.addRow([
        '',
        'TOTAL LABA RUGI',
        formatTwoDecimal(totalPendapatan - totalBiaya),
      ]);
      labaRugiRow.font = { bold: true };
      applyBorder(labaRugiRow);

      worksheet.columns = [{ width: 10 }, { width: 35 }, { width: 25 }];

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
          className="w-[300px] h-[40px]"
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
