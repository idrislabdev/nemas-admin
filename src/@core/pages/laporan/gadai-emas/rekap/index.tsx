/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
import { IUser } from '@/@core/@types/interface';

moment.locale('id');

const { RangePicker } = DatePicker;

interface IGoldLoanSummary {
  user_id: string;
  user_name: string;
  loan_total: number;
  loan_amt_total: number;
  loan_fee_total: number;
  loan_due_date_this_month: number;
}

const GadaiEmasRekapTablePage = () => {
  const url = `/reports/gold-loan/summary`;

  const [dataTable, setDataTable] = useState<IGoldLoanSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Default tanggal awal bulan → hari ini
  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    defaultStart,
    defaultEnd,
  ]);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '',
  });

  // Debounce Search
  useEffect(() => {
    const delay = setTimeout(() => {
      setParams((prev) => ({ ...prev, offset: 0, search: searchText }));
    }, 500);
    return () => clearTimeout(delay);
  }, [searchText]);

  // Table Columns (dengan align: 'right' pada kolom numerik/nominal)
  const columns: ColumnsType<IGoldLoanSummary> = [
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 200,
    },
    {
      title: 'Total Transaksi',
      dataIndex: 'loan_total',
      key: 'loan_total',
      width: 150,
      align: 'right',
      render: (v) => (v ? v.toLocaleString('id-ID') : 0),
    },
    {
      title: 'Total Gadai (Rp)',
      dataIndex: 'loan_amt_total',
      key: 'loan_amt_total',
      width: 180,
      align: 'right',
      render: (v) => (v ? `Rp${v.toLocaleString('id-ID')}` : 'Rp0'),
    },
    {
      title: 'Total Biaya (Rp)',
      dataIndex: 'loan_fee_total',
      key: 'loan_fee_total',
      width: 180,
      align: 'right',
      render: (v) => (v ? `Rp${v.toLocaleString('id-ID')}` : 'Rp0'),
    },
    {
      title: 'Jatuh Tempo Bulan Ini (Rp)',
      dataIndex: 'loan_due_date_this_month',
      key: 'loan_due_date_this_month',
      width: 220,
      align: 'right',
      render: (v) => (v ? `Rp${v.toLocaleString('id-ID')}` : 'Rp0'),
      fixed: 'right',
    },
  ];

  // Fetch Data
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params]);

  // Pagination
  const onChangePage = (val: number) => {
    setParams((prev) => ({ ...prev, offset: (val - 1) * prev.limit }));
  };

  // Range picker change
  const onRangeChange = (dates: any, dateStrings: string[]) => {
    if (!dates) return;
    setDateRange(dates);

    setParams((prev) => ({
      ...prev,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    }));
  };

  // Fetch ALL data for export
  const fetchAllData = async () => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    allRows = [...firstResp.data.results];
    const totalCount = firstResp.data.count;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset },
      });
      allRows = [...allRows, ...resp.data.results];
      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  // Export Excel
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const rows = await fetchAllData();
      if (!rows || rows.length === 0) return;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = user?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Rekap Gadai Emas');
      const totalColumns = 6;

      // =============================
      // TITLE & METADATA
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'REKAP GADAI EMAS';
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
        'User ID',
        'User',
        'Total Transaksi',
        'Total Gadai (Rp)',
        'Total Biaya (Rp)',
        'Jatuh Tempo Bulan Ini (Rp)',
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

      // Native Excel Formats
      const integerFormat = '#,##0';
      const currencyFormat = '"Rp"#,##0;("Rp"#,##0);"-"';

      // =============================
      // DATA ROWS
      // =============================
      rows.forEach((item: IGoldLoanSummary, index: number) => {
        const rowValues = [
          item.user_id || '-',
          item.user_name || '-',
          Number(item.loan_total || 0),
          Number(item.loan_amt_total || 0),
          Number(item.loan_fee_total || 0),
          Number(item.loan_due_date_this_month || 0),
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
            case 1: // User ID
              horizontal = 'center';
              break;

            case 3: // Total Transaksi
              horizontal = 'right';
              cell.numFmt = integerFormat;
              break;

            case 4: // Total Gadai (Rp)
            case 5: // Total Biaya (Rp)
            case 6: // Jatuh Tempo Bulan Ini (Rp)
              horizontal = 'right';
              cell.numFmt = currencyFormat;
              break;

            default: // User Name
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
        { formula: `SUM(C${startRow}:C${endRow})` },
        { formula: `SUM(D${startRow}:D${endRow})` },
        { formula: `SUM(E${startRow}:E${endRow})` },
        { formula: `SUM(F${startRow}:F${endRow})` },
      ]);

      const totalRowNumber = totalRow.number;
      worksheet.mergeCells(`A${totalRowNumber}:B${totalRowNumber}`);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) {
          horizontal = 'center';
        } else if (colNumber >= 3 && colNumber <= 6) {
          horizontal = 'right';
        }

        // Format NumFmt pada Total
        if (colNumber === 3) cell.numFmt = integerFormat;
        if (colNumber >= 4 && colNumber <= 6) cell.numFmt = currencyFormat;

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

      const fileName = `rekap_gadai_emas_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (e) {
      console.error(e);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            value={dateRange}
            onChange={onRangeChange}
          />

          <input
            type="text"
            placeholder="Cari data..."
            className="h-[40px] w-[250px] pl-9 pr-3 border rounded-md text-sm focus:ring-2 focus:ring-primary"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <button
          onClick={exportData}
          className="btn btn-primary !h-[40px] flex items-center gap-2"
        >
          <FileDownload02 /> Export Excel
        </button>
      </div>

      <div className="flex flex-col  rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          rowKey="user_id"
          className="table-basic"
        />

        <div className="flex justify-end p-[12px]">
          <Pagination
            total={total}
            pageSize={params.limit}
            showSizeChanger={false}
            onChange={onChangePage}
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

export default GadaiEmasRekapTablePage;
