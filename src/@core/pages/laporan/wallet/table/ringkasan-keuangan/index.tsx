/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Table } from 'antd';
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
moment.locale('id');

const { RangePicker } = DatePicker;

export interface IWalletSummaryItem {
  total_transaction: number;
  total_amount: number;
  total_admin: number;
  total_nett: number;
}

export interface IWalletFinancialSummary {
  topup: IWalletSummaryItem;
  disburst: IWalletSummaryItem;
}

const WalletFinancialSummary = () => {
  const url = `/reports/wallet-transaction/financial-summary`;

  // 🗓️ Default tanggal awal = tanggal 1 bulan aktif, akhir = hari ini
  const firstDay = dayjs().startOf('month');
  const today = dayjs();

  const [dataSummary, setDataSummary] =
    useState<IWalletFinancialSummary | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // 🔍 Search text + debounce
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [params, setParams] = useState({
    start_date: firstDay.format('YYYY-MM-DD'),
    end_date: today.format('YYYY-MM-DD'),
    search: '',
  });

  // ⏳ Debounce pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  // 🧭 Update params ketika search berubah
  useEffect(() => {
    setParams((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // 🧭 Ambil data dari API
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataSummary(resp.data);
    } catch (error) {
      console.error('Fetch summary failed:', error);
    }
  }, [params, url]);

  // 📆 Filter tanggal
  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams({
      ...params,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  // 📦 Export Excel
  const exportData = async () => {
    try {
      setIsModalLoading(true);
      const resp = await axiosInstance.get(url, { params });
      const rows: IWalletFinancialSummary = resp.data;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Ringkasan Keuangan Wallet');

      worksheet.mergeCells('A1:E1');
      worksheet.getCell('A1').value = 'LAPORAN RINGKASAN KEUANGAN WALLET';
      worksheet.getCell('A1').alignment = { horizontal: 'left' };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      worksheet.mergeCells('A2:E2');
      worksheet.getCell('A2').value = `Periode: ${dayjs(
        params.start_date
      ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
        'DD-MM-YYYY'
      )}`;
      worksheet.getCell('A2').alignment = { horizontal: 'left' };

      worksheet.addRow([]);

      const header = [
        'Tipe Transaksi',
        'Total Transaksi',
        'Total Amount',
        'Total Admin',
        'Total Nett',
      ];
      const headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
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

      const mapData = [
        { type: 'Topup', ...rows.topup },
        { type: 'Disburst', ...rows.disburst },
      ];

      mapData.forEach((item) => {
        const row = worksheet.addRow([
          item.type,
          item.total_transaction,
          `Rp${formatDecimal(item.total_amount)}`,
          `Rp${formatDecimal(item.total_admin)}`,
          `Rp${formatDecimal(item.total_nett)}`,
        ]);

        row.eachCell({ includeEmpty: true }, (cell) => {
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
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';
          if (val.length > maxLength) maxLength = val.length;
        });
        col.width = Math.min(maxLength + 2, 50);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_ringkasan_wallet_${dayjs().format(
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

  // 🧱 Data tabel tampilan
  const tableData = useMemo(
    () =>
      dataSummary
        ? [
            {
              key: 'topup',
              type: 'Topup',
              total_transaction: dataSummary.topup.total_transaction,
              total_amount: dataSummary.topup.total_amount,
              total_admin: dataSummary.topup.total_admin,
              total_nett: dataSummary.topup.total_nett,
            },
            {
              key: 'disburst',
              type: 'Disburst',
              total_transaction: dataSummary.disburst.total_transaction,
              total_amount: dataSummary.disburst.total_amount,
              total_admin: dataSummary.disburst.total_admin,
              total_nett: dataSummary.disburst.total_nett,
            },
          ]
        : [],
    [dataSummary]
  );

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: 'Tipe Transaksi', dataIndex: 'type', key: 'type', width: 150 },
      {
        title: 'Total Transaksi',
        dataIndex: 'total_transaction',
        key: 'total_transaction',
        width: 180,
      },
      {
        title: 'Total Amount',
        dataIndex: 'total_amount',
        key: 'total_amount',
        width: 180,
        render: (val) => `Rp${formatDecimal(val)}`,
      },
      {
        title: 'Total Admin',
        dataIndex: 'total_admin',
        key: 'total_admin',
        width: 180,
        render: (val) => `Rp${formatDecimal(val)}`,
      },
      {
        title: 'Total Nett',
        dataIndex: 'total_nett',
        key: 'total_nett',
        width: 180,
        render: (val) => `Rp${formatDecimal(val)}`,
      },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            value={[dayjs(params.start_date), dayjs(params.end_date)]}
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
          className="btn !h-[40px] btn-primary"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />
          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={tableData}
          size="small"
          pagination={false}
          rowKey="key"
          className="table-basic"
        />
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default WalletFinancialSummary;
