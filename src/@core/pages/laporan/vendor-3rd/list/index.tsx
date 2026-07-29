'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatePicker, Pagination, Select, Table, Tag } from 'antd';
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
import { IUser } from '@/@core/@types/interface';

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
      align: 'left',
      render: (v) => v || '-',
    },
    {
      title: 'Nomor',
      dataIndex: 'number',
      width: 160,
      align: 'left',
      render: (v) => v || '-',
    },
    {
      title: 'Tanggal',
      dataIndex: 'create_date',
      width: 180,
      align: 'center',
      render: (v) => (v ? moment(v).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: 'Amount (Rp)',
      dataIndex: 'amount',
      width: 160,
      align: 'right',
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v || 0)}`,
    },
    {
      title: 'Metode Pembayaran',
      dataIndex: 'payment_method',
      width: 180,
      align: 'left',
      render: (v) => v || '-',
    },
    {
      title: 'Biaya Admin (Rp)',
      dataIndex: 'admin_cost',
      width: 160,
      align: 'right',
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v || 0)}`,
    },
    {
      title: 'Fee (Rp)',
      dataIndex: 'fee',
      width: 150,
      align: 'right',
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v || 0)}`,
    },
    {
      title: 'Pendapatan (Rp)',
      dataIndex: 'pendapatan',
      width: 160,
      align: 'right',
      render: (v) => `Rp${new Intl.NumberFormat('id-ID').format(v || 0)}`,
    },
    {
      title: 'Status',
      dataIndex: 'is_failed',
      width: 120,
      align: 'center',
      render: (isFailed: boolean) => (
        <Tag color={isFailed ? 'red' : 'green'}>
          {isFailed ? 'Gagal' : 'Berhasil'}
        </Tag>
      ),
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

      let user: IUser | Record<string, any> = {};
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        user = {};
      }

      const exportParams: any = { ...params, offset: 0, limit: 50 };

      if (exportParams.is_failed === null) delete exportParams.is_failed;
      if (!exportParams.start_date) delete exportParams.start_date;
      if (!exportParams.end_date) delete exportParams.end_date;
      if (!exportParams.transaction_type) delete exportParams.transaction_type;

      const rows = await fetchAllData(url, exportParams);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk di-export');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = (user as IUser)?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Vendor 3rd Party');

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

      // Header Mapping
      const headers = [
        { key: 'no', label: 'No', isNum: true, isCurrency: false },
        {
          key: 'transaction_type',
          label: 'Tipe Transaksi',
          isNum: false,
          isCurrency: false,
        },
        { key: 'number', label: 'Nomor', isNum: false, isCurrency: false },
        {
          key: 'create_date',
          label: 'Tanggal',
          isNum: false,
          isCurrency: false,
        },
        { key: 'amount', label: 'Amount', isNum: true, isCurrency: true },
        {
          key: 'payment_method',
          label: 'Metode Pembayaran',
          isNum: false,
          isCurrency: false,
        },
        {
          key: 'admin_cost',
          label: 'Biaya Admin',
          isNum: true,
          isCurrency: true,
        },
        { key: 'fee', label: 'Fee', isNum: true, isCurrency: true },
        {
          key: 'pendapatan',
          label: 'Pendapatan',
          isNum: true,
          isCurrency: true,
        },
        { key: 'status', label: 'Status', isNum: false, isCurrency: false },
      ];

      const totalColumns = headers.length;

      // =============================
      // TITLE & METADATA (Row 1 - 8)
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN VENDOR 3RD PARTY';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF0057B7' } };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      let periodeText = 'Semua Periode';
      if (params.start_date && params.end_date) {
        periodeText = `${moment(params.start_date).format('DD MMMM YYYY')} - ${moment(
          params.end_date
        ).format('DD MMMM YYYY')}`;
      }

      let statusText = 'Semua';
      if (params.is_failed === false) statusText = 'Berhasil';
      if (params.is_failed === true) statusText = 'Gagal';

      const transactionTypeText = params.transaction_type || 'Semua';

      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${(user as IUser)?.name || '-'}`;

      worksheet.getCell('A4').value = 'Tanggal Export';
      worksheet.getCell('B4').value =
        `: ${moment().format('DD MMMM YYYY HH:mm:ss')}`;

      worksheet.getCell('A5').value = 'Total Data';
      worksheet.getCell('B5').value = `: ${rows.length}`;

      worksheet.getCell('A6').value = 'Periode';
      worksheet.getCell('B6').value = `: ${periodeText}`;

      worksheet.getCell('A7').value = 'Status';
      worksheet.getCell('B7').value = `: ${statusText}`;

      worksheet.getCell('A8').value = 'Tipe Transaksi';
      worksheet.getCell('B8').value = `: ${transactionTypeText}`;

      ['A3', 'A4', 'A5', 'A6', 'A7', 'A8'].forEach((key) => {
        worksheet.getCell(key).font = { bold: true };
      });

      worksheet.addRow([]); // Blank Row (Row 9)

      // =============================
      // HEADER TABEL (Row 10)
      // =============================
      const headerRow = worksheet.addRow(headers.map((h) => h.label));
      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' }, // Biru Utama
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        applyStandardBorder(cell);
      });

      const dataStartRow = headerRow.number + 1;

      // =============================
      // DATA ROWS
      // =============================
      rows.forEach((item: IVendor3rdParty, index: number) => {
        const rowValues = [
          index + 1,
          item.transaction_type || '-',
          item.number || '-',
          item.create_date
            ? moment(item.create_date).format('DD MMM YYYY HH:mm')
            : '-',
          Number(item.amount || 0),
          item.payment_method || '-',
          Number(item.admin_cost || 0),
          Number(item.fee || 0),
          Number(item.pendapatan || 0),
          item.is_failed ? 'Gagal' : 'Berhasil',
        ];

        const newRow = worksheet.addRow(rowValues);

        // Zebra Striping
        if (index % 2 === 1) {
          newRow.eachCell((c) => {
            c.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FBFF' },
            };
          });
        }

        newRow.eachCell((cell, colIdx) => {
          const config = headers[colIdx - 1];

          if (config.isNum) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            cell.numFmt = config.isCurrency ? currencyFormat : integerFormat;
          } else if (config.key === 'no' || config.key === 'status') {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          }

          applyStandardBorder(cell);
        });
      });

      const dataEndRow = dataStartRow + rows.length - 1;

      // =============================
      // TOTAL ROW (Formula SUM)
      // =============================
      const totalRowVals = headers.map((config, colIdx) => {
        if (config.key === 'no') return 'TOTAL';
        if (config.isCurrency) {
          const colLetter = String.fromCharCode(65 + colIdx); // A, B, C...
          return {
            formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`,
          };
        }
        return '';
      });

      const totalRow = worksheet.addRow(totalRowVals);
      totalRow.height = 22;

      totalRow.eachCell((cell, colIdx) => {
        const config = headers[colIdx - 1];

        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF59D' }, // Kuning Highlight
        };

        if (config.key === 'no') {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (config.isCurrency) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = currencyFormat;
        }

        applyStandardBorder(cell);
      });

      // =============================
      // AUTO COLUMN WIDTH
      // =============================
      worksheet.columns.forEach((col: any) => {
        let maxLength = 12;

        col.eachCell({ includeEmpty: true }, (cell: any, rowNum: number) => {
          // Hitung lebar dari baris tabel ke bawah agar metadata di atas tidak merusak lebar kolom
          if (rowNum >= 10) {
            const val = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, val.length);
          }
        });

        col.width = Math.min(maxLength + 4, 35);
      });

      // =============================
      // FREEZE HEADER
      // =============================
      worksheet.views = [{ state: 'frozen', ySplit: 10 }];

      // =============================
      // SAVE FILE
      // =============================
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
