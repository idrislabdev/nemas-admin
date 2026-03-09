'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatePicker, Pagination, Select, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useRouter, useSearchParams } from 'next/navigation';
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

  const router = useRouter();
  const searchParams = useSearchParams();

  const [dataTable, setDataTable] = useState<IVendor3rdParty[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');

  const [statusFailed, setStatusFailed] = useState<boolean | null>(
    searchParams.get('is_failed')
      ? searchParams.get('is_failed') === 'true'
      : null
  );

  const [transactionType, setTransactionType] = useState<string | null>(
    searchParams.get('transaction_type')
  );

  const [params, setParams] = useState<any>({
    offset: Number(searchParams.get('offset')) || 0,
    limit: 10,
    start_date: searchParams.get('start_date'),
    end_date: searchParams.get('end_date'),
    search: searchParams.get('search') || '',
    is_failed: searchParams.get('is_failed')
      ? searchParams.get('is_failed') === 'true'
      : null,
    transaction_type: searchParams.get('transaction_type'),
  });

  // ======================
  // Update URL Query
  // ======================

  const updateQuery = (newParams: any) => {
    const query = new URLSearchParams();

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        query.set(key, String(value));
      }
    });

    router.replace(`?${query.toString()}`);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev: any) => ({
        ...prev,
        offset: 0,
        search,
      }));
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setParams((prev: any) => ({
      ...prev,
      offset: 0,
      is_failed: statusFailed,
    }));
  }, [statusFailed]);

  useEffect(() => {
    setParams((prev: any) => ({
      ...prev,
      offset: 0,
      transaction_type: transactionType,
    }));
  }, [transactionType]);

  useEffect(() => {
    updateQuery(params);
  }, [params]);

  // ======================
  // Table Columns
  // ======================

  const columns: ColumnsType<IVendor3rdParty> = [
    {
      title: 'Tipe Transaksi',
      dataIndex: 'transaction_type',
      width: 180,
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
      width: 180,
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

  // ======================
  // Fetch Data
  // ======================

  const fetchData = useCallback(async () => {
    const filteredParams: any = { ...params };

    if (filteredParams.is_failed === null) delete filteredParams.is_failed;
    if (!filteredParams.transaction_type)
      delete filteredParams.transaction_type;
    if (!filteredParams.start_date) delete filteredParams.start_date;
    if (!filteredParams.end_date) delete filteredParams.end_date;
    if (!filteredParams.search) delete filteredParams.search;

    const resp = await axiosInstance.get(url, { params: filteredParams });

    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onChangePage = (page: number) => {
    setParams({
      ...params,
      offset: (page - 1) * params.limit,
    });
  };

  const onRangeChange = (_: null | (Dayjs | null)[], dateStrings: string[]) => {
    setParams({
      ...params,
      offset: 0,
      start_date: dateStrings[0] || null,
      end_date: dateStrings[1] || null,
    });
  };

  // ======================
  // FETCH ALL DATA (EXPORT)
  // ======================

  const fetchAllData = async (url: string, params: any) => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    allRows = allRows.concat(firstResp.data.results);

    const totalCount = firstResp.data.count;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;

      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset },
      });

      allRows = allRows.concat(resp.data.results);

      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  // ======================
  // EXPORT EXCEL
  // ======================

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const exportParams: any = { ...params, offset: 0, limit: 50 };

      if (exportParams.is_failed === null) delete exportParams.is_failed;
      if (!exportParams.start_date) delete exportParams.start_date;
      if (!exportParams.end_date) delete exportParams.end_date;
      if (!exportParams.transaction_type) delete exportParams.transaction_type;

      const rows = await fetchAllData(url, exportParams);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk di export');
        return;
      }

      const dataToExport = rows.map((item: IVendor3rdParty, index: number) => ({
        No: index + 1,
        'Tipe Transaksi': item.transaction_type || '-',
        Nomor: item.number || '-',
        Tanggal: moment(item.create_date).format('DD MMM YYYY HH:mm'),
        Amount: item.amount || 0,
        'Metode Pembayaran': item.payment_method || '-',
        'Biaya Admin': item.admin_cost || 0,
        Fee: item.fee || 0,
        Pendapatan: item.pendapatan || '-',
        Status: item.is_failed ? 'Gagal' : 'Berhasil',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Vendor 3rd Party');

      // TITLE

      worksheet.mergeCells('A1:J1');
      worksheet.getCell('A1').value = 'LAPORAN VENDOR 3RD PARTY';
      worksheet.getCell('A1').font = { size: 14, bold: true };

      // PERIODE

      let periodeText = 'Semua Periode';

      if (params.start_date && params.end_date) {
        periodeText = `${moment(params.start_date).format(
          'DD MMMM YYYY'
        )} - ${moment(params.end_date).format('DD MMMM YYYY')}`;
      }

      worksheet.mergeCells('A2:J2');
      worksheet.getCell('A2').value = `Periode : ${periodeText}`;

      // STATUS

      let statusText = 'Semua';

      if (params.is_failed === false) statusText = 'Berhasil';
      if (params.is_failed === true) statusText = 'Gagal';

      worksheet.mergeCells('A3:J3');
      worksheet.getCell('A3').value = `Status : ${statusText}`;

      // TRANSACTION TYPE

      const transactionTypeText = params.transaction_type
        ? params.transaction_type
        : 'Semua';

      worksheet.mergeCells('A4:J4');
      worksheet.getCell('A4').value = `Tipe Transaksi : ${transactionTypeText}`;

      worksheet.addRow([]);

      const header = Object.keys(dataToExport[0]);
      const headerRow = worksheet.addRow(header);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };

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

      dataToExport.forEach((row: any) => {
        const rowValues = header.map((key) => row[key]);

        const newRow = worksheet.addRow(rowValues);

        newRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      worksheet.columns.forEach((col: any) => {
        let maxLength = 0;

        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';

          if (val.length > maxLength) {
            maxLength = val.length;
          }
        });

        col.width = maxLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `laporan_vendor_3rd_party_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
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
            className="w-[320px] h-[40px]"
            onChange={onRangeChange}
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

          <Select
            allowClear
            className="w-[220px]"
            placeholder="Tipe Transaksi"
            value={transactionType}
            onChange={setTransactionType}
            options={[
              { value: 'Bayar Biaya Bulanan', label: 'Bayar Biaya Bulanan' },
              { value: 'Bayar Gadai Emas', label: 'Bayar Gadai Emas' },
              { value: 'Beli Produk Emas', label: 'Beli Produk Emas' },
              { value: 'Tarik Emas', label: 'Tarik Emas' },
              { value: 'Tarik Saldo', label: 'Tarik Saldo' },
              { value: 'Topup Saldo', label: 'Topup Saldo' },
            ]}
          />
        </div>

        <button className="btn !h-[40px] btn-primary" onClick={exportData}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-t-[8px] mt-3">
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
