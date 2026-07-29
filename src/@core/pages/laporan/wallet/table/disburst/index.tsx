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
moment.locale('id');

const { RangePicker } = DatePicker;

export interface IReportWalletDisburst {
  disburst_transaction_id: string;
  disburst_timestamp: string;
  user_id: string;
  user_name: string;
  user_member_number: string;
  disburst_number: string;
  disburst_payment_bank_number: string;
  disburst_payment_bank_code: string;
  disburst_payment_bank_account_holder_name: string;
  disburst_total_amount: number;
  disburst_admin: number;
  disburst_amount: number;
  disburst_status: string;
  disburst_payment_ref: string;
}

const WalletDisburstTable = () => {
  const url = `/reports/wallet-disburst`;

  const [dataTable, setDataTable] = useState<IReportWalletDisburst[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const startOfMonth = dayjs().startOf('month');
  const today = dayjs();

  // 🔍 Search
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth.format('YYYY-MM-DD'),
    end_date: today.format('YYYY-MM-DD'),
    search: '',
  });

  // Debounce pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => {
    setParams((prev) => ({ ...prev, offset: 0, search: debouncedSearch }));
  }, [debouncedSearch]);

  const columns: ColumnsType<IReportWalletDisburst> = [
    {
      title: 'Tanggal',
      dataIndex: 'disburst_timestamp',
      key: 'disburst_timestamp',
      width: 180,
      render: (_, record) =>
        moment(record.disburst_timestamp).format('DD MMMM YYYY HH:mm'),
    },
    {
      title: 'Nomor Disburst',
      dataIndex: 'disburst_number',
      key: 'disburst_number',
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
      title: 'Kode Bank',
      dataIndex: 'disburst_payment_bank_code',
      key: 'disburst_payment_bank_code',
      width: 100,
      align: 'center',
    },
    {
      title: 'Nomor Rekening',
      dataIndex: 'disburst_payment_bank_number',
      key: 'disburst_payment_bank_number',
      width: 180,
    },
    {
      title: 'Nama Pemilik Rekening',
      dataIndex: 'disburst_payment_bank_account_holder_name',
      key: 'disburst_payment_bank_account_holder_name',
      width: 220,
    },
    {
      title: 'Nominal Disburst',
      dataIndex: 'disburst_amount',
      key: 'disburst_amount',
      width: 180,
      align: 'right',
      render: (_, record) =>
        record.disburst_amount
          ? `Rp${formatDecimal(parseFloat(record.disburst_amount.toString()))}`
          : '-',
    },
    {
      title: 'Admin Fee',
      dataIndex: 'disburst_admin',
      key: 'disburst_admin',
      width: 150,
      align: 'right',
      render: (_, record) =>
        record.disburst_admin
          ? `Rp${formatDecimal(parseFloat(record.disburst_admin.toString()))}`
          : '-',
    },
    {
      title: 'Total Disburst',
      dataIndex: 'disburst_total_amount',
      key: 'disburst_total_amount',
      width: 180,
      align: 'right',
      render: (_, record) =>
        record.disburst_total_amount
          ? `Rp${formatDecimal(
              parseFloat(record.disburst_total_amount.toString())
            )}`
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'disburst_status',
      key: 'disburst_status',
      width: 150,
      align: 'center',
    },
    {
      title: 'Kode Referensi',
      dataIndex: 'disburst_payment_ref',
      key: 'disburst_payment_ref',
      width: 200,
    },
  ];

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams({
      ...params,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

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
      await new Promise((r) => setTimeout(r, 150));
    }

    return allRows;
  };

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

      const exportParams = {
        ...params,
        offset: 0,
        limit: 10,
      };

      const rows = await fetchAllData(url, exportParams);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const dataToExport = rows.map(
        (item: IReportWalletDisburst, index: number) => ({
          No: index + 1,
          'Tanggal Transaksi': moment(item.disburst_timestamp).format(
            'DD MMMM YYYY HH:mm'
          ),
          'Nomor Disburst': item.disburst_number,
          'Nama User': item.user_name,
          'Nomor Member': item.user_member_number,
          'Kode Bank': item.disburst_payment_bank_code,
          'Nomor Rekening': item.disburst_payment_bank_number,
          'Nama Pemilik Rekening':
            item.disburst_payment_bank_account_holder_name,
          'Nominal Disburst': `Rp${formatDecimal(
            Number(item.disburst_amount) || 0
          )}`,
          'Admin Fee': `Rp${formatDecimal(Number(item.disburst_admin) || 0)}`,
          'Total Disburst': `Rp${formatDecimal(
            Number(item.disburst_total_amount) || 0
          )}`,
          Status: item.disburst_status,
          'Kode Referensi': item.disburst_payment_ref,
        })
      );

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';
      workbook.company = 'NEMAS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Disburst Wallet');

      const exportedBy = getExportedBy();
      const exportedAt = dayjs().format('DD MMMM YYYY HH:mm:ss');

      const totalColumns = Object.keys(dataToExport[0]).length;
      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // =============================
      // Title
      // =============================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN DISBURST WALLET';

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
      worksheet.getCell('B5').value = `: ${rows.length}`;

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
            case 6: // Kode Bank
            case 11: // Status
              horizontal = 'center';
              break;

            case 8: // Nominal
            case 9: // Admin
            case 10: // Total
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

      const totalNominal = rows.reduce(
        (acc, cur) => acc + Number(cur.disburst_amount || 0),
        0
      );

      const totalAdmin = rows.reduce(
        (acc, cur) => acc + Number(cur.disburst_admin || 0),
        0
      );

      const totalDisburst = rows.reduce(
        (acc, cur) => acc + Number(cur.disburst_total_amount || 0),
        0
      );

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        '',
        '',
        '',
        '',
        '',
        `Rp${formatDecimal(totalNominal)}`,
        `Rp${formatDecimal(totalAdmin)}`,
        `Rp${formatDecimal(totalDisburst)}`,
        '',
        '',
        '',
      ]);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        switch (colNumber) {
          case 1:
            horizontal = 'center';
            break;

          case 8:
          case 9:
          case 10:
            horizontal = 'right';
            break;

          case 11:
            horizontal = 'center';
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
        `laporan_disburst_wallet_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
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
          className="btn btn-primary"
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
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="disburst_transaction_id"
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

export default WalletDisburstTable;
