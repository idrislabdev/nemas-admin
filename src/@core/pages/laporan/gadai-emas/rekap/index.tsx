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

      const rows = await fetchAllData();
      if (!rows || rows.length === 0) return;

      const mapped = rows.map((r: IGoldLoanSummary) => ({
        'User ID': r.user_id,
        User: r.user_name,
        'Total Transaksi': r.loan_total,
        'Total Gadai (Rp)': r.loan_amt_total,
        'Total Biaya (Rp)': r.loan_fee_total,
        'Jatuh Tempo Bulan Ini (Rp)': r.loan_due_date_this_month,
      }));

      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Rekap Gadai Emas');

      // Title
      ws.mergeCells('A1:F1');
      const title = ws.getCell('A1');
      title.value = 'REKAP GADAI EMAS';
      title.font = { size: 14, bold: true };
      title.alignment = { horizontal: 'left' };

      // Period
      ws.mergeCells('A2:F2');
      const period = ws.getCell('A2');
      period.value = `Periode: ${dayjs(params.start_date).format(
        'DD-MM-YYYY'
      )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;

      ws.addRow([]);

      // Header
      const headerKeys = Object.keys(mapped[0]);
      const headerRow = ws.addRow(headerKeys);
      headerRow.font = { bold: true };

      // Data rows
      mapped.forEach((row) => {
        const values = headerKeys.map((k) => row[k as keyof typeof row]);
        const newRow = ws.addRow(values);
        newRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // TOTAL row
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
        totals['Total Transaksi'],
        totals['Total Gadai (Rp)'],
        totals['Total Biaya (Rp)'],
        totals['Jatuh Tempo Bulan Ini (Rp)'],
      ]);

      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9E79F' },
        };
      });

      // Auto column width
      ws.columns.forEach((col: any) => {
        let max = 0;
        col.eachCell?.((cell: any) => {
          const v = cell.value ? cell.value.toString().length : 10;
          if (v > max) max = v;
        });
        col.width = max + 2;
      });

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
            className="w-[300px] h-[40px]"
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
