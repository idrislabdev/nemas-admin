/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Pagination, Table, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { FileDownload02 } from '@untitled-ui/icons-react';
import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { formatDecimal } from '@/@core/utils/general';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/id';
import { IUser } from '@/@core/@types/interface';

dayjs.locale('id');
const { RangePicker } = DatePicker;

/* ================= INTERFACE ================= */
export interface IGoldRedeemSummary {
  order_timestamp: string;
  order_number: string;
  name: string;
  qty: number;
  weight: number;
  gold_price: number;
  cert_price: number;
  order_admin_amount: number;
  order_tracking_insurance: number;
  order_amount: number;
  order_payment_method_name: string;
  order_payment_va_bank: string;
  order_payment_number: string;
  order_gold_payment_status: string;
  tracking_number: string;
  delivery_pickup_date: string;
  tracking_courier_name: string;
  delivery_status: string;
}

/* ================= EXPORT TYPE ================= */
type ExportSummaryRow = {
  'Tanggal Order': string;
  'No Order': string;
  Nama: string;
  Qty: number;
  'Berat (gr)': number;
  'Harga Emas (Rp)': number;
  'Harga Sertifikat (Rp)': number;
  'Admin (Rp)': number;
  'Asuransi (Rp)': number;
  'Total Order (Rp)': number;
  'Metode Pembayaran': string;
  'No Pembayaran': string;
  'Status Pembayaran': string;
  Kurir: string;
  'No Resi': string;
  'Status Pengiriman': string;
};

