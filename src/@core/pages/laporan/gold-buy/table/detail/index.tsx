/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Pagination, Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { FileDownload02 } from '@untitled-ui/icons-react';
import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { formatDecimal } from '@/@core/utils/general';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import 'moment/locale/id';
import { IUser } from '@/@core/@types/interface';

moment.locale('id');

const { RangePicker } = DatePicker;

export interface IGoldBuyTransaction {
  gold_transaction_id: string;
  transaction_date: string;
  gold_buy_number: string;
  user_id: string;
  user_member_number: string;
  user_name: string;
  user_email: string;
  user_phone_number: string;
  weight: number;
  gold_history_price_buy: number;
  total_price: number;
  status: string;
  weight_before: string;
  weight_after: string;
  user_seller_unique_code: string;
  commission_percentage: string;
  commission_amount: string;
}

const GoldBuyDigitalDetailTable = () => {
  const url = `/reports/gold-buy-transaction/details`;

  // =============================
  // Default tanggal
  // =============================

  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();

  // =============================
  // State
  // =============================

  const [dataTable, setDataTable] = useState<IGoldBuyTransaction[]>([]);

  const [total, setTotal] = useState(0);

  const [isModalLoading, setIsModalLoading] = useState(false);

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    defaultStart,
    defaultEnd,
  ]);

  const [searchText, setSearchText] = useState('');

  // =============================
  // Params
  // =============================

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    order_by: 'transaction_date',
    order_direction: 'DESC',
    search: '',
    status: '',
  });

  // =============================
  // Fetch data
  // =============================

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, {
        params,
      });

      setDataTable(resp.data.results || []);

      setTotal(resp.data.count || 0);
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }, [params, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =============================
  // Debounce search
  // =============================

  useEffect(() => {
    const delay = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        search: searchText,
        offset: 0,
      }));
    }, 500);

    return () => clearTimeout(delay);
  }, [searchText]);

  // =============================
  // Date range filter
  // =============================

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (!dates || !dates[0] || !dates[1]) {
      return;
    }

    setDateRange([dates[0], dates[1]]);

    setParams((prev) => ({
      ...prev,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
      offset: 0,
    }));
  };

  // =============================
  // Status filter
  // =============================

  const onStatusChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      status: value,
      offset: 0,
    }));
  };

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
  // Sorting handler
  // =============================

  const handleTableChange = (
    _pagination: TablePaginationConfig,
    _filters: any,
    sorter: any
  ) => {
    if (Array.isArray(sorter)) {
      return;
    }

    if (sorter.order) {
      const direction = sorter.order === 'ascend' ? 'ASC' : 'DESC';

      setParams((prev) => ({
        ...prev,
        order_by: sorter.field,
        order_direction: direction,
        offset: 0,
      }));
    } else {
      setParams((prev) => ({
        ...prev,
        order_by: 'transaction_date',
        order_direction: 'DESC',
        offset: 0,
      }));
    }
  };

  // =============================
  // Export Excel
  // =============================

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const resp = await axiosInstance.get(url, {
        params: {
          ...params,
          offset: 0,
          limit: 1000,
        },
      });

      const rows = resp.data.results as IGoldBuyTransaction[];

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');

        return;
      }

      const workbook = new ExcelJS.Workbook();

      workbook.creator = user?.name || 'System';

      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Pembelian Emas');

      const totalColumns = 15;

      // =============================
      // TITLE
      // =============================

      worksheet.mergeCells(1, 1, 1, totalColumns);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN TRANSAKSI PEMBELIAN EMAS';

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
      // Metadata
      // =============================

      worksheet.getCell('A3').value = 'Dibuat Oleh';

      worksheet.getCell('B3').value = `: ${user?.name || '-'}`;

      worksheet.getCell('A4').value = 'Tanggal Export';

      worksheet.getCell('B4').value = `: ${dayjs().format(
        'DD MMMM YYYY HH:mm:ss'
      )}`;

      worksheet.getCell('A5').value = 'Total Data';

      worksheet.getCell('B5').value = `: ${rows.length}`;

      const periodeText =
        params?.start_date && params?.end_date
          ? `${dayjs(params.start_date).format('DD MMMM YYYY')} s/d ${dayjs(
              params.end_date
            ).format('DD MMMM YYYY')}`
          : '-';

      worksheet.getCell('A6').value = 'Periode';

      worksheet.getCell('B6').value = `: ${periodeText}`;

      // =============================
      // Status metadata
      // =============================

      const statusText = params.status || 'Semua Status';

      worksheet.getCell('A7').value = 'Status';

      worksheet.getCell('B7').value = `: ${statusText}`;

      ['A3', 'A4', 'A5', 'A6', 'A7'].forEach((cell) => {
        worksheet.getCell(cell).font = {
          bold: true,
        };
      });

      worksheet.addRow([]);

      // =============================
      // HEADER
      // Row 9
      // =============================

      const header = [
        'Tanggal Transaksi',
        'Nomor Transaksi',
        'Nama User',
        'Nomor Member',
        'Email',
        'No. HP',
        'Berat (gram)',
        'Berat Sebelum',
        'Berat Sesudah',
        'Harga Emas /gr',
        'Total Harga',
        'Status',
        'Kode Seller',
        'Komisi (%)',
        'Jumlah Komisi',
      ];

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
      // Number Formats
      // =============================

      const currencyFormat = '"Rp"#,##0;("Rp"#,##0);"-"';

      const weightFormat = '#,##0.0000" Gram"';

      const percentFormat = '0.0000"%"';

      // =============================
      // DATA ROWS
      // =============================

      rows.forEach((item, index) => {
        const rowValues = [
          item.transaction_date
            ? moment(item.transaction_date).format('DD MMM YYYY HH:mm')
            : '-',

          item.gold_buy_number || '-',

          item.user_name || '-',

          item.user_member_number || '-',

          item.user_email || '-',

          item.user_phone_number || '-',

          Number(item.weight || 0),

          Number(item.weight_before || 0),

          Number(item.weight_after || 0),

          Number(item.gold_history_price_buy || 0),

          Number(item.total_price || 0),

          item.status || '-',

          item.user_seller_unique_code || '-',

          Number(item.commission_percentage || 0) / 100,

          Number(item.commission_amount || 0),
        ];

        const newRow = worksheet.addRow(rowValues);

        // Zebra
        if (index % 2 === 1) {
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
            case 12:
            case 13:
              horizontal = 'center';
              break;

            case 7:
            case 8:
            case 9:
              horizontal = 'right';

              cell.numFmt = weightFormat;
              break;

            case 10:
            case 11:
            case 15:
              horizontal = 'right';

              cell.numFmt = currencyFormat;
              break;

            case 14:
              horizontal = 'right';

              cell.numFmt = percentFormat;
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
      // TOTAL ROW
      // =============================

      const startRow = 10;

      const endRow = 9 + rows.length;

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        '',
        '',
        '',
        '',
        {
          formula: `SUM(G${startRow}:G${endRow})`,
        },
        {
          formula: `SUM(H${startRow}:H${endRow})`,
        },
        {
          formula: `SUM(I${startRow}:I${endRow})`,
        },
        {
          formula: `AVERAGE(J${startRow}:J${endRow})`,
        },
        {
          formula: `SUM(K${startRow}:K${endRow})`,
        },
        '',
        '',
        '',
        {
          formula: `SUM(O${startRow}:O${endRow})`,
        },
      ]);

      const totalRowNumber = totalRow.number;

      worksheet.mergeCells(`A${totalRowNumber}:F${totalRowNumber}`);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) {
          horizontal = 'center';
        } else if ((colNumber >= 7 && colNumber <= 11) || colNumber === 15) {
          horizontal = 'right';
        } else if (colNumber >= 12) {
          horizontal = 'center';
        }

        if (colNumber >= 7 && colNumber <= 9) {
          cell.numFmt = weightFormat;
        }

        if (colNumber === 10 || colNumber === 11 || colNumber === 15) {
          cell.numFmt = currencyFormat;
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
      // Freeze & Filter
      // =============================

      worksheet.views = [
        {
          state: 'frozen',
          ySplit: 9,
        },
      ];

      worksheet.autoFilter = {
        from: {
          row: 9,
          column: 1,
        },
        to: {
          row: 9,
          column: totalColumns,
        },
      };

      // =============================
      // Auto Width
      // =============================

      worksheet.columns.forEach((column: any, colIdx: number) => {
        let maxLength = header[colIdx]?.length || 10;

        column.eachCell(
          {
            includeEmpty: true,
          },
          (cell: any, rowNum: number) => {
            if (rowNum >= 9) {
              const val = cell.value ? cell.value.toString() : '';

              maxLength = Math.max(maxLength, val.length);
            }
          }
        );

        column.width = Math.min(maxLength + 4, 35);
      });

      // =============================
      // SAVE FILE
      // =============================

      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `laporan_transaksi_pembelian_emas_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  // =============================
  // Columns
  // =============================

  const columns: ColumnsType<IGoldBuyTransaction> = useMemo(
    () => [
      {
        title: 'Tanggal Transaksi',
        dataIndex: 'transaction_date',
        key: 'transaction_date',
        align: 'center',
        sorter: true,
        render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
      },
      {
        title: 'Nomor Transaksi',
        dataIndex: 'gold_buy_number',
        key: 'gold_buy_number',
        sorter: true,
        render: (val) => val || '-',
      },
      {
        title: 'Nama User',
        dataIndex: 'user_name',
        key: 'user_name',
        sorter: true,
        render: (val) => val || '-',
      },
      {
        title: 'Nomor Member',
        dataIndex: 'user_member_number',
        key: 'user_member_number',
        sorter: true,
        render: (val) => val || '-',
      },
      {
        title: 'Email',
        dataIndex: 'user_email',
        key: 'user_email',
        render: (val) => val || '-',
      },
      {
        title: 'No. HP',
        dataIndex: 'user_phone_number',
        key: 'user_phone_number',
        render: (val) => val || '-',
      },
      {
        title: 'Berat (gram)',
        dataIndex: 'weight',
        key: 'weight',
        align: 'right',
        sorter: true,
        render: (val) =>
          val !== undefined && val !== null
            ? Number(val).toLocaleString('id-ID', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })
            : '0,0000',
      },
      {
        title: 'Berat Sebelum',
        dataIndex: 'weight_before',
        key: 'weight_before',
        align: 'right',
        width: 140,
        render: (val) =>
          val !== undefined && val !== null
            ? Number(val).toLocaleString('id-ID', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })
            : '-',
      },
      {
        title: 'Berat Sesudah',
        dataIndex: 'weight_after',
        key: 'weight_after',
        align: 'right',
        width: 140,
        render: (val) =>
          val !== undefined && val !== null
            ? Number(val).toLocaleString('id-ID', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })
            : '-',
      },
      {
        title: 'Harga Emas /gr',
        dataIndex: 'gold_history_price_buy',
        key: 'gold_history_price_buy',
        align: 'right',
        sorter: true,
        render: (val) => (val ? `Rp ${formatDecimal(val)}` : 'Rp 0'),
      },
      {
        title: 'Total Harga',
        dataIndex: 'total_price',
        key: 'total_price',
        align: 'right',
        sorter: true,
        render: (val) => (val ? `Rp ${formatDecimal(val)}` : 'Rp 0'),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (status: string) => {
          if (!status) {
            return '-';
          }

          const normalized = status.toLowerCase();

          const color =
            normalized === 'success' || normalized === 'completed'
              ? 'green'
              : normalized === 'pending'
                ? 'gold'
                : normalized === 'failed' || normalized === 'cancelled'
                  ? 'red'
                  : 'blue';

          return <Tag color={color}>{status.toUpperCase()}</Tag>;
        },
      },
      {
        title: 'Kode Seller',
        dataIndex: 'user_seller_unique_code',
        key: 'user_seller_unique_code',
        align: 'center',
        render: (val) => val || '-',
      },
      {
        title: 'Komisi (%)',
        dataIndex: 'commission_percentage',
        key: 'commission_percentage',
        align: 'right',
        render: (val) =>
          val !== undefined && val !== null
            ? `${Number(val).toLocaleString('id-ID', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}%`
            : '0,0000%',
      },
      {
        title: 'Jumlah Komisi',
        dataIndex: 'commission_amount',
        key: 'commission_amount',
        align: 'right',
        render: (val) => (val ? `Rp ${formatDecimal(val)}` : 'Rp 0'),
      },
    ],
    []
  );

  return (
    <>
      {/* =============================
          Filter
          ============================= */}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range */}
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            onChange={onRangeChange}
            value={dateRange}
          />

          {/* Status Filter */}
          <select
            value={params.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Semua Status</option>

            <option value="Cancelled">Cancelled</option>

            <option value="Completed">Completed</option>

            <option value="Pending">Pending</option>
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
          className="btn !h-[40px] btn-primary"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />

          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
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
          onChange={handleTableChange}
          rowKey="gold_transaction_id"
          className="table-basic"
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

export default GoldBuyDigitalDetailTable;
