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
import { IReportWalletTopUP } from '@/@core/@types/interface';
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
      const rows = await fetchAllData(url, params);
      if (rows.length === 0) {
        setIsModalLoading(false);
        return;
      }
      const dataToExport = rows.map((item: IReportWalletTopUP) => ({
        'Tanggal Transaksi': moment(item.create_date).format('DD MMMM YYYY'),
        'Nomor Topup': item.topup_number,
        'Nama User': item.user_name,
        'Nomor Member': item.user_member_number,
        'Bank Pembayaran': item.topup_payment_bank_name,
        'Kode Referensi': item.topup_payment_ref_code,
        'Nominal Topup': `Rp${formatDecimal(
          parseFloat(item.topup_amount.toString())
        )}`,
        'Admin Fee': `Rp${formatDecimal(
          parseFloat(item.topup_admin.toString())
        )}`,
        'Total Topup': `Rp${formatDecimal(
          parseFloat(item.topup_total_amount.toString())
        )}`,
        Status: item.topup_status,
      }));
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Topup Wallet');
      worksheet.mergeCells('A1:J1');
      worksheet.getCell('A1').value = 'LAPORAN TOPUP WALLET';
      worksheet.getCell('A1').font = { size: 14, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'left' };
      worksheet.mergeCells('A2:J2');
      worksheet.getCell('A2').value = `Periode: ${dayjs(
        params.start_date
      ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
        'DD-MM-YYYY'
      )}`;
      worksheet.getCell('A2').alignment = { horizontal: 'left' };
      worksheet.addRow([]);
      const header = Object.keys(dataToExport[0]);
      const headerRow = worksheet.addRow(header);
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
      dataToExport.forEach((row) => {
        const values = header.map((key) => row[key as keyof typeof row] ?? '');
        const newRow = worksheet.addRow(values);
        newRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.alignment = { vertical: 'middle' };
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
          maxLength = Math.max(maxLength, val.length);
        });
        col.width = Math.min(maxLength + 2, 40);
      });
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
            className="w-[300px] h-[40px]"
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
