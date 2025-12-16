'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useState } from 'react';
import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';

moment.locale('id');

const { RangePicker } = DatePicker;

interface ISellerCommissionSummary {
  member_number: string;
  nama_toko: string;
  user_name: string;
  unique_code: string;
  total_price: number;
  weight: number;
  commission_amount: number;
  count_trx: number;
  last_transaction_datetime: string;
}

const RekapitulasiFeeTokoPage = () => {
  const url = '/reports/seller-commission/summary';

  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<ISellerCommissionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart,
    end_date: defaultEnd,
    search: '',
  });

  // 🔎 Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setParams((prev) => ({ ...prev, offset: 0, search: debouncedSearch }));
  }, [debouncedSearch]);

  const columns: ColumnsType<ISellerCommissionSummary> = [
    { title: 'Member No', dataIndex: 'member_number', width: 120 },
    { title: 'Nama Toko', dataIndex: 'nama_toko', width: 180 },
    { title: 'User', dataIndex: 'user_name', width: 150 },
    { title: 'Kode Unik', dataIndex: 'unique_code', width: 120 },
    {
      title: 'Total Transaksi',
      dataIndex: 'total_price',
      width: 160,
      render: (v) => `Rp${formatDecimal(Number(v || 0))}`,
    },
    {
      title: 'Total Berat (Gram)',
      dataIndex: 'weight',
      width: 160,
      render: (v) => `${formatDecimal(Number(v || 0))} Gram`,
    },
    {
      title: 'Fee Toko',
      dataIndex: 'commission_amount',
      width: 160,
      render: (v) => `Rp${formatDecimal(Number(v || 0))}`,
    },
    {
      title: 'Jumlah Transaksi',
      dataIndex: 'count_trx',
      width: 150,
      align: 'center',
    },
    {
      title: 'Transaksi Terakhir',
      dataIndex: 'last_transaction_datetime',
      width: 180,
      render: (v) => moment(v).format('DD MMMM YYYY HH:mm'),
    },
  ];

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onChangePage = (page: number) => {
    setParams({ ...params, offset: (page - 1) * params.limit });
  };

  const onRangeChange = (_: null | (Dayjs | null)[], dateStrings: string[]) => {
    setParams({
      ...params,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  const fetchAllData = async () => {
    let rows: any[] = [];
    const limit = 100;

    const first = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    rows = rows.concat(first.data.results);
    const totalPages = Math.ceil(first.data.count / limit);

    for (let i = 1; i < totalPages; i++) {
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset: i * limit },
      });
      rows = rows.concat(resp.data.results);
    }

    return rows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData();
      if (!rows.length) return;

      const data = rows.map((r: ISellerCommissionSummary) => ({
        'Member No': r.member_number,
        'Nama Toko': r.nama_toko,
        User: r.user_name,
        'Kode Unik': r.unique_code,
        'Total Transaksi (Rp)': Number(r.total_price || 0),
        'Total Berat (Gram)': Number(r.weight || 0),
        'Fee Toko (Rp)': Number(r.commission_amount || 0),
        'Jumlah Transaksi': r.count_trx,
        'Transaksi Terakhir': moment(r.last_transaction_datetime).format(
          'DD MMMM YYYY HH:mm'
        ),
      }));

      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Rekap Fee Toko');

      // ===== HELPER BORDER =====
      const applyBorder = (
        cell: ExcelJS.Cell,
        type: 'thin' | 'medium' = 'thin'
      ) => {
        cell.border = {
          top: { style: type },
          left: { style: type },
          bottom: { style: type },
          right: { style: type },
        };
      };

      // ===== TITLE =====
      ws.mergeCells('A1:I1');
      ws.getCell('A1').value = 'LAPORAN REKAPITULASI FEE TOKO';
      ws.getCell('A1').font = { bold: true, size: 14 };

      // ===== PERIODE =====
      ws.mergeCells('A2:I2');
      ws.getCell('A2').value = `Periode: ${dayjs(params.start_date).format(
        'DD-MM-YYYY'
      )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;

      ws.addRow([]);

      // ===== HEADER =====
      const headers = Object.keys(data[0]);
      const headerRow = ws.addRow(headers);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        applyBorder(cell);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEFEFEF' },
        };
      });

      // ===== DATA ROWS =====
      data.forEach((row) => {
        const r = ws.addRow(headers.map((h) => row[h as keyof typeof row]));

        r.eachCell((cell, col) => {
          const header = headers[col - 1];
          const isNumeric =
            header.includes('(Rp)') || header.includes('(Gram)');

          cell.alignment = {
            vertical: 'middle',
            horizontal: isNumeric ? 'right' : 'left',
          };

          applyBorder(cell);
        });
      });

      // ===== TOTAL =====
      const totalFee = data.reduce((s, r) => s + Number(r['Fee Toko (Rp)']), 0);

      const totalRow = ws.addRow([
        'TOTAL',
        '',
        '',
        '',
        '',
        '',
        new Intl.NumberFormat('id-ID').format(totalFee),
        '',
        '',
      ]);

      totalRow.eachCell((cell, col) => {
        cell.font = { bold: true };
        applyBorder(cell, 'medium');

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9E79F' }, // kuning lembut
        };

        if (col === 7) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      });

      // ===== AUTO WIDTH =====
      ws.columns.forEach((c) => {
        if (!c) return;
        let max = 10;
        c.eachCell?.({ includeEmpty: true }, (cell) => {
          const len = cell.value ? cell.value.toString().length : 0;
          max = Math.max(max, len);
        });
        c.width = Math.min(max + 2, 40);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `rekap_fee_toko_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
            onChange={onRangeChange}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari..."
            className="pl-8 pr-2 py-1.5 text-sm border rounded-md w-[200px]"
          />
        </div>

        <button className="btn btn-primary !h-[40px]" onClick={exportData}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="mt-3 border rounded">
        <Table
          columns={columns}
          dataSource={dataTable}
          rowKey="unique_code"
          pagination={false}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
        />
        <div className="flex justify-end p-3">
          <Pagination
            total={total}
            pageSize={params.limit}
            onChange={onChangePage}
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

export default RekapitulasiFeeTokoPage;
