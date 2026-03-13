/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
import { IUser } from '@/@core/@types/interface';
moment.locale('id');

const { RangePicker } = DatePicker;

interface IGoldLoanSummary {
  user_id: string;
  user_name: string;
  loan_total: number;
  loan_amt_total: number;
  loan_fee_total: number;
  loan_due_date_this_month: number;
}

const GadaiEmasRekapTablePage = () => {
  const url = `/reports/gold-loan/summary`;

  const [dataTable, setDataTable] = useState<IGoldLoanSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Default tanggal awal bulan → hari ini
  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    defaultStart,
    defaultEnd,
  ]);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '',
  });

  // Debounce Search
  useEffect(() => {
    const delay = setTimeout(() => {
      setParams((prev) => ({ ...prev, offset: 0, search: searchText }));
    }, 500);
    return () => clearTimeout(delay);
  }, [searchText]);

  // Table Columns
  const columns: ColumnsType<IGoldLoanSummary> = [
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 200,
    },
    {
      title: 'Total Transaksi',
      dataIndex: 'loan_total',
      key: 'loan_total',
      width: 150,
      render: (v) => v.toLocaleString('id-ID'),
    },
    {
      title: 'Total Gadai (Rp)',
      dataIndex: 'loan_amt_total',
      key: 'loan_amt_total',
      width: 180,
      render: (v) => `Rp${v.toLocaleString('id-ID')}`,
    },
    {
      title: 'Total Biaya (Rp)',
      dataIndex: 'loan_fee_total',
      key: 'loan_fee_total',
      width: 180,
      render: (v) => `Rp${v.toLocaleString('id-ID')}`,
    },
    {
      title: 'Jatuh Tempo Bulan Ini (Rp)',
      dataIndex: 'loan_due_date_this_month',
      key: 'loan_due_date_this_month',
      width: 220,
      render: (v) => `Rp${v.toLocaleString('id-ID')}`,
      fixed: 'right',
    },
  ];

  // Fetch Data
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params]);

  // Pagination
  const onChangePage = (val: number) => {
    setParams((prev) => ({ ...prev, offset: (val - 1) * prev.limit }));
  };

  // Range picker change
  const onRangeChange = (dates: any, dateStrings: string[]) => {
    if (!dates) return;
    setDateRange(dates);

    setParams((prev) => ({
      ...prev,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    }));
  };

  // Fetch ALL data for export
  const fetchAllData = async () => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    allRows = [...firstResp.data.results];
    const totalCount = firstResp.data.count;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset },
      });
      allRows = [...allRows, ...resp.data.results];
      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  // Export Excel
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const rows = await fetchAllData();
      if (!rows || rows.length === 0) return;

      const mapped = rows.map((r: IGoldLoanSummary) => ({
        'User ID': r.user_id,
        User: r.user_name || '-',
        'Total Transaksi': Number(r.loan_total || 0),
        'Total Gadai (Rp)': Number(r.loan_amt_total || 0),
        'Total Biaya (Rp)': Number(r.loan_fee_total || 0),
        'Jatuh Tempo Bulan Ini (Rp)': Number(r.loan_due_date_this_month || 0),
      }));

      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Rekap Gadai Emas');

      // ===== TITLE =====
      ws.mergeCells('A1:F1');
      const title = ws.getCell('A1');
      title.value = 'REKAP GADAI EMAS';
      title.font = { size: 14, bold: true };
      title.alignment = { horizontal: 'left' };

      // ===== DIBUAT OLEH =====
      ws.mergeCells('A2:F2');
      ws.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;

      // ===== TANGGAL EXPORT =====
      ws.mergeCells('A3:F3');
      ws.getCell('A3').value = `Tanggal Export : ${dayjs().format(
        'DD-MM-YYYY HH:mm'
      )}`;

      // ===== TOTAL DATA =====
      ws.mergeCells('A4:F4');
      ws.getCell('A4').value = `Total Data : ${rows.length}`;

      // ===== PERIODE =====
      ws.mergeCells('A5:F5');

      const periode =
        params?.start_date && params?.end_date
          ? `${dayjs(params.start_date).format('DD-MM-YYYY')} s/d ${dayjs(
              params.end_date
            ).format('DD-MM-YYYY')}`
          : '-';

      ws.getCell('A5').value = `Periode : ${periode}`;

      ws.addRow([]);

      // ===== HEADER =====
      const headerKeys = Object.keys(mapped[0]);
      const headerRow = ws.addRow(headerKeys);

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
          fgColor: { argb: 'FFEFEFEF' },
        };
      });

      // ===== DATA =====
      mapped.forEach((row) => {
        const values = headerKeys.map((k) => row[k as keyof typeof row]);
        const newRow = ws.addRow(values);

        newRow.eachCell((cell, colNumber) => {
          const header = headerKeys[colNumber - 1];
          const isNumeric =
            header.includes('(Rp)') || header.includes('Transaksi');

          cell.alignment = {
            vertical: 'middle',
            horizontal: isNumeric ? 'right' : 'left',
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          if (isNumeric && typeof cell.value === 'number') {
            cell.value = new Intl.NumberFormat('id-ID').format(cell.value);
          }
        });
      });

      // ===== TOTAL =====
      const totals = {
        'Total Transaksi': mapped.reduce((s, r) => s + r['Total Transaksi'], 0),
        'Total Gadai (Rp)': mapped.reduce(
          (s, r) => s + r['Total Gadai (Rp)'],
          0
        ),
        'Total Biaya (Rp)': mapped.reduce(
          (s, r) => s + r['Total Biaya (Rp)'],
          0
        ),
        'Jatuh Tempo Bulan Ini (Rp)': mapped.reduce(
          (s, r) => s + r['Jatuh Tempo Bulan Ini (Rp)'],
          0
        ),
      };

      const totalRow = ws.addRow([
        'TOTAL',
        '',
        new Intl.NumberFormat('id-ID').format(totals['Total Transaksi']),
        new Intl.NumberFormat('id-ID').format(totals['Total Gadai (Rp)']),
        new Intl.NumberFormat('id-ID').format(totals['Total Biaya (Rp)']),
        new Intl.NumberFormat('id-ID').format(
          totals['Jatuh Tempo Bulan Ini (Rp)']
        ),
      ]);

      totalRow.eachCell((cell, colNumber) => {
        const header = headerKeys[colNumber - 1];

        const isNumeric =
          header?.includes('(Rp)') || header?.includes('Transaksi');

        cell.font = { bold: true };

        cell.alignment = {
          vertical: 'middle',
          horizontal: isNumeric ? 'right' : 'left',
        };

        cell.border = {
          top: { style: 'medium' },
          bottom: { style: 'medium' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9E79F' },
        };
      });

      // ===== AUTO WIDTH =====
      ws.columns.forEach((col: any) => {
        let max = 10;

        col.eachCell?.({ includeEmpty: true }, (cell: any) => {
          const v = cell.value ? cell.value.toString().length : 10;
          if (v > max) max = v;
        });

        col.width = Math.min(max + 2, 40);
      });

      // ===== FREEZE HEADER =====
      ws.views = [{ state: 'frozen', ySplit: 7 }];

      const buffer = await workbook.xlsx.writeBuffer();

      const filename = `rekap_gadai_emas_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), filename);
    } catch (e) {
      console.error(e);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            value={dateRange}
            onChange={onRangeChange}
          />

          <input
            type="text"
            placeholder="Cari data..."
            className="h-[40px] w-[250px] pl-9 pr-3 border rounded-md text-sm focus:ring-2 focus:ring-primary"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <button
          onClick={exportData}
          className="btn btn-primary !h-[40px] flex items-center gap-2"
        >
          <FileDownload02 /> Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          rowKey="user_id"
          className="table-basic"
        />

        <div className="flex justify-end p-[12px]">
          <Pagination
            total={total}
            pageSize={params.limit}
            showSizeChanger={false}
            onChange={onChangePage}
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

export default GadaiEmasRekapTablePage;
