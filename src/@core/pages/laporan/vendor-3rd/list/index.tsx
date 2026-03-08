'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatePicker, Pagination, Select, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';

moment.locale('id');

const { RangePicker } = DatePicker;

export interface IVendor3rdParty {
  transaction_type: string;
  id: string;
  create_date: string;
  number: string;
  amount: number;
  payment_method: string;
  admin_cost: number;
  fee: number;
  pendapatan: string;
  is_failed: boolean;
}

const Vendor3rdParty = () => {
  const url = `/reports/transaction-cost/list`;

  const [dataTable, setDataTable] = useState<Array<IVendor3rdParty>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [statusFailed, setStatusFailed] = useState<boolean | null>(null);

  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [params, setParams] = useState<any>({
    offset: 0,
    limit: 10,
    start_date: defaultStart,
    end_date: defaultEnd,
    search: '',
    is_failed: null,
  });

  // =====================
  // Debounce Search
  // =====================

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setParams((prev: any) => ({
      ...prev,
      offset: 0,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

  // =====================
  // Sync Status Filter
  // =====================

  useEffect(() => {
    setParams((prev: any) => ({
      ...prev,
      offset: 0,
      is_failed: statusFailed,
    }));
  }, [statusFailed]);

  // =====================
  // Table Columns
  // =====================

  const columns: ColumnsType<IVendor3rdParty> = [
    {
      title: 'Tipe Transaksi',
      dataIndex: 'transaction_type',
      width: 150,
    },
    {
      title: 'Nomor',
      dataIndex: 'number',
      width: 150,
    },
    {
      title: 'Tanggal',
      dataIndex: 'create_date',
      width: 180,
      render: (_, r) => moment(r.create_date).format('DD MMMM YYYY HH:mm'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 150,
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Metode Pembayaran',
      dataIndex: 'payment_method',
      width: 150,
    },
    {
      title: 'Biaya Admin',
      dataIndex: 'admin_cost',
      width: 150,
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      width: 150,
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Pendapatan',
      dataIndex: 'pendapatan',
      width: 150,
    },
  ];

  // =====================
  // Fetch Data
  // =====================

  const fetchData = useCallback(async () => {
    const filteredParams: any = { ...params };

    if (filteredParams.is_failed === null) delete filteredParams.is_failed;

    const resp = await axiosInstance.get(url, { params: filteredParams });

    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params]);

  // =====================
  // Pagination
  // =====================

  const onChangePage = (val: number) =>
    setParams({ ...params, offset: (val - 1) * params.limit });

  // =====================
  // Date Range
  // =====================

  const onRangeChange = (_: null | (Dayjs | null)[], dateStrings: string[]) => {
    setParams({
      ...params,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  // =====================
  // Fetch All Export Data
  // =====================

  const fetchAllData = async (url: string, params: any) => {
    let all: IVendor3rdParty[] = [];
    const limit = 100;

    const first = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    all = all.concat(first.data.results);

    const totalCount = first.data.count;
    const pages = Math.ceil(totalCount / limit);

    for (let i = 1; i < pages; i++) {
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset: i * limit },
      });

      all = all.concat(resp.data.results);

      await new Promise((r) => setTimeout(r, 150));
    }

    return all;
  };

  // =====================
  // Export Excel
  // =====================

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const exportParams: any = { ...params };

      if (exportParams.is_failed === null) delete exportParams.is_failed;

      const rows = await fetchAllData(url, exportParams);

      const mapped =
        rows.length > 0
          ? rows.map((i) => ({
              'Tipe Transaksi': i.transaction_type,
              Tanggal: moment(i.create_date).format('DD MMMM YYYY HH:mm'),
              Nomor: i.number,
              'Amount (Rp)': i.amount,
              'Metode Pembayaran': i.payment_method,
              'Biaya Admin (Rp)': i.admin_cost,
              'Fee (Rp)': i.fee,
              Pendapatan: i.pendapatan,
            }))
          : [
              {
                'Tipe Transaksi': '',
                Tanggal: '',
                Nomor: '',
                'Amount (Rp)': '',
                'Metode Pembayaran': '',
                'Biaya Admin (Rp)': '',
                'Fee (Rp)': '',
                Pendapatan: '',
              },
            ];

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Vendor 3rd Party');

      ws.mergeCells('A1:H1');
      ws.getCell('A1').value = 'LAPORAN VENDOR 3RD PARTY';
      ws.getCell('A1').font = { size: 14, bold: true };

      ws.mergeCells('A2:H2');
      ws.getCell('A2').value = `Periode: ${dayjs(params.start_date).format(
        'DD-MM-YYYY'
      )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;

      ws.addRow([]);

      const headers = Object.keys(mapped[0]);
      const hrow = ws.addRow(headers);

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

      mapped.forEach((r) => {
        const vals = headers.map((k) => r[k as keyof typeof r]);
        const row = ws.addRow(vals);

        row.eachCell((c) => {
          c.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      ws.columns.forEach((col: any) => {
        let max = 0;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';
          max = Math.max(max, val.length);
        });
        col.width = Math.min(max + 2, 40);
      });

      const buffer = await wb.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `vendor_3rd_party_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

          <input
            type="text"
            placeholder="Cari..."
            className="pl-2 pr-2 py-1.5 text-sm border border-gray-300 rounded-md w-[200px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            allowClear
            size="large"
            className="w-[180px]"
            placeholder="Status Transaksi"
            value={statusFailed}
            onChange={setStatusFailed}
            options={[
              { value: null, label: 'Semua' },
              { value: false, label: 'Berhasil' },
              { value: true, label: 'Gagal' },
            ]}
          />
        </div>

        <button className="btn !h-[40px] btn-primary" onClick={exportData}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] mt-3">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          rowKey="id"
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

export default Vendor3rdParty;
