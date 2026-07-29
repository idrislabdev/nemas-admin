/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldInvestmentReport, IUser } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Select, Table, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';

moment.locale('id');

const { RangePicker } = DatePicker;

// Helper konversi index angka ke huruf kolom Excel (misal: 1 -> A, 27 -> AA)
const getExcelColumnLabel = (colIndex: number): string => {
  let temp = 0;
  let letter = '';
  while (colIndex > 0) {
    temp = (colIndex - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    colIndex = (colIndex - temp - 1) / 26;
  }
  return letter;
};

const GoldInvestmentTable = () => {
  const url = `/reports/gold-investment/list`;

  // 🔹 default tanggal: awal bulan hingga hari ini
  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();

  const [dataTable, setDataTable] = useState<Array<IGoldInvestmentReport>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '',
    status: '',
  });

  const [searchText, setSearchText] = useState('');

  const columns: ColumnsType<IGoldInvestmentReport> = [
    {
      title: 'Nomor Transaksi',
      dataIndex: 'transaction_number',
      key: 'transaction_number',
      width: 150,
    },
    {
      title: 'Tanggal',
      dataIndex: 'date_invested',
      key: 'date_invested',
      width: 150,
      render: (_, record) =>
        record.date_invested && dayjs(record.date_invested).isValid()
          ? moment(record.date_invested).format('DD MMMM YYYY')
          : '-',
    },
    {
      title: 'Tanggal Return',
      dataIndex: 'date_returned',
      key: 'date_returned',
      width: 150,
      render: (_, record) =>
        record.date_returned && dayjs(record.date_returned).isValid()
          ? moment(record.date_returned).format('DD MMMM YYYY')
          : '-',
    },
    {
      title: 'Return Investasi',
      dataIndex: 'investment_return',
      key: 'investment_return',
      width: 150,
      render: (_, record) => record.investment_return?.name || '-',
    },
    {
      title: 'Nama Investor',
      dataIndex: 'investor_name',
      key: 'investor_name',
      width: 150,
    },
    {
      title: 'Nominal Investasi',
      dataIndex: 'amount_invested',
      key: 'amount_invested',
      width: 170,
      align: 'right',
      render: (_, record) =>
        record.amount_invested
          ? `Rp${formatDecimal(parseFloat(record.amount_invested.toString()))}`
          : '-',
    },
    {
      title: 'Berat Investasi',
      dataIndex: 'weight_invested',
      key: 'weight_invested',
      width: 150,
      align: 'right',
      render: (_, record) =>
        record.weight_invested
          ? `${formatDecimal(
              parseFloat(record.weight_invested.toString())
            )} Gram`
          : '-',
    },
    {
      title: 'Nominal Return',
      dataIndex: 'return_amount',
      key: 'return_amount',
      width: 150,
      align: 'right',
      render: (_, record) =>
        record.return_amount
          ? `Rp${formatDecimal(parseFloat(record.return_amount.toString()))}`
          : '-',
    },
    {
      title: 'Berat Return',
      dataIndex: 'return_weight',
      key: 'return_weight',
      width: 150,
      align: 'right',
      render: (_, record) =>
        record.return_weight
          ? `${formatDecimal(parseFloat(record.return_weight.toString()))} Gram`
          : '-',
    },
    {
      title: 'Status Return',
      dataIndex: 'is_returned',
      key: 'is_returned',
      width: 120,
      fixed: 'right',
      render: (_, record) => (record.is_returned ? 'Sudah' : 'Belum'),
    },
    {
      title: 'Status Transaksi',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      fixed: 'right',
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data?.results || []);
      setTotal(resp.data?.count || 0);
    } catch (err) {
      console.error('Fetch data failed:', err);
    }
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams((prev) => ({ ...prev, offset: (val - 1) * prev.limit }));
  };

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (!dates || !dates[0] || !dates[1]) return;

    setParams((prev) => ({
      ...prev,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    }));
  };

  // 🔹 Debounce untuk search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        offset: 0,
        search: searchText.trim(),
      }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => {
    setParams((prev: any) => ({
      ...prev,
      offset: 0,
      status: !filterStatus || filterStatus === 'all' ? '' : filterStatus,
    }));
  }, [filterStatus]);

  const fetchAllData = async (targetUrl: string, currentParams: any) => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(targetUrl, {
      params: { ...currentParams, limit, offset: 0 },
    });

    const firstResults = firstResp.data?.results || [];
    allRows = allRows.concat(firstResults);

    const totalCount = firstResp.data?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;
      const resp = await axiosInstance.get(targetUrl, {
        params: { ...currentParams, limit, offset },
      });
      allRows = allRows.concat(resp.data?.results || []);
      await new Promise((r) => setTimeout(r, 100));
    }

    return allRows;
  };

  /* ================= EXPORT EXCEL ================= */
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      let user: IUser | null = null;
      try {
        const storedUser = localStorage.getItem('user');
        user = storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        console.warn('Failed to parse user from localStorage', e);
      }

      const rows: IGoldInvestmentReport[] = await fetchAllData(url, params);

      if (!rows.length) {
        message.warning('Tidak ada data untuk diexport');
        return;
      }

      const dataToExport = rows.map((item: IGoldInvestmentReport) => ({
        'Nomor Transaksi': item.transaction_number || '-',
        'Tanggal Transaksi':
          item.date_invested && dayjs(item.date_invested).isValid()
            ? moment(item.date_invested).format('DD MMMM YYYY')
            : '-',
        'Tanggal Return':
          item.date_returned && dayjs(item.date_returned).isValid()
            ? moment(item.date_returned).format('DD MMMM YYYY')
            : '-',
        'Return Investasi': item.investment_return?.name || '-',
        'Nama Investor': item.investor_name || '-',
        'Nominal Investasi': parseFloat(
          item.amount_invested?.toString() || '0'
        ),
        'Berat Investasi': parseFloat(item.weight_invested?.toString() || '0'),
        'Nominal Return': parseFloat(item.return_amount?.toString() || '0'),
        'Berat Return': parseFloat(item.return_weight?.toString() || '0'),
        'Status Return': item.is_returned ? 'Sudah' : 'Belum',
        'Status Transaksi': item.status || '-',
      }));

      type ExportRow = (typeof dataToExport)[number];

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Investasi Emas');

      const totalColumns = Object.keys(dataToExport[0]).length;
      const lastColumnLetter = getExcelColumnLabel(totalColumns);

      /* ================= TITLE & METADATA ================= */
      const formattedStartDate =
        params.start_date && dayjs(params.start_date).isValid()
          ? dayjs(params.start_date).format('DD MMMM YYYY')
          : '-';
      const formattedEndDate =
        params.end_date && dayjs(params.end_date).isValid()
          ? dayjs(params.end_date).format('DD MMMM YYYY')
          : '-';

      const metadata = [
        { cell: 'A1', val: 'LAPORAN INVESTASI EMAS', bold: true, size: 14 },
        { cell: 'A2', val: `Dibuat oleh : ${user?.name || '-'}` },
        {
          cell: 'A3',
          val: `Tanggal Export : ${moment().format('DD MMMM YYYY HH:mm')}`,
        },
        { cell: 'A4', val: `Total Data : ${rows.length}` },
        {
          cell: 'A5',
          val: `Periode: ${formattedStartDate} s/d ${formattedEndDate}`,
        },
        {
          cell: 'A6',
          val: `Status: ${params.status ? params.status : 'Semua'}`,
        },
      ];

      metadata.forEach((m, idx) => {
        const rowNum = idx + 1;
        worksheet.mergeCells(`A${rowNum}:${lastColumnLetter}${rowNum}`);
        const c = worksheet.getCell(m.cell);
        c.value = m.val;
        c.font = {
          name: 'Calibri',
          bold: !!m.bold,
          size: m.size || 11,
          color: { argb: 'FF1E293B' },
        };
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      });

      worksheet.addRow([]); // Row 7 Blank

      /* ================= HEADER TABLE ================= */
      const headerKeys = Object.keys(dataToExport[0]) as (keyof ExportRow)[];
      const headerRow = worksheet.addRow(headerKeys);
      const headerRowIndex = 8;
      headerRow.height = 26;

      headerRow.eachCell((cell) => {
        cell.font = {
          name: 'Calibri',
          bold: true,
          color: { argb: 'FFFFFFFF' },
          size: 11,
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'medium', color: { argb: 'FF004397' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' },
        };
      });

      /* ================= DATA ROWS ================= */
      const dataStartRow = 9;

      dataToExport.forEach((row, idx) => {
        const newRow = worksheet.addRow(headerKeys.map((key) => row[key]));
        newRow.height = 20;

        const isEven = idx % 2 === 1;
        const rowBgColor = isEven ? 'FFF8FBFF' : 'FFFFFFFF';

        newRow.eachCell((cell, colIndex) => {
          const header = headerKeys[colIndex - 1];
          const isNominal = header.toLowerCase().includes('nominal');
          const isBerat = header.toLowerCase().includes('berat');
          const isNumeric = isNominal || isBerat;

          cell.font = {
            name: 'Calibri',
            size: 10,
            color: { argb: 'FF334155' },
          };
          cell.alignment = {
            horizontal: isNumeric ? 'right' : 'left',
            vertical: 'middle',
          };

          if (isNumeric && typeof cell.value === 'number') {
            cell.numFmt = isBerat ? '#,##0.00' : '#,##0';
          }

          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowBgColor },
          };

          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          };
        });
      });

      const dataEndRow = dataStartRow + dataToExport.length - 1;

      /* ================= TOTAL ROW (EXCEL FORMULA SUM) ================= */
      type NumericKey =
        | 'Nominal Investasi'
        | 'Berat Investasi'
        | 'Nominal Return'
        | 'Berat Return';

      const totalFields: NumericKey[] = [
        'Nominal Investasi',
        'Berat Investasi',
        'Nominal Return',
        'Berat Return',
      ];

      const totalRowValues = headerKeys.map((key, colIdx) => {
        if (key === 'Nomor Transaksi') return 'TOTAL';
        if (totalFields.includes(key as NumericKey)) {
          const colLetter = getExcelColumnLabel(colIdx + 1);
          return {
            formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`,
          };
        }
        return '';
      });

      const totalRow = worksheet.addRow(totalRowValues);
      totalRow.height = 22;

      totalRow.eachCell((cell, colIndex) => {
        const header = headerKeys[colIndex - 1];
        const isNumeric = totalFields.includes(header as NumericKey);
        const isBerat = header.toLowerCase().includes('berat');

        cell.font = {
          name: 'Calibri',
          bold: true,
          color: { argb: 'FF1E293B' },
          size: 11,
        };
        cell.alignment = {
          horizontal: isNumeric ? 'right' : 'left',
          vertical: 'middle',
        };

        if (isNumeric) {
          cell.numFmt = isBerat ? '#,##0.00' : '#,##0';
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF59D' },
        };

        cell.border = {
          top: { style: 'thin', color: { argb: 'FF94A3B8' } },
          left: { style: 'thin', color: { argb: 'FF94A3B8' } },
          bottom: { style: 'double', color: { argb: 'FF475569' } },
          right: { style: 'thin', color: { argb: 'FF94A3B8' } },
        };
      });

      /* ================= AUTOFILTER & FREEZE PANE ================= */
      worksheet.autoFilter = `A${headerRowIndex}:${lastColumnLetter}${dataEndRow}`;
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: headerRowIndex },
      ];

      /* ================= AUTO WIDTH ================= */
      worksheet.columns.forEach((col) => {
        let maxLen = 0;
        col.eachCell?.({ includeEmpty: true }, (cell, rowNumber) => {
          // Abaikan metadata header (Row 1-6) agar kolom tidak melebar tak beraturan
          if (rowNumber < headerRowIndex) return;

          let strVal = '';
          if (
            cell.value &&
            typeof cell.value === 'object' &&
            'formula' in cell.value
          ) {
            strVal = '123,456,789.00'; // Fallback estimasi formula SUM
          } else if (cell.value != null) {
            strVal = cell.value.toString();
          }

          maxLen = Math.max(maxLen, strVal.length);
        });
        col.width = Math.max(maxLen + 4, 15);
      });

      /* ================= SAVE FILE ================= */
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_investasi_emas_${dayjs().format(
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {/* 🔹 Bagian filter dan search */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[defaultStart, defaultEnd]}
          />

          {/* 🔍 Input search */}
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm font-normal text-neutral-700 w-[220px] focus:outline-none focus:ring-1 focus:ring-blue-500 h-[40px]"
          />

          <Select
            allowClear
            size="large"
            className="w-[180px] h-[40px]"
            placeholder="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'all', label: 'SEMUA' },
              { value: 'CANCELLED', label: 'CANCELLED' },
              { value: 'COMPLETE', label: 'COMPLETE' },
              { value: 'DONE', label: 'DONE' },
              { value: 'PENDING', label: 'PENDING' },
            ]}
          />
        </div>

        <button
          className="btn btn-primary !h-[40px] flex items-center gap-2"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />
          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
        </button>
      </div>

      {/* 🔹 Tabel dan pagination */}
      <div className="flex flex-col  rounded-tr-[8px] rounded-tl-[8px] overflow-hidden">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey={(record) => record.transaction_number || record.date_invested}
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

export default GoldInvestmentTable;
