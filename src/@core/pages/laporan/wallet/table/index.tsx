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

  // =============================
  // Default tanggal
  // =============================

  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();

  // =============================
  // State parameter
  // =============================

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '',
    topup_status: '',
  });

  const [searchText, setSearchText] = useState('');

  const [selectedRange, setSelectedRange] = useState<[Dayjs, Dayjs]>([
    defaultStart,
    defaultEnd,
  ]);

  // =============================
  // Debounce search input
  // =============================

  useEffect(() => {
    const timeout = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        offset: 0,
        search: searchText,
      }));
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchText]);

  // =============================
  // Kolom tabel
  // =============================

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
      align: 'right',
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
      align: 'right',
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
      align: 'right',
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
      align: 'center',
    },
  ];

  // =============================
  // Fetch data dari API
  // =============================

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, {
      params,
    });

    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  // =============================
  // Pagination
  // =============================

  const onChangePage = (val: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (val - 1) * prev.limit,
    }));
  };

  // =============================
  // Filter tanggal
  // =============================

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

  // =============================
  // Filter status
  // =============================

  const onStatusChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      topup_status: value,
    }));
  };

  // =============================
  // Fetch semua data untuk export
  // =============================

  const fetchAllData = async (url: string, params: any) => {
    let allRows: any[] = [];

    const limit = 100;

    const firstResp = await axiosInstance.get(url, {
      params: {
        ...params,
        limit,
        offset: 0,
      },
    });

    allRows = allRows.concat(firstResp.data.results);

    const totalCount = firstResp.data.count;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;

      const resp = await axiosInstance.get(url, {
        params: {
          ...params,
          limit,
          offset,
        },
      });

      allRows = allRows.concat(resp.data.results);

      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  // =============================
  // Get exported by
  // =============================

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

  // =============================
  // Export Excel
  // =============================

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData(url, params);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const dataToExport = rows.map(
        (item: IReportWalletTopUP, index: number) => ({
          No: index + 1,
          'Tanggal Transaksi': moment(item.create_date).format('DD MMMM YYYY'),
          'Nomor Topup': item.topup_number,
          'Nama User': item.user_name,
          'Nomor Member': item.user_member_number,
          'Bank Pembayaran': item.topup_payment_bank_name,
          'Kode Referensi': item.topup_payment_ref_code,
          'Nominal Topup': `Rp${formatDecimal(Number(item.topup_amount) || 0)}`,
          'Admin Fee': `Rp${formatDecimal(Number(item.topup_admin) || 0)}`,
          'Total Topup': `Rp${formatDecimal(
            Number(item.topup_total_amount) || 0
          )}`,
          Status: item.topup_status,
        })
      );

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';
      workbook.company = 'NEMAS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Topup Wallet');

      const exportedBy = getExportedBy();
      const exportedAt = dayjs().format('DD MMMM YYYY HH:mm:ss');

      const totalColumns = Object.keys(dataToExport[0]).length;

      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // =============================
      // Title
      // =============================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN TOPUP WALLET';

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

        worksheet.getCell('A6').value = 'Periode';
        worksheet.getCell('B6').value = `: ${periodeText}`;
      }

      // =============================
      // Export Status
      // =============================

      const statusText = params.topup_status
        ? params.topup_status
        : 'Semua Status';

      worksheet.getCell('A7').value = 'Status';
      worksheet.getCell('B7').value = `: ${statusText}`;

      worksheet.getCell('A3').font = {
        bold: true,
      };

      worksheet.getCell('A4').font = {
        bold: true,
      };

      worksheet.getCell('A5').font = {
        bold: true,
      };

      worksheet.getCell('A6').font = {
        bold: true,
      };

      worksheet.getCell('A7').font = {
        bold: true,
      };

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
          top: {
            style: 'thin',
          },
          left: {
            style: 'thin',
          },
          bottom: {
            style: 'thin',
          },
          right: {
            style: 'thin',
          },
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
        from: 'A9',
        to: `${lastColumnLetter}9`,
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
            case 1:
              horizontal = 'center';
              break;

            case 2:
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

          cell.alignment = {
            horizontal,
            vertical: 'middle',
          };

          cell.border = {
            top: {
              style: 'thin',
            },
            left: {
              style: 'thin',
            },
            bottom: {
              style: 'thin',
            },
            right: {
              style: 'thin',
            },
          };
        });
      });

      // =============================
      // Total
      // =============================

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
        '',
        `Rp${formatDecimal(totalNominal)}`,
        `Rp${formatDecimal(totalAdmin)}`,
        `Rp${formatDecimal(totalTopup)}`,
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
          top: {
            style: 'thin',
          },
          left: {
            style: 'thin',
          },
          bottom: {
            style: 'thin',
          },
          right: {
            style: 'thin',
          },
        };
      });

      // =============================
      // Auto Width
      // =============================

      worksheet.columns.forEach((column: any) => {
        let maxLength = 10;

        column.eachCell(
          {
            includeEmpty: true,
          },
          (cell: any) => {
            const value = cell.value ? cell.value.toString() : '';

            maxLength = Math.max(maxLength, value.length);
          }
        );

        column.width = Math.min(maxLength + 3, 40);
      });

      // =============================
      // Export
      // =============================

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `laporan_topup_wallet_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  // =============================
  // Fetch ketika parameter berubah
  // =============================

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {/* =============================
          Search + Range + Status + Export
          ============================= */}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range */}
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            value={selectedRange}
            onChange={onRangeChange}
          />

          {/* Status Filter */}
          <select
            value={params.topup_status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Semua Status</option>

            <option value="FAIL">FAIL</option>

            <option value="PAID">PAID</option>

            <option value="PENDING">PENDING</option>

            <option value="SUCCESS">SUCCESS</option>
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Export */}
        <button
          className="btn !h-[40px] btn-primary flex items-center gap-2"
          onClick={exportData}
        >
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      {/* =============================
          Table
          ============================= */}

      <div className="flex flex-col rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{
            x: 'max-content',
            y: 550,
          }}
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

      {/* =============================
          Loading
          ============================= */}

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default WalletTopupTable;
