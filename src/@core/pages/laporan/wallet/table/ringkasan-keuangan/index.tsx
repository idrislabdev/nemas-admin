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
  const getExportedBy = () => {
    if (typeof window === 'undefined') return '-';

    try {
      const rawUser =
        localStorage.getItem('user') ||
        localStorage.getItem('auth_user') ||
        localStorage.getItem('profile');

      if (!rawUser) return '-';

      const parsedUser = JSON.parse(rawUser);

      return (
        parsedUser?.full_name ||
        parsedUser?.name ||
        parsedUser?.username ||
        parsedUser?.email ||
        '-'
      );
    } catch (error) {
      console.error('Gagal membaca user dari localStorage:', error);
      return '-';
    }
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const resp = await axiosInstance.get(url, { params });
      const rows: IWalletFinancialSummary = resp.data;

      const formatRupiah = (num: number) =>
        `Rp${formatDecimal(Number(num) || 0)}`;

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';
      workbook.company = 'NEMAS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Ringkasan Keuangan Wallet');

      const exportedBy = getExportedBy();
      const exportedAt = dayjs().format('DD MMMM YYYY HH:mm:ss');

      const mapData = [
        { type: 'Topup', ...rows.topup },
        { type: 'Disburst', ...rows.disburst },
      ];

      const dataToExport = mapData.map((item, index) => ({
        No: index + 1,
        'Tipe Transaksi': item.type,
        'Total Transaksi': formatDecimal(item.total_transaction || 0),
        'Total Amount': formatRupiah(item.total_amount || 0),
        'Biaya Admin': formatRupiah(item.total_admin || 0),
        'Total Nett (Total Amount - Biaya Admin)': formatRupiah(
          item.total_nett || 0
        ),
      }));

      const totalColumns = Object.keys(dataToExport[0]).length;
      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // =============================
      // Title
      // =============================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN RINGKASAN KEUANGAN WALLET';

      titleCell.font = {
        size: 16,
        bold: true,
        color: {
          argb: 'FF0057B7',
        },
      };

      titleCell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      // =============================
      // Export Info
      // =============================

      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${exportedBy}`;

      worksheet.getCell('A4').value = 'Diexport Pada';
      worksheet.getCell('B4').value = `: ${exportedAt}`;

      worksheet.getCell('A5').value = 'Total Data';
      worksheet.getCell('B5').value = `: ${mapData.length}`;

      let periodeText = 'Semua Periode';

      if (params.start_date && params.end_date) {
        periodeText = `${dayjs(params.start_date).format(
          'DD MMMM YYYY'
        )} s/d ${dayjs(params.end_date).format('DD MMMM YYYY')}`;
      }

      worksheet.getCell('A6').value = 'Periode';
      worksheet.getCell('B6').value = `: ${periodeText}`;

      worksheet.getCell('A3').font = { bold: true };
      worksheet.getCell('A4').font = { bold: true };
      worksheet.getCell('A5').font = { bold: true };
      worksheet.getCell('A6').font = { bold: true };

      worksheet.addRow([]);

      // =============================
      // Header
      // =============================

      const header = Object.keys(dataToExport[0]);

      const headerRow = worksheet.addRow(header);

      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
          color: {
            argb: 'FFFFFFFF',
          },
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'FF0057B7',
          },
        };

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
      });

      // =============================
      // Freeze Header
      // =============================

      worksheet.views = [
        {
          state: 'frozen',
          ySplit: 8,
        },
      ];

      worksheet.autoFilter = {
        from: 'A8',
        to: `${lastColumnLetter}8`,
      };

      // =============================
      // Data
      // =============================

      dataToExport.forEach((row: any) => {
        const values = header.map((key) => row[key]);

        const newRow = worksheet.addRow(values);

        // Zebra Row
        if (newRow.number % 2 === 1) {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: {
                argb: 'FFF8FBFF',
              },
            };
          });
        }

        newRow.eachCell((cell, colNumber) => {
          let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

          switch (colNumber) {
            case 1: // No
              horizontal = 'center';
              break;

            case 4: // Total Transaksi
            case 5: // Total Amount
            case 6: // Biaya Admin
            case 7: // Total Nett
              horizontal = 'right';
              break;

            default:
              horizontal = 'left';
          }

          cell.alignment = {
            horizontal,
            vertical: 'middle',
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // =============================
      // Total
      // =============================

      const totalTransaction = mapData.reduce(
        (acc, item) => acc + (item.total_transaction || 0),
        0
      );

      const totalAmount = mapData.reduce(
        (acc, item) => acc + (item.total_amount || 0),
        0
      );

      const totalAdmin = mapData.reduce(
        (acc, item) => acc + (item.total_admin || 0),
        0
      );

      const totalNett = mapData.reduce(
        (acc, item) => acc + (item.total_nett || 0),
        0
      );

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        formatDecimal(totalTransaction),
        formatRupiah(totalAmount),
        formatRupiah(totalAdmin),
        formatRupiah(totalNett),
      ]);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        switch (colNumber) {
          case 1:
            horizontal = 'center';
            break;

          case 4:
          case 5:
          case 6:
            horizontal = 'right';
            break;

          default:
            horizontal = 'left';
        }

        cell.font = {
          bold: true,
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'FFFFF59D',
          },
        };

        cell.alignment = {
          horizontal,
          vertical: 'middle',
        };

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // =============================
      // Auto Width
      // =============================

      worksheet.columns.forEach((column: any) => {
        let maxLength = 10;

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const value = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, value.length);
        });

        column.width = Math.min(maxLength + 3, 40);
      });

      // =============================
      // Export
      // =============================

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `laporan_ringkasan_wallet_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
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
      {
        title: 'Tipe Transaksi',
        dataIndex: 'type',
        key: 'type',
        width: 150,
      },
      {
        title: 'Total Transaksi',
        dataIndex: 'total_transaction',
        key: 'total_transaction',
        width: 180,
        align: 'right',
      },
      {
        title: 'Total Amount',
        dataIndex: 'total_amount',
        key: 'total_amount',
        width: 180,
        align: 'right',
        render: (val) => `Rp${formatDecimal(val)}`,
      },
      {
        title: 'Biaya Admin',
        dataIndex: 'total_admin',
        key: 'total_admin',
        width: 180,
        align: 'right',
        render: (val) => `Rp${formatDecimal(val)}`,
      },
      {
        title: 'Total Nett',
        dataIndex: 'total_nett',
        key: 'total_nett',
        width: 180,
        align: 'right',
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
            className="w-[320px] h-[40px]"
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

      <div className="flex flex-col  rounded-tr-[8px] rounded-tl-[8px]">
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
