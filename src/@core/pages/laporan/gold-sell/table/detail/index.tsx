/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Pagination, Table } from 'antd';
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

// ==============================
// Interface sesuai response baru
// ==============================
export interface IGoldSellTransaction {
  gold_transaction_id: string;
  transaction_date: string;
  gold_sell_number: string;
  user_id: string;
  user_member_number: string;
  user_name: string;
  user_email: string;
  user_phone_number: string;
  weight: number;
  gold_history_price_sell: number;
  total_price: number;
  weight_before: string;
  weight_after: string;
  status: string;
  user_seller_unique_code: string;
}

const GoldSellTransactionDetailsTable = () => {
  const url = `/reports/gold-sell-transaction/details`;

  // 📅 Default tanggal awal dan akhir
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<IGoldSellTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    order_by: 'transaction_date',
    order_direction: 'DESC',
    search: '',
  });

  // 🔁 Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Update params saat debounce selesai
  useEffect(() => {
    setParams((prev) => ({ ...prev, search: debouncedSearch, offset: 0 }));
  }, [debouncedSearch]);

  // 🔁 Fetch data
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results || []);
      setTotal(resp.data.count || 0);
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }, [params, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 📆 Range date filter
  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams({
      ...params,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
      offset: 0,
    });
  };

  // 📑 Pagination
  const onChangePage = (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  // 📊 Sorting handler
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _: any,
    sorter: any
  ) => {
    if (Array.isArray(sorter)) return;
    if (sorter.order) {
      const direction = sorter.order === 'ascend' ? 'ASC' : 'DESC';
      setParams({
        ...params,
        order_by: sorter.field,
        order_direction: direction,
        offset: 0,
      });
    } else {
      setParams({
        ...params,
        order_by: 'transaction_date',
        order_direction: 'DESC',
        offset: 0,
      });
    }
  };

  // 📦 Export Excel
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const resp = await axiosInstance.get(url, {
        params: { ...params, offset: 0, limit: 1000 },
      });

      const rows = resp.data.results as IGoldSellTransaction[];

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = user?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Penjualan Emas');

      const totalColumns = 13;

      // =============================
      // Title
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN TRANSAKSI PENJUALAN EMAS';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF0057B7' } };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      // =============================
      // Metadata Info
      // =============================
      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${user?.name || '-'}`;

      worksheet.getCell('A4').value = 'Tanggal Export';
      worksheet.getCell('B4').value =
        `: ${dayjs().format('DD MMMM YYYY HH:mm:ss')}`;

      worksheet.getCell('A5').value = 'Total Data';
      worksheet.getCell('B5').value = `: ${rows.length}`;

      const periodeText =
        params?.start_date && params?.end_date
          ? `${dayjs(params.start_date).format('DD MMMM YYYY')} s/d ${dayjs(
              params.end_date
            ).format('DD MMMM YYYY')}`
          : 'Semua Periode';

      worksheet.getCell('A6').value = 'Periode';
      worksheet.getCell('B6').value = `: ${periodeText}`;

      ['A3', 'A4', 'A5', 'A6'].forEach((cell) => {
        worksheet.getCell(cell).font = { bold: true };
      });

      worksheet.addRow([]); // Baris kosong (Row 7)

      // =============================
      // Header (Row 8)
      // =============================
      const header = [
        'Tanggal Transaksi',
        'Nomor Transaksi',
        'Nama User',
        'Nomor Member',
        'Email',
        'No. HP',
        'Berat (gram)',
        'Berat Sebelum (gram)',
        'Berat Sesudah (gram)',
        'Harga Emas /gr',
        'Total Harga',
        'Status',
        'Kode Seller',
      ];

      const headerRow = worksheet.addRow(header);
      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Format Numbering Excel
      const currencyFormat = '"Rp"#,,##0;("Rp"#,,##0);"-"';
      const weightFormat = '#,,##0.00" Gram"';

      // =============================
      // Data Rows
      // =============================
      rows.forEach((item, index) => {
        const rowValues = [
          item.transaction_date
            ? moment(item.transaction_date).format('DD MMMM YYYY HH:mm')
            : '-',
          item.gold_sell_number || '-',
          item.user_name || '-',
          item.user_member_number || '-',
          item.user_email || '-',
          item.user_phone_number || '-',
          Number(item.weight || 0),
          Number(item.weight_before || 0),
          Number(item.weight_after || 0),
          Number(item.gold_history_price_sell || 0),
          Number(item.total_price || 0),
          item.status || '-',
          item.user_seller_unique_code || '-',
        ];

        const newRow = worksheet.addRow(rowValues);

        // Zebra Striping
        if (index % 2 === 1) {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FBFF' },
            };
          });
        }

        newRow.eachCell((cell, colNumber) => {
          let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

          switch (colNumber) {
            case 7: // Berat
            case 8: // Berat Sebelum
            case 9: // Berat Sesudah
              horizontal = 'right';
              cell.numFmt = weightFormat;
              break;

            case 10: // Harga /gr
            case 11: // Total Harga
              horizontal = 'right';
              cell.numFmt = currencyFormat;
              break;

            case 12: // Status
            case 13: // Kode Seller
              horizontal = 'center';
              break;

            default:
              horizontal = 'left';
          }

          cell.alignment = { horizontal, vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // =============================
      // Total Row
      // =============================
      const startRow = 9;
      const endRow = 8 + rows.length;

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        '',
        '',
        '',
        '',
        { formula: `SUM(G${startRow}:G${endRow})` },
        { formula: `SUM(H${startRow}:H${endRow})` },
        { formula: `SUM(I${startRow}:I${endRow})` },
        '',
        { formula: `SUM(K${startRow}:K${endRow})` },
        '',
        '',
      ]);

      const totalRowNumber = totalRow.number;
      worksheet.mergeCells(`A${totalRowNumber}:F${totalRowNumber}`);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) horizontal = 'center';
        else if (colNumber >= 7 && colNumber <= 11) horizontal = 'right';
        else if (colNumber >= 12) horizontal = 'center';

        // NumFmt untuk total
        if (colNumber >= 7 && colNumber <= 9) cell.numFmt = weightFormat;
        if (colNumber === 11) cell.numFmt = currencyFormat;

        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF59D' },
        };
        cell.alignment = { horizontal, vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // =============================
      // Freeze, Filter & Auto Width
      // =============================
      worksheet.views = [{ state: 'frozen', ySplit: 8 }];
      worksheet.autoFilter = {
        from: { row: 8, column: 1 },
        to: { row: 8, column: totalColumns },
      };

      worksheet.columns.forEach((column: any, colIdx: number) => {
        let maxLength = header[colIdx]?.length || 10;

        // Hanya kalkulasi lebar dari baris 8 (Header) ke bawah
        column.eachCell({ includeEmpty: true }, (cell: any, rowNum: number) => {
          if (rowNum >= 8) {
            const val = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, val.length);
          }
        });

        column.width = Math.min(maxLength + 4, 40);
      });

      // =============================
      // Save File
      // =============================
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_penjualan_emas_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const columns: ColumnsType<IGoldSellTransaction> = useMemo(
    () => [
      {
        title: 'Tanggal Transaksi',
        dataIndex: 'transaction_date',
        key: 'transaction_date',
        sorter: true,
        render: (val) => (val ? moment(val).format('DD MMMM YYYY HH:mm') : '-'),
      },
      {
        title: 'Nomor Transaksi',
        dataIndex: 'gold_sell_number',
        key: 'gold_sell_number',
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

      // =============================
      // Kolom Gram (Rata Kanan)
      // =============================
      {
        title: 'Berat (gram)',
        dataIndex: 'weight',
        key: 'weight',
        sorter: true,
        align: 'right',
        render: (val) =>
          val !== null && val !== undefined
            ? `${formatDecimal(Number(val))} Gram`
            : '-',
      },
      {
        title: 'Berat Sebelum (gram)',
        dataIndex: 'weight_before',
        key: 'weight_before',
        width: 150,
        align: 'right',
        render: (val) =>
          val !== null && val !== undefined
            ? `${formatDecimal(Number(val))} Gram`
            : '-',
      },
      {
        title: 'Berat Sesudah (gram)',
        dataIndex: 'weight_after',
        key: 'weight_after',
        width: 150,
        align: 'right',
        render: (val) =>
          val !== null && val !== undefined
            ? `${formatDecimal(Number(val))} Gram`
            : '-',
      },

      // =============================
      // Kolom Nominal Uang (Rata Kanan)
      // =============================
      {
        title: 'Harga Emas /gr',
        dataIndex: 'gold_history_price_sell',
        key: 'gold_history_price_sell',
        sorter: true,
        align: 'right',
        render: (val) =>
          val !== null && val !== undefined
            ? `Rp${formatDecimal(Number(val))}`
            : '-',
      },
      {
        title: 'Total Harga',
        dataIndex: 'total_price',
        key: 'total_price',
        sorter: true,
        align: 'right',
        render: (val) =>
          val !== null && val !== undefined
            ? `Rp${formatDecimal(Number(val))}`
            : '-',
      },

      // =============================
      // Status & Kode (Rata Tengah)
      // =============================
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        render: (val) => val || '-',
      },
      {
        title: 'Kode Seller',
        dataIndex: 'user_seller_unique_code',
        key: 'user_seller_unique_code',
        align: 'center',
        render: (val) => val || '-',
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
            defaultValue={[dayjs(startOfMonth), dayjs(today)]}
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

export default GoldSellTransactionDetailsTable;
