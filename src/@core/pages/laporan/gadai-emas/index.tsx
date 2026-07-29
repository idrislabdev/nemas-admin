/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { IGoldLoan, IUser } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Select, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useRouter, useSearchParams } from 'next/navigation';

import 'moment/locale/id';
moment.locale('id');

const { RangePicker } = DatePicker;

const GadaiEmasTablePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const url = `/reports/gold-loan/list`;

  // -------------------------------------------------------------------
  // Ambil query string
  // -------------------------------------------------------------------
  const queryStart = searchParams.get('start_date');
  const queryEnd = searchParams.get('end_date');
  const queryDueStart = searchParams.get('due_start_date');
  const queryDueEnd = searchParams.get('due_end_date');
  const queryStatus = searchParams.get('loan_status_name') || '';
  const queryPage = Number(searchParams.get('page') || 1);

  const defaultStart = queryStart ? dayjs(queryStart) : '';
  const defaultEnd = queryEnd ? dayjs(queryEnd) : '';

  const defaultDueStart = queryDueStart ? dayjs(queryDueStart) : '';
  const defaultDueEnd = queryDueEnd ? dayjs(queryDueEnd) : '';

  const [filterStatus, setFilterStatus] = useState(queryStatus);

  const [params, setParams] = useState({
    format: 'json',
    offset: (queryPage - 1) * 10,
    limit: 10,
    start_date: defaultStart ? defaultStart.format('YYYY-MM-DD') : null,
    end_date: defaultEnd ? defaultEnd.format('YYYY-MM-DD') : null,
    due_start_date: defaultDueStart
      ? defaultDueStart.format('YYYY-MM-DD')
      : null,
    due_end_date: defaultDueEnd ? defaultDueEnd.format('YYYY-MM-DD') : null,
    loan_status_name: queryStatus || null,
    search: '',
  });

  const [searchText, setSearchText] = useState('');
  const [dataTable, setDataTable] = useState<Array<IGoldLoan>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // -------------------------------------------------------------------
  // Helper update query string
  // -------------------------------------------------------------------
  const updateQueryString = (obj: Record<string, any>) => {
    const q = new URLSearchParams(searchParams.toString());

    Object.entries(obj).forEach(([key, val]) => {
      if (val === '' || val === null || val === undefined) {
        q.delete(key);
      } else {
        q.set(key, String(val));
      }
    });

    router.replace(`?${q.toString()}`);
  };

  // -------------------------------------------------------------------
  // Debounce search
  // -------------------------------------------------------------------
  useEffect(() => {
    const delay = setTimeout(() => {
      setParams((prev) => ({ ...prev, offset: 0, search: searchText }));
      updateQueryString({ page: 1 });
    }, 500);

    return () => clearTimeout(delay);
  }, [searchText]);

  //----
  // export data
  //-------

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
      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const rows = await fetchAllData(url, params);
      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = user?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Gadai Emas');
      const totalColumns = 13;

      // =============================
      // TITLE & METADATA
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN GADAI EMAS';
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
        'No. Gadai',
        'Tanggal Gadai',
        'User',
        'Berat Emas (Gram)',
        'Harga Jual Emas (Rp)',
        'Jumlah Gadai (Gram)',
        'Biaya Admin (Rp)',
        'Biaya Transfer (Rp)',
        'Total Nilai Aktif (Rp)',
        'Jumlah Transfer (Rp)',
        'Tanggal Jatuh Tempo',
        'Status',
        'Catatan',
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
      const currencyFormat = '"Rp"#,##0;("Rp"#,##0);"-"';
      const weightFormat = '#,##0.00" Gram"';

      // =============================
      // DATA ROWS
      // =============================
      rows.forEach((item: IGoldLoan, index: number) => {
        const rowValues = [
          item.loan_ref_number || '-',
          item.loan_date_time
            ? moment(item.loan_date_time).format('DD MMM YYYY HH:mm')
            : '-',
          item.user_name || '-',
          Number(item.loan_gold_wgt || 0),
          Number(item.loan_gold_price_sell || 0),
          Number(item.loan_amt || 0),
          Number(item.loan_cost_admin || 0),
          Number(item.loan_cost_transfer || 0),
          Number(item.loan_total_amt || 0),
          Number(item.loan_transfer_amount || 0),
          item.loan_due_date
            ? moment(item.loan_due_date).format('DD MMM YYYY')
            : '-',
          item.loan_status_name || '-',
          item.loan_note || '-',
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
            case 1: // No. Gadai
            case 2: // Tanggal Gadai
            case 11: // Tanggal Jatuh Tempo
            case 12: // Status
              horizontal = 'center';
              break;

            case 4: // Berat Emas (Gram)
            case 6: // Jumlah Gadai (Gram)
              horizontal = 'right';
              cell.numFmt = weightFormat;
              break;

            case 5: // Harga Jual Emas (Rp)
            case 7: // Biaya Admin (Rp)
            case 8: // Biaya Transfer (Rp)
            case 9: // Total Nilai Aktif (Rp)
            case 10: // Jumlah Transfer (Rp)
              horizontal = 'right';
              cell.numFmt = currencyFormat;
              break;

            default: // User, Catatan
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
        { formula: `SUM(H${startRow}:H${endRow})` },
        { formula: `SUM(I${startRow}:I${endRow})` },
        { formula: `SUM(J${startRow}:J${endRow})` },
        '',
        '',
        '',
      ]);

      const totalRowNumber = totalRow.number;
      worksheet.mergeCells(`A${totalRowNumber}:C${totalRowNumber}`);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) horizontal = 'center';
        else if (colNumber >= 4 && colNumber <= 10) {
          horizontal = 'right';
        }

        // Format NumFmt pada Total
        if (colNumber === 4 || colNumber === 6) cell.numFmt = weightFormat;
        if (
          colNumber === 5 ||
          colNumber === 7 ||
          colNumber === 8 ||
          colNumber === 9 ||
          colNumber === 10
        ) {
          cell.numFmt = currencyFormat;
        }

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

        // Kalkulasi lebar hanya berdasarkan isi data & header tabel (Baris 8 ke bawah)
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

      const fileName = `laporan_gadai_emas_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  // -------------------------------------------------------------------
  // Fetch Data
  // -------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -------------------------------------------------------------------
  // Handle Pagination
  // -------------------------------------------------------------------
  const onChangePage = (page: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));

    updateQueryString({ page });
  };

  // -------------------------------------------------------------------
  // Handle Date Filter
  // -------------------------------------------------------------------
  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    const [start, end] = dateStrings;

    setParams((prev) => ({
      ...prev,
      start_date: start,
      end_date: end,
      offset: 0,
    }));

    updateQueryString({
      start_date: start,
      end_date: end,
      page: 1,
    });
  };

  const onRangeChangeDue = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    const [start, end] = dateStrings;

    setParams((prev) => ({
      ...prev,
      due_start_date: start,
      due_end_date: end,
      offset: 0,
    }));

    updateQueryString({
      due_start_date: start,
      due_end_date: end,
      page: 1,
    });
  };

  // -------------------------------------------------------------------
  // Handle Status Filter
  // -------------------------------------------------------------------
  const handleStatusChange = (value: string) => {
    setFilterStatus(value);

    setParams((prev) => ({
      ...prev,
      loan_status_name: value,
      offset: 0,
    }));

    updateQueryString({
      loan_status_name: value || null,
      page: 1,
    });
  };

  // -------------------------------------------------------------------
  // Table Columns
  // -------------------------------------------------------------------
  const columns: ColumnsType<IGoldLoan> = [
    {
      title: 'No. Gadai',
      dataIndex: 'loan_ref_number',
      key: 'loan_ref_number',
      width: 160,
      fixed: 'left',
    },
    {
      title: 'Tanggal Gadai',
      dataIndex: 'loan_date_time',
      key: 'loan_date_time',
      width: 180,
      render: (_, record) =>
        moment(record.loan_date_time).format('DD MMMM YYYY HH:mm'),
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 150,
    },
    {
      title: 'Berat Emas',
      dataIndex: 'loan_gold_wgt',
      key: 'loan_gold_wgt',
      width: 130,
      align: 'right',
      render: (_, record) =>
        record.loan_gold_wgt
          ? `${formatDecimal(record.loan_gold_wgt)} Gram`
          : '-',
    },
    {
      title: 'Harga Jual Emas',
      dataIndex: 'loan_gold_price_sell',
      key: 'loan_gold_price_sell',
      width: 180,
      align: 'right',
      render: (_, record) =>
        record.loan_gold_price_sell
          ? `Rp${formatDecimal(record.loan_gold_price_sell)}`
          : '-',
    },
    {
      title: 'Jumlah Gadai (Gram)',
      dataIndex: 'loan_amt',
      key: 'loan_amt',
      width: 180,
      align: 'right',
      render: (_, record) =>
        record.loan_amt ? `Rp${formatDecimal(record.loan_amt)}` : '-',
    },
    {
      title: 'Biaya Admin',
      dataIndex: 'loan_cost_admin',
      key: 'loan_cost_admin',
      width: 150,
      align: 'right',
      render: (_, record) =>
        record.loan_cost_admin
          ? `Rp${formatDecimal(record.loan_cost_admin)}`
          : '-',
    },
    {
      title: 'Biaya Transfer',
      dataIndex: 'loan_cost_transfer',
      key: 'loan_cost_transfer',
      width: 150,
      align: 'right',
      render: (_, record) =>
        record.loan_cost_transfer
          ? `Rp${formatDecimal(record.loan_cost_transfer)}`
          : '-',
    },
    {
      title: 'Total Nilai Aktif',
      dataIndex: 'loan_total_amt',
      key: 'loan_total_amt',
      width: 180,
      align: 'right',
      render: (_, record) =>
        record.loan_total_amt
          ? `Rp${formatDecimal(record.loan_total_amt)}`
          : '-',
    },
    {
      title: 'Jumlah Transfer',
      dataIndex: 'loan_transfer_amount',
      key: 'loan_transfer_amount',
      width: 180,
      align: 'right',
      render: (_, record) =>
        record.loan_transfer_amount
          ? `Rp${formatDecimal(record.loan_transfer_amount)}`
          : '-',
    },
    {
      title: 'Tanggal Jatuh Tempo',
      dataIndex: 'loan_due_date',
      key: 'loan_due_date',
      width: 160,
      render: (_, record) =>
        record.loan_due_date
          ? moment(record.loan_due_date).format('DD MMMM YYYY')
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'loan_status_name',
      key: 'loan_status_name',
      width: 150,
      fixed: 'right',
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between mb-4 gap-2">
        <div className="flex items-end gap-2">
          {/* FILTER DATE RANGE */}
          <div className="flex flex-col gap-2">
            <label>Tanggal Gadai</label>
            <RangePicker
              size="small"
              className="w-[320px] h-[40px]"
              onChange={onRangeChange}
              value={
                params.start_date && params.end_date
                  ? [dayjs(params.start_date), dayjs(params.end_date)]
                  : null
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>Tanggal Jatuh Tempo</label>
            <RangePicker
              size="small"
              className="w-[320px] h-[40px]"
              onChange={onRangeChangeDue}
              value={
                params.due_start_date && params.due_end_date
                  ? [dayjs(params.due_start_date), dayjs(params.due_end_date)]
                  : null
              }
            />
          </div>

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-[40px] w-[250px] pl-9 pr-3 border rounded-md text-sm"
          />

          {/* FILTER STATUS */}
          <Select
            allowClear
            size="large"
            className="w-[180px] select-sm"
            placeholder="Semua Status"
            value={filterStatus || undefined}
            onChange={handleStatusChange}
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />
        </div>

        {/* EXPORT BUTTON */}
        <button
          className="btn !h-[40px] btn-primary flex items-center gap-2"
          onClick={exportData}
        >
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          rowKey="id"
        />

        <div className="flex justify-end p-[12px]">
          <Pagination
            current={params.offset / params.limit + 1}
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

export default GadaiEmasTablePage;
