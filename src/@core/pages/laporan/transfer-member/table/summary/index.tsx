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
import moment from 'moment';
import 'moment/locale/id';
import { IUser } from '@/@core/@types/interface';

moment.locale('id');
const { RangePicker } = DatePicker;

export interface ITransferMemberSummary {
  user_from_id: string;
  role_name: string;
  member_number: string;
  name: string;
  email: string;
  phone_number: string;
  transfer_weight: number;
  transfer_weight_received: number;
  admin_weight: number;
  transfer_amount: number;
  transfer_amount_received: number;
}

// Helper untuk konversi index angka ke huruf kolom Excel (misal: 1 -> A, 27 -> AA)
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

const TransferMemberSummaryTable = () => {
  const url = `/reports/transfer-member/summary`;

  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<ITransferMemberSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    order_by: 'transfer_amount',
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
  }, [params, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= SEARCH DEBOUNCE ================= */
  useEffect(() => {
    const t = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        search: searchText,
        offset: 0,
      }));
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

  /* ================= SORTING ================= */
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

      const resp = await axiosInstance.get(url, {
        params: { ...params, offset: 0, limit: 5000 },
      });

      const rows = (resp.data?.results || []) as ITransferMemberSummary[];
      if (!rows.length) {
        message.warning('Tidak ada data untuk diexport');
        return;
      }

      /* ================= MAP DATA ================= */
      const dataToExport = rows.map((r) => ({
        Nama: r.name || '-',
        Role: r.role_name || '-',
        'Nomor Member': r.member_number || '-',
        Email: r.email || '-',
        'No HP': r.phone_number || '-',
        'Berat Transfer (gr)': Number(r.transfer_weight) || 0,
        'Berat Diterima (gr)': Number(r.transfer_weight_received) || 0,
        'Admin Weight (gr)': Number(r.admin_weight) || 0,
        'Nominal Transfer (Rp)': Number(r.transfer_amount) || 0,
        'Nominal Diterima (Rp)': Number(r.transfer_amount_received) || 0,
      }));

      type ExportRow = (typeof dataToExport)[number];

      /* ================= EXCEL WORKBOOK ================= */
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Summary Transfer Member');

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
        {
          cell: 'A1',
          val: 'LAPORAN SUMMARY TRANSFER MEMBER',
          bold: true,
          size: 14,
        },
        { cell: 'A2', val: `Dibuat oleh : ${user?.name || '-'}` },
        {
          cell: 'A3',
          val: `Tanggal Export : ${dayjs().format('DD MMMM YYYY HH:mm')}`,
        },
        { cell: 'A4', val: `Total Data : ${rows.length}` },
        {
          cell: 'A5',
          val: `Periode: ${formattedStartDate} s/d ${formattedEndDate}`,
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

      worksheet.addRow([]); // Row 6 Blank

      /* ================= HEADER ================= */
      const headerKeys = Object.keys(dataToExport[0]) as (keyof ExportRow)[];
      const headerRow = worksheet.addRow(headerKeys);
      const headerRowIndex = 7;
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
      const dataStartRow = 8;

      dataToExport.forEach((row, idx) => {
        const newRow = worksheet.addRow(headerKeys.map((key) => row[key]));
        newRow.height = 20;

        const isEven = idx % 2 === 1;
        const rowBgColor = isEven ? 'FFF8FBFF' : 'FFFFFFFF';

        newRow.eachCell((cell, colIndex) => {
          const header = headerKeys[colIndex - 1];
          const isNumeric = header.includes('(Rp)') || header.includes('(gr)');

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
            cell.numFmt = header.includes('(gr)') ? '#,##0.00' : '#,##0';
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

      /* ================= TOTAL ROW (EXCEL FORMULA) ================= */
      type NumericExportKey =
        | 'Berat Transfer (gr)'
        | 'Berat Diterima (gr)'
        | 'Admin Weight (gr)'
        | 'Nominal Transfer (Rp)'
        | 'Nominal Diterima (Rp)';

      const totalFields: NumericExportKey[] = [
        'Berat Transfer (gr)',
        'Berat Diterima (gr)',
        'Admin Weight (gr)',
        'Nominal Transfer (Rp)',
        'Nominal Diterima (Rp)',
      ];

      const totalRowValues = headerKeys.map((key, colIdx) => {
        if (key === 'Nama') return 'TOTAL';
        if (totalFields.includes(key as NumericExportKey)) {
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
        const isNumeric = totalFields.includes(header as NumericExportKey);

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
          cell.numFmt = header.includes('(gr)') ? '#,##0.00' : '#,##0';
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
          // Abaikan baris metadata (Row 1-5) agar kolom tidak melebar melebihi batas isi tabel
          if (rowNumber < headerRowIndex) return;

          let strVal = '';
          if (
            cell.value &&
            typeof cell.value === 'object' &&
            'formula' in cell.value
          ) {
            strVal = '123,456,789.00'; // Estimasi fallback panjang string formula SUM
          } else if (cell.value != null) {
            strVal = cell.value.toString();
          }

          maxLen = Math.max(maxLen, strVal.length);
        });
        col.width = Math.max(maxLen + 4, 14);
      });

      /* ================= SAVE FILE ================= */
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `laporan_summary_transfer_member_${dayjs().format(
          'YYYYMMDD_HHmmss'
        )}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
      message.error('Gagal mengunduh laporan Excel');
    } finally {
      setIsModalLoading(false);
    }
  };

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<ITransferMemberSummary> = useMemo(
    () => [
      { title: 'Nama', dataIndex: 'name', key: 'name', sorter: true },
      {
        title: 'Role',
        dataIndex: 'role_name',
        key: 'role_name',
        sorter: true,
      },
      {
        title: 'Nomor Member',
        dataIndex: 'member_number',
        key: 'member_number',
        sorter: true,
      },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      { title: 'No HP', dataIndex: 'phone_number', key: 'phone_number' },
      {
        title: 'Berat Transfer (gr)',
        dataIndex: 'transfer_weight',
        key: 'transfer_weight',
        sorter: true,
        align: 'right',
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Berat Diterima (gr)',
        dataIndex: 'transfer_weight_received',
        key: 'transfer_weight_received',
        sorter: true,
        align: 'right',
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Admin Weight (gr)',
        dataIndex: 'admin_weight',
        key: 'admin_weight',
        sorter: true,
        align: 'right',
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Nominal Transfer',
        dataIndex: 'transfer_amount',
        key: 'transfer_amount',
        sorter: true,
        align: 'right',
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      {
        title: 'Nominal Diterima',
        dataIndex: 'transfer_amount_received',
        key: 'transfer_amount_received',
        sorter: true,
        align: 'right',
        render: (v) => `Rp${formatDecimal(v)}`,
      },
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
            className="border rounded px-3 h-[40px] text-sm"
          />
        </div>
        <button
          className="btn btn-primary !h-[40px]"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />
          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
        </button>
      </div>

      <div className="border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={dataTable}
            pagination={false}
            onChange={handleTableChange}
            rowKey="user_from_id"
            size="small"
            className="table-basic"
          />

          <div className="flex justify-end p-[12px]">
            <Pagination
              total={total}
              pageSize={params.limit}
              onChange={onChangePage}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default TransferMemberSummaryTable;
