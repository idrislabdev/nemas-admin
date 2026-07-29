/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
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

export interface IGoldBuySummaryUser {
  user_id: string;
  user_name: string;
  user_member_number: string;
  user_seller_unique_code: string;
  total_pembelian: number;
  total_emas_dibeli: number;
  jumlah_transaksi: number;
  total_komisi: number;
  transaksi_terakhir: string;
}

const GoldBuySummaryUserTable = () => {
  const url = `/reports/gold-buy-transaction/summary-user`;

  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<IGoldBuySummaryUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    order_by: 'jumlah_transaksi',
    order_direction: 'DESC',
    search: '',
  });

  const [rangeValue, setRangeValue] = useState<[Dayjs, Dayjs]>([
    dayjs(startOfMonth),
    dayjs(today),
  ]);

  const [searchText, setSearchText] = useState('');

  // 🔁 Fetch data
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }, [params, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🕒 Debounce search (500 ms)
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

  // 📆 Filter tanggal
  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (!dates || !dates[0] || !dates[1]) return;
    setRangeValue([dates[0], dates[1]]);
    setParams({
      ...params,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
      offset: 0,
    });
  };

  // 📄 Pagination
  const onChangePage = (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  // 📑 Sorting handler
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
        order_by: 'jumlah_transaksi',
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

      const rows = resp.data.results as IGoldBuySummaryUser[];

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = user?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Summary Pembelian Emas');

      const totalColumns = 8;

      // =============================
      // TITLE & METADATA
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN SUMMARY PEMBELIAN EMAS PER USER';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF0057B7' } };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

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
          : '-';

      worksheet.getCell('A6').value = 'Periode';
      worksheet.getCell('B6').value = `: ${periodeText}`;

      ['A3', 'A4', 'A5', 'A6'].forEach((cell) => {
        worksheet.getCell(cell).font = { bold: true };
      });

      worksheet.addRow([]); // Baris kosong (Row 7)

      // =============================
      // HEADER TABEL (Row 8)
      // =============================
      const header = [
        'Nama User',
        'Nomor Member',
        'Kode Seller',
        'Jumlah Transaksi',
        'Total Pembelian (Rp)',
        'Total Emas Dibeli (gram)',
        'Total Komisi (Rp)',
        'Transaksi Terakhir',
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

      // Native Excel Number Formatting
      const currencyFormat = '"Rp"#,##0;("Rp"#,##0);"-"';
      const weightFormat = '#,##0.00" Gram"';
      const integerFormat = '#,##0';

      // =============================
      // DATA ROWS
      // =============================
      rows.forEach((item, index) => {
        const rowValues = [
          item.user_name || '-',
          item.user_member_number || '-',
          item.user_seller_unique_code || '-',
          Number(item.jumlah_transaksi || 0),
          Number(item.total_pembelian || 0),
          Number(item.total_emas_dibeli || 0),
          Number(item.total_komisi || 0),
          item.transaksi_terakhir
            ? moment(item.transaksi_terakhir).format('DD MMM YYYY HH:mm')
            : '-',
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
            case 3: // Kode Seller
              horizontal = 'center';
              break;

            case 4: // Jumlah Transaksi
              horizontal = 'right';
              cell.numFmt = integerFormat;
              break;

            case 5: // Total Pembelian (Rp)
              horizontal = 'right';
              cell.numFmt = currencyFormat;
              break;

            case 6: // Total Emas Dibeli (gram)
              horizontal = 'right';
              cell.numFmt = weightFormat;
              break;

            case 7: // Total Komisi (Rp)
              horizontal = 'right';
              cell.numFmt = currencyFormat;
              break;

            case 8: // Transaksi Terakhir
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
      // TOTAL ROW
      // =============================
      const startRow = 9;
      const endRow = 8 + rows.length;

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        '',
        { formula: `SUM(D${startRow}:D${endRow})` },
        { formula: `SUM(E${startRow}:E${endRow})` },
        { formula: `SUM(F${startRow}:F${endRow})` },
        { formula: `SUM(G${startRow}:G${endRow})` },
        '',
      ]);

      const totalRowNumber = totalRow.number;
      worksheet.mergeCells(`A${totalRowNumber}:C${totalRowNumber}`);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) horizontal = 'center';
        else if (colNumber >= 4 && colNumber <= 7) horizontal = 'right';

        // NumFmt untuk total
        if (colNumber === 4) cell.numFmt = integerFormat;
        if (colNumber === 5 || colNumber === 7) cell.numFmt = currencyFormat;
        if (colNumber === 6) cell.numFmt = weightFormat;

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
      // FREEZE, FILTER & AUTO WIDTH
      // =============================
      worksheet.views = [{ state: 'frozen', ySplit: 8 }];
      worksheet.autoFilter = {
        from: { row: 8, column: 1 },
        to: { row: 8, column: totalColumns },
      };

      worksheet.columns.forEach((column: any, colIdx: number) => {
        let maxLength = header[colIdx]?.length || 10;

        // Hanya menghitung dari baris Header (Baris 8) ke bawah
        column.eachCell({ includeEmpty: true }, (cell: any, rowNum: number) => {
          if (rowNum >= 8) {
            const val = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, val.length);
          }
        });

        column.width = Math.min(maxLength + 4, 35);
      });

      // =============================
      // SAVE FILE
      // =============================
      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `laporan_summary_pembelian_user_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const columns: ColumnsType<IGoldBuySummaryUser> = useMemo(
    () => [
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
        title: 'Kode Seller',
        dataIndex: 'user_seller_unique_code',
        key: 'user_seller_unique_code',
        align: 'center',
        render: (val) => val || '-',
      },
      {
        title: 'Jumlah Transaksi',
        dataIndex: 'jumlah_transaksi',
        key: 'jumlah_transaksi',
        align: 'right',
        sorter: true,
        render: (val) => (val ? formatDecimal(val) : '0'),
      },
      {
        title: 'Total Pembelian',
        dataIndex: 'total_pembelian',
        key: 'total_pembelian',
        align: 'right',
        sorter: true,
        render: (val) => (val ? `Rp ${formatDecimal(val)}` : 'Rp 0'),
      },
      {
        title: 'Total Emas Dibeli (gram)',
        dataIndex: 'total_emas_dibeli',
        key: 'total_emas_dibeli',
        align: 'right',
        sorter: true,
        render: (val) => (val ? formatDecimal(val) : '0'),
      },
      {
        title: 'Total Komisi',
        dataIndex: 'total_komisi',
        key: 'total_komisi',
        align: 'right',
        render: (val) => (val ? `Rp ${formatDecimal(val)}` : 'Rp 0'),
      },
      {
        title: 'Transaksi Terakhir',
        dataIndex: 'transaksi_terakhir',
        key: 'transaksi_terakhir',
        align: 'center',
        sorter: true,
        render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
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
            value={rangeValue}
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
          rowKey="user_id"
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

export default GoldBuySummaryUserTable;
