'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { IGoldInvestmentSummary, IUser } from '@/@core/@types/interface';
import { debounce } from 'lodash';

const { RangePicker } = DatePicker;

const GoldInvestmentUserTable: React.FC = () => {
  const url = `/reports/gold-investment/summary-user`;

  // 🔹 Default tanggal awal bulan hingga hari ini
  const defaultStart = useMemo(() => dayjs().startOf('month'), []);
  const defaultEnd = useMemo(() => dayjs(), []);

  const [dataTable, setDataTable] = useState<Array<IGoldInvestmentSummary>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '',
  });

  const [searchText, setSearchText] = useState('');

  // 🔹 Columns
  const columns: ColumnsType<IGoldInvestmentSummary> = [
    {
      title: 'Nomor Anggota',
      dataIndex: 'investor_member_number',
      key: 'investor_member_number',
      width: 160,
    },
    {
      title: 'Nama Investor',
      dataIndex: 'investor_name',
      key: 'investor_name',
      width: 180,
    },
    {
      title: 'Jumlah Transaksi',
      dataIndex: 'jumlah_transaksi',
      key: 'jumlah_transaksi',
      width: 150,
      render: (val) => formatDecimal(val),
    },
    {
      title: 'Total Berat Investasi (Gram)',
      dataIndex: 'total_invested_weight',
      key: 'total_invested_weight',
      width: 200,
      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Total Nominal Investasi (Rp)',
      dataIndex: 'total_invested_amount',
      key: 'total_invested_amount',
      width: 220,
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Total Berat Return (Gram)',
      dataIndex: 'total_return_weight',
      key: 'total_return_weight',
      width: 200,
      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Total Berat Aktif (Gram)',
      dataIndex: 'total_active_weight',
      key: 'total_active_weight',
      width: 200,
      render: (val) => `${formatDecimal(val)} Gram`,
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results || []);
      setTotal(resp.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch table data:', err);
    }
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams((prev) => ({ ...prev, offset: (val - 1) * prev.limit }));
  };

  const onRangeChange = (
    _dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      start_date: dateStrings[0] || '',
      end_date: dateStrings[1] || '',
    }));
  };

  // 🔹 Debounced search handler dengan useMemo
  const debouncedSetSearch = useMemo(
    () =>
      debounce((val: string) => {
        setParams((prev) => ({ ...prev, offset: 0, search: val }));
      }, 500),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchText);
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [searchText, debouncedSetSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchAllData = async (fetchUrl: string, currentParams: any) => {
    let allRows: IGoldInvestmentSummary[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(fetchUrl, {
      params: { ...currentParams, limit, offset: 0 },
    });

    allRows = allRows.concat(firstResp.data.results || []);
    const totalCount = firstResp.data.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;
      const resp = await axiosInstance.get(fetchUrl, {
        params: { ...currentParams, limit, offset },
      });
      allRows = allRows.concat(resp.data.results || []);
      await new Promise((r) => setTimeout(r, 100));
    }

    return allRows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');
      const rows = await fetchAllData(url, params);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Investasi Emas');

      // ======================
      // METADATA HEADER
      // ======================
      worksheet.mergeCells('A1:G1');
      worksheet.getCell('A1').value = 'LAPORAN INVESTASI EMAS - PER INVESTOR';
      worksheet.getCell('A1').font = { size: 14, bold: true };

      worksheet.mergeCells('A2:G2');
      worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;

      worksheet.mergeCells('A3:G3');
      worksheet.getCell('A3').value = `Tanggal Export : ${dayjs().format(
        'DD-MM-YYYY HH:mm'
      )}`;

      worksheet.mergeCells('A4:G4');
      worksheet.getCell('A4').value = `Total Data : ${rows.length}`;

      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A5:G5');
        worksheet.getCell('A5').value = `Periode: ${dayjs(
          params.start_date
        ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
          'DD-MM-YYYY'
        )}`;
      }

      worksheet.addRow([]); // Baris kosong pembatas

      // ======================
      // TABLE HEADER
      // ======================
      const headers = [
        'Nomor Anggota',
        'Nama Investor',
        'Jumlah Transaksi',
        'Total Berat Investasi (Gram)',
        'Total Nominal Investasi (Rp)',
        'Total Berat Return (Gram)',
        'Total Berat Aktif (Gram)',
      ];

      const headerRowIndex = worksheet.addRow(headers).number;
      const headerRow = worksheet.getRow(headerRowIndex);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E5E5' },
        };
      });

      // ======================
      // DATA ROWS
      // ======================
      rows.forEach((item) => {
        const row = worksheet.addRow([
          item.investor_member_number || '-',
          item.investor_name || '-',
          item.jumlah_transaksi ?? 0,
          item.total_invested_weight ?? 0,
          item.total_invested_amount ?? 0,
          item.total_return_weight ?? 0,
          item.total_active_weight ?? 0,
        ]);

        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          // Tipe Kolom Angka (Index 3 ke atas)
          if (colNumber >= 3) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };

            // Terapkan Excel Number Format agar angka asli tetap bisa dihitung di Excel
            if (colNumber === 5) {
              cell.numFmt = '"Rp"#,##0'; // Format Rupiah
            } else if (colNumber === 3) {
              cell.numFmt = '#,##0'; // Format Integer
            } else {
              cell.numFmt = '#,##0.00" Gram"'; // Format Berat/Desimal
            }
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          }
        });
      });

      // ======================
      // TOTAL ROW
      // ======================
      const totalJumlahTransaksi = rows.reduce(
        (sum, item) => sum + (item.jumlah_transaksi ?? 0),
        0
      );
      const totalBeratInvestasi = rows.reduce(
        (sum, item) => sum + (item.total_invested_weight ?? 0),
        0
      );
      const totalNominalInvestasi = rows.reduce(
        (sum, item) => sum + (item.total_invested_amount ?? 0),
        0
      );
      const totalBeratReturn = rows.reduce(
        (sum, item) => sum + (item.total_return_weight ?? 0),
        0
      );
      const totalBeratAktif = rows.reduce(
        (sum, item) => sum + (item.total_active_weight ?? 0),
        0
      );

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        totalJumlahTransaksi,
        totalBeratInvestasi,
        totalNominalInvestasi,
        totalBeratReturn,
        totalBeratAktif,
      ]);

      // Merge sel 'TOTAL' untuk Kolom A & B
      const totalRowIndex = totalRow.number;
      worksheet.mergeCells(`A${totalRowIndex}:B${totalRowIndex}`);

      totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };

        if (colNumber >= 3) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          if (colNumber === 5) {
            cell.numFmt = '"Rp"#,##0';
          } else if (colNumber === 3) {
            cell.numFmt = '#,##0';
          } else {
            cell.numFmt = '#,##0.00" Gram"';
          }
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });

      // ======================
      // AUTO COLUMN WIDTH
      // ======================
      worksheet.columns.forEach((col, colIdx) => {
        if (!col) return;
        let maxLength = headers[colIdx] ? headers[colIdx].length : 12;

        // Hanya hitung dari baris header ke bawah agar tidak terpengaruh judul utama
        for (let r = headerRowIndex; r <= totalRowIndex; r++) {
          const cellValue = worksheet.getRow(r).getCell(colIdx + 1).value;
          if (cellValue) {
            const strLen = cellValue.toString().length;
            if (strLen > maxLength) maxLength = strLen;
          }
        }

        col.width = Math.min(Math.max(maxLength + 4, 12), 40);
      });

      // ======================
      // SAVE FILE
      // ======================
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_investasi_emas_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[defaultStart, defaultEnd]}
          />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 h-[40px] w-[250px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <button className="btn !h-[40px] btn-primary" onClick={exportData}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="investor_id"
        />
        <div className="flex justify-end p-[12px]">
          <Pagination
            onChange={onChangePage}
            pageSize={params.limit}
            total={total}
            showSizeChanger={false}
          />
        </div>
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default GoldInvestmentUserTable;
