'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatePicker, Pagination, Table } from 'antd';
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
}

const Vendor3rdParty = () => {
  const url = `/reports/transaction-cost/list`;

  const [dataTable, setDataTable] = useState<Array<IVendor3rdParty>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart,
    end_date: defaultEnd,
    search: '',
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setParams((prev) => ({ ...prev, offset: 0, search: debouncedSearch }));
  }, [debouncedSearch]);

  const columns: ColumnsType<IVendor3rdParty> = [
    {
      title: 'Tipe Transaksi',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      width: 150,
    },
    { title: 'Nomor', dataIndex: 'number', key: 'number', width: 150 },
    {
      title: 'Tanggal',
      dataIndex: 'create_date',
      key: 'create_date',
      width: 180,
      render: (_, record) =>
        moment(record.create_date).format('DD MMMM YYYY HH:mm'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Metode Pembayaran',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 150,
    },
    {
      title: 'Biaya Admin',
      dataIndex: 'admin_cost',
      key: 'admin_cost',
      width: 150,
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      width: 150,
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
    },
    {
      title: 'Pendapatan',
      dataIndex: 'pendapatan',
      key: 'pendapatan',
      width: 150,
    },
  ];

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params]);

  const onChangePage = (val: number) =>
    setParams({ ...params, offset: (val - 1) * params.limit });

  const onRangeChange = (_: null | (Dayjs | null)[], dateStrings: string[]) => {
    setParams({
      ...params,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  const fetchAllData = async (url: string, params: any) => {
    let all = [] as IVendor3rdParty[];
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

  const exportData = async () => {
    try {
      setIsModalLoading(true);
      const rows = await fetchAllData(url, params);

      // ==== MAP DATA & KEEP HEADER EVEN IF EMPTY ====
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

      // ==== TITLE ====
      ws.mergeCells('A1:H1');
      const t = ws.getCell('A1');
      t.value = 'LAPORAN VENDOR 3RD PARTY';
      t.font = { size: 14, bold: true };

      // ==== PERIOD ====
      ws.mergeCells('A2:H2');
      ws.getCell('A2').value = `Periode: ${dayjs(params.start_date).format(
        'DD-MM-YYYY'
      )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;

      ws.addRow([]);

      // ==== HEADER ====
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

      // ==== DATA ROWS ====
      mapped.forEach((r) => {
        const vals = headers.map((k) => r[k as keyof typeof r]);
        const row = ws.addRow(vals);

        row.eachCell((c, idx) => {
          const key = headers[idx - 1];
          const isNum = key?.includes('(Rp)');

          c.alignment = { horizontal: isNum ? 'right' : 'left' };
          c.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          if (isNum && c.value !== '') {
            c.value = new Intl.NumberFormat('id-ID').format(Number(c.value));
          }
        });
      });

      // ==== TOTAL ROW ====
      if (rows.length > 0) {
        const totalAmount = rows.reduce((a, b) => a + Number(b.amount), 0);
        const totalAdmin = rows.reduce((a, b) => a + Number(b.admin_cost), 0);
        const totalFee = rows.reduce((a, b) => a + Number(b.fee), 0);
        const totalPendapatan = rows.reduce(
          (a, b) => a + Number(b.pendapatan || 0),
          0
        );

        const totalRow = [
          'TOTAL', // Col A
          '', // Tanggal
          '', // Nomor
          totalAmount, // Amount
          '', // Metode Pembayaran
          totalAdmin, // Admin Cost
          totalFee, // Fee
          totalPendapatan, // Pendapatan
        ];

        const row = ws.addRow(totalRow);

        row.eachCell((c) => {
          c.font = { bold: true };
          c.alignment = { horizontal: 'right' };
          c.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          if (typeof c.value === 'number') {
            c.value = new Intl.NumberFormat('id-ID').format(c.value);
          }
        });
      }

      // ==== AUTOSIZE ====
      ws.columns.forEach((col: any) => {
        let max = 0;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';
          max = Math.max(max, val.length);
        });
        col.width = Math.min(max + 2, 40);
      });

      // ==== SAVE FILE ====
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
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
          />

          <input
            type="text"
            placeholder="Cari..."
            className="pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md w-[200px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          className="table-basic"
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
