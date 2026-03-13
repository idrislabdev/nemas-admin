/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useState } from 'react';
import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileDownload02 } from '@untitled-ui/icons-react';
import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { formatDecimal } from '@/@core/utils/general';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import 'moment/locale/id';
import { IReportWalletTopUP, IUser } from '@/@core/@types/interface';
moment.locale('id');

const { RangePicker } = DatePicker;

const WalletTopupTable = () => {
  const url = `/reports/wallet-topup`;
  const [dataTable, setDataTable] = useState<IReportWalletTopUP[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // ✅ Default tanggal
  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();

  // 🧩 State parameter dan search
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '',
  });
  const [searchText, setSearchText] = useState('');

  // 🔁 Debounce search input 500ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      setParams((prev) => ({ ...prev, offset: 0, search: searchText }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const [selectedRange, setSelectedRange] = useState<[Dayjs, Dayjs]>([
    defaultStart,
    defaultEnd,
  ]);

  // 🧱 Kolom tabel
  const columns: ColumnsType<IReportWalletTopUP> = [
    {
      title: 'Tanggal',
      dataIndex: 'create_date',
      key: 'create_date',
      width: 180,
      render: (_, record) => moment(record.create_date).format('DD MMMM YYYY'),
    },
    {
      title: 'Nomor Topup',
      dataIndex: 'topup_number',
      key: 'topup_number',
      width: 200,
    },
    {
      title: 'Nama User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 200,
    },
    {
      title: 'Nomor Member',
      dataIndex: 'user_member_number',
      key: 'user_member_number',
      width: 180,
    },
    {
      title: 'Bank Pembayaran',
      dataIndex: 'topup_payment_bank_name',
      key: 'topup_payment_bank_name',
      width: 180,
    },
    {
      title: 'Kode Referensi',
      dataIndex: 'topup_payment_ref_code',
      key: 'topup_payment_ref_code',
      width: 180,
    },
    {
      title: 'Nominal Topup',
      dataIndex: 'topup_amount',
      key: 'topup_amount',
      width: 180,
      render: (_, record) =>
        record.topup_amount
          ? `Rp${formatDecimal(parseFloat(record.topup_amount.toString()))}`
          : '-',
    },
    {
      title: 'Admin Fee',
      dataIndex: 'topup_admin',
      key: 'topup_admin',
      width: 150,
      render: (_, record) =>
        record.topup_admin
          ? `Rp${formatDecimal(parseFloat(record.topup_admin.toString()))}`
          : '-',
    },
    {
      title: 'Total Topup',
      dataIndex: 'topup_total_amount',
      key: 'topup_total_amount',
      width: 180,
      render: (_, record) =>
        record.topup_total_amount
          ? `Rp${formatDecimal(
              parseFloat(record.topup_total_amount.toString())
            )}`
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'topup_status',
      key: 'topup_status',
      width: 150,
    },
  ];

  // 🧭 Fetch data dari API
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams((prev) => ({ ...prev, offset: (val - 1) * prev.limit }));
  };

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (dates && dates[0] && dates[1]) {
      setSelectedRange([dates[0], dates[1]]);
      setParams((prev) => ({
        ...prev,
        offset: 0,
        start_date: dateStrings[0],
        end_date: dateStrings[1],
      }));
    }
  };

  // 📦 Ekspor ke Excel (tidak diubah)
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

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const rows = await fetchAllData(url, params);
      if (!rows || rows.length === 0) return;

      const dataToExport = rows.map((item: IReportWalletTopUP) => ({
        'Tanggal Transaksi': moment(item.create_date).format('DD MMMM YYYY'),
        'Nomor Topup': item.topup_number,
        'Nama User': item.user_name,
        'Nomor Member': item.user_member_number,
        'Bank Pembayaran': item.topup_payment_bank_name,
        'Kode Referensi': item.topup_payment_ref_code,
        'Nominal Topup': Number(item.topup_amount) || 0,
        'Admin Fee': Number(item.topup_admin) || 0,
        'Total Topup': Number(item.topup_total_amount) || 0,
        Status: item.topup_status,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Topup Wallet');

      const totalColumns = Object.keys(dataToExport[0]).length;
      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      /* ================= TITLE ================= */

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);
      const title = worksheet.getCell('A1');
      title.value = 'LAPORAN TOPUP WALLET';
      title.font = { size: 14, bold: true };

      /* ================= DIBUAT OLEH ================= */

      worksheet.mergeCells(`A2:${lastColumnLetter}2`);
      worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;

      /* ================= TANGGAL EXPORT ================= */

      worksheet.mergeCells(`A3:${lastColumnLetter}3`);
      worksheet.getCell('A3').value = `Tanggal Export : ${dayjs().format(
        'DD MMMM YYYY HH:mm'
      )}`;

      /* ================= TOTAL DATA ================= */

      worksheet.mergeCells(`A4:${lastColumnLetter}4`);
      worksheet.getCell('A4').value = `Total Data : ${rows.length}`;

      /* ================= PERIODE ================= */

      let periodeText = 'Semua Periode';

      if (params.start_date && params.end_date) {
        periodeText = `${dayjs(params.start_date).format(
          'DD MMMM YYYY'
        )} - ${dayjs(params.end_date).format('DD MMMM YYYY')}`;
      }

      worksheet.mergeCells(`A5:${lastColumnLetter}5`);
      worksheet.getCell('A5').value = `Periode : ${periodeText}`;

      worksheet.addRow([]);

      /* ================= HEADER ================= */

      const headerKeys = Object.keys(dataToExport[0]);

      const headerRow = worksheet.addRow(headerKeys);

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

      /* ================= DATA ================= */

      dataToExport.forEach((row) => {
        const newRow = worksheet.addRow(
          headerKeys.map((key) => row[key as keyof typeof row])
        );

        newRow.eachCell((cell, colNumber) => {
          const headerName = headerKeys[colNumber - 1];

          const isNumeric = [
            'Nominal Topup',
            'Admin Fee',
            'Total Topup',
          ].includes(headerName);

          cell.alignment = {
            horizontal: isNumeric ? 'right' : 'left',
            vertical: 'middle',
          };

          if (isNumeric && typeof cell.value === 'number') {
            cell.value = `Rp${formatDecimal(cell.value)}`;
          }

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      /* ================= TOTAL ================= */

      const totalNominal = rows.reduce(
        (acc, cur) => acc + (Number(cur.topup_amount) || 0),
        0
      );

      const totalAdmin = rows.reduce(
        (acc, cur) => acc + (Number(cur.topup_admin) || 0),
        0
      );

      const totalTopup = rows.reduce(
        (acc, cur) => acc + (Number(cur.topup_total_amount) || 0),
        0
      );

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        '',
        '',
        '',
        '',
        `Rp${formatDecimal(totalNominal)}`,
        `Rp${formatDecimal(totalAdmin)}`,
        `Rp${formatDecimal(totalTopup)}`,
        '',
      ]);

      totalRow.eachCell((cell, colNumber) => {
        const headerName = headerKeys[colNumber - 1];

        const isNumeric = [
          'Nominal Topup',
          'Admin Fee',
          'Total Topup',
        ].includes(headerName);

        cell.font = { bold: true };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF59D' },
        };

        cell.alignment = {
          horizontal: isNumeric ? 'right' : 'left',
          vertical: 'middle',
        };

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      /* ================= AUTO WIDTH ================= */

      worksheet.columns.forEach((col) => {
        let maxLength = 0;

        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, val.length);
        });

        col.width = Math.min(maxLength + 2, 40);
      });

      /* ================= FREEZE HEADER ================= */

      worksheet.views = [{ state: 'frozen', ySplit: 7 }];

      /* ================= SAVE FILE ================= */

      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `laporan_topup_wallet_${dayjs().format(
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

  return (
    <>
      {/* 🔍 Search + Range + Export */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            value={selectedRange}
            onChange={onRangeChange}
          />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          className="btn !h-[40px] btn-primary flex items-center gap-2"
          onClick={exportData}
        >
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
          rowKey="topup_transaction_id"
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

export default WalletTopupTable;