/* ================= HELPER EXCEL ================= */
const getExcelColumnLabel = (colIndex: number): string => {
  let label = '';
  let index = colIndex;
  while (index > 0) {
    const remainder = (index - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    index = Math.floor((index - 1) / 26);
  }
  return label;
};

const TarikEmasSummaryTable = () => {
  const url = '/reports/gold-redeem/summary';

  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<IGoldRedeemSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    order_by: 'order_amount',
    order_direction: 'DESC',
    search: '',
  });

  const [rangeValue, setRangeValue] = useState<[Dayjs, Dayjs]>([
    dayjs(startOfMonth),
    dayjs(today),
  ]);

  const [searchText, setSearchText] = useState('');

  /* ================= FETCH ================= */
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data?.results || []);
      setTotal(resp.data?.count || 0);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= SEARCH DEBOUNCE ================= */
  useEffect(() => {
    const t = setTimeout(() => {
      setParams((prev) => {
        if (prev.search === searchText) return prev;
        return {
          ...prev,
          search: searchText,
          offset: 0,
        };
      });
    }, 500);
    return () => clearTimeout(t);
  }, [searchText]);

  /* ================= DATE FILTER ================= */
  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (!dates || !dates[0] || !dates[1]) return;

    setRangeValue([dates[0], dates[1]]);
    setParams((prev) => ({
      ...prev,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
      offset: 0,
    }));
  };

  /* ================= PAGINATION ================= */
  const onChangePage = (page: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  };

  /* ================= SORT ================= */
  const handleTableChange = (
    _: TablePaginationConfig,
    __: any,
    sorter: any
  ) => {
    if (Array.isArray(sorter)) return;

    if (sorter.order) {
      setParams((prev) => ({
        ...prev,
        order_by: sorter.field,
        order_direction: sorter.order === 'ascend' ? 'ASC' : 'DESC',
        offset: 0,
      }));
    }
  };

  /* ================= EXPORT EXCEL ================= */
  const exportSummary = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const resp = await axiosInstance.get(url, {
        params: { ...params, offset: 0, limit: 1000 },
      });

      const rows = (resp.data?.results || []) as IGoldRedeemSummary[];
      if (!rows || rows.length === 0) {
        message.warning('Tidak ada data untuk diexport.');
        return;
      }

      /* 1. MAPPING DATA EXPORT */
      const dataToExport: ExportSummaryRow[] = rows.map((r) => ({
        'Tanggal Order': r.order_timestamp
          ? dayjs(r.order_timestamp).format('DD MMMM YYYY HH:mm')
          : '-',
        'No Order': r.order_number || '-',
        Nama: r.name || '-',
        Qty: Number(r.qty || 0),
        'Berat (gr)': Number(r.weight || 0),
        'Harga Emas (Rp)': Number(r.gold_price || 0),
        'Harga Sertifikat (Rp)': Number(r.cert_price || 0),
        'Admin (Rp)': Number(r.order_admin_amount || 0),
        'Asuransi (Rp)': Number(r.order_tracking_insurance || 0),
        'Total Order (Rp)': Number(r.order_amount || 0),
        'Metode Pembayaran': r.order_payment_method_name || '-',
        'No Pembayaran': r.order_payment_number || '-',
        'Status Pembayaran': r.order_gold_payment_status || '-',
        Kurir: r.tracking_courier_name || '-',
        'No Resi': r.tracking_number || '-',
        'Status Pengiriman': r.delivery_status || '-',
      }));

      /* 2. INSIALISASI WORKBOOK & WORKSHEET */
      const workbook = new ExcelJS.Workbook();
      workbook.creator = user?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Tarik Emas Summary');
      const headerKeys = Object.keys(
        dataToExport[0]
      ) as (keyof ExportSummaryRow)[];
      const totalColumns = headerKeys.length;

      // =============================
      // TITLE & METADATA (SAMA PERSIS WITH BUY REPORT)
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN TARIK EMAS SUMMARY';
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
      const headerRow = worksheet.addRow(headerKeys);
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

      // Native Excel Formats
      const currencyFormat = '"Rp"#,##0;("Rp"#,##0);"-"';
      const weightFormat = '#,##0.00" Gram"';
      const qtyFormat = '#,##0';

      // =============================
      // DATA ROWS
      // =============================
      dataToExport.forEach((row, index) => {
        const newRow = worksheet.addRow(headerKeys.map((k) => row[k]));

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
          const header = headerKeys[colNumber - 1];
          let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

          if (
            header === 'Tanggal Order' ||
            header === 'Status Pembayaran' ||
            header === 'Status Pengiriman' ||
            header === 'Kurir' ||
            header === 'No Resi'
          ) {
            horizontal = 'center';
          } else if (header === 'Qty') {
            horizontal = 'right';
            cell.numFmt = qtyFormat;
          } else if (header === 'Berat (gr)') {
            horizontal = 'right';
            cell.numFmt = weightFormat;
          } else if (header.includes('(Rp)')) {
            horizontal = 'right';
            cell.numFmt = currencyFormat;
          } else {
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
      // TOTAL ROW (EXCEL FORMULA & ACCORDING STYLING)
      // =============================
      const startRow = 9;
      const endRow = 8 + rows.length;

      type NumericKey =
        | 'Qty'
        | 'Berat (gr)'
        | 'Harga Emas (Rp)'
        | 'Harga Sertifikat (Rp)'
        | 'Admin (Rp)'
        | 'Asuransi (Rp)'
        | 'Total Order (Rp)';

      const totalFields: NumericKey[] = [
        'Qty',
        'Berat (gr)',
        'Harga Emas (Rp)',
        'Harga Sertifikat (Rp)',
        'Admin (Rp)',
        'Asuransi (Rp)',
        'Total Order (Rp)',
      ];

      const totalRow = worksheet.addRow(
        headerKeys.map((key, colIdx) => {
          if (key === 'Tanggal Order') return 'TOTAL';
          if (totalFields.includes(key as NumericKey)) {
            const colLetter = getExcelColumnLabel(colIdx + 1);
            return {
              formula: `SUM(${colLetter}${startRow}:${colLetter}${endRow})`,
            };
          }
          return '';
        })
      );

      const totalRowNumber = totalRow.number;
      worksheet.mergeCells(`A${totalRowNumber}:C${totalRowNumber}`); // Merge Tanggal, No Order, Nama

      totalRow.eachCell((cell, colNumber) => {
        const header = headerKeys[colNumber - 1];
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) horizontal = 'center';
        else if (totalFields.includes(header as NumericKey)) {
          horizontal = 'right';
        }

        // Format NumFmt pada Total
        if (header === 'Qty') cell.numFmt = qtyFormat;
        if (header === 'Berat (gr)') cell.numFmt = weightFormat;
        if (header.includes('(Rp)')) cell.numFmt = currencyFormat;

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
        let maxLength = headerKeys[colIdx]?.length || 10;

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

      const fileName = `laporan_tarik_emas_summary_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
      message.error('Gagal mengunduh laporan Excel');
    } finally {
      setIsModalLoading(false);
    }
  };

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<IGoldRedeemSummary> = useMemo(
    () => [
      {
        title: 'Tanggal Order',
        dataIndex: 'order_timestamp',
        render: (v) => (v ? dayjs(v).format('DD MMM YYYY HH:mm') : '-'),
        width: 180,
      },
      { title: 'No Order', dataIndex: 'order_number' },
      { title: 'Nama', dataIndex: 'name' },
      { title: 'Qty', dataIndex: 'qty', align: 'right' },
      {
        title: 'Berat (gr)',
        dataIndex: 'weight',
        align: 'right',
        render: formatDecimal,
      },
      {
        title: 'Total Order',
        dataIndex: 'order_amount',
        align: 'right',
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      { title: 'Metode Bayar', dataIndex: 'order_payment_method_name' },
      { title: 'Status Pembayaran', dataIndex: 'order_gold_payment_status' },
      { title: 'Kurir', dataIndex: 'tracking_courier_name' },
      { title: 'No Resi', dataIndex: 'tracking_number' },
      { title: 'Status Pengiriman', dataIndex: 'delivery_status' },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div className="flex gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            value={rangeValue}
            onChange={onRangeChange}
          />
          <input
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border rounded px-3 h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={exportSummary}
        >
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] overflow-hidden">
        <Table
          columns={columns}
          dataSource={dataTable}
          pagination={false}
          onChange={handleTableChange}
          rowKey="order_number"
          size="small"
        />

        <div className="flex justify-end p-3">
          <Pagination
            total={total}
            pageSize={params.limit}
            onChange={onChangePage}
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

export default TarikEmasSummaryTable;
