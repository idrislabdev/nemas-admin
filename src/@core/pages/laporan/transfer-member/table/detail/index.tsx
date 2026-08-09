/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Pagination, Select, Table, message } from 'antd';
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
import debounce from 'lodash/debounce';
import { IUser } from '@/@core/@types/interface';

moment.locale('id');
const { RangePicker } = DatePicker;

export interface ITransferMemberList {
  __row_id: string;

  transfer_member_datetime: string;

  purpose: string;
  note: string;

  user_from_member_number: string;
  user_from_role_name: string;
  user_from_user_name: string;
  user_from_email: string;
  user_from_phone_number: string | null;

  user_to_member_number: string;
  user_to_role_name: string;
  user_to_user_name: string;
  user_to_email: string;
  user_to_phone_number: string | null;

  transfer_member_gold_weight: number;
  transfer_member_transfered_weight: number;
  transfer_member_admin_weight: number;

  transfer_member_amount: number;
  transfer_member_amount_received: number;
}

// Helper untuk konversi index angka ke huruf kolom Excel (e.g., 1 -> A, 27 -> AA)
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

const TransferMemberListTable = () => {
  const url = `/reports/transfer-member/list`;

  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();

  const [dataTable, setDataTable] = useState<ITransferMemberList[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    defaultStart,
    defaultEnd,
  ]);
  const [searchText, setSearchText] = useState('');
  const [filterPurpose, setPurpose] = useState('');
  const [filterRoleFrom, setFilterRoleFrom] = useState('');
  const [filterRoleTo, setFilterRoleTo] = useState('');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    order_by: 'transfer_member_datetime',
    order_direction: 'DESC',
    search: '',
    purpose: '',
    user_from_role_name: '',
    user_from_user_name: '',
    user_to_role_name: '',
    user_to_user_name: '',
  });

  /* ================= FETCH ================= */
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });

      const results = (resp.data.results || []).map(
        (item: ITransferMemberList, index: number) => ({
          ...item,
          __row_id: `${Date.now()}-${index}-${Math.random()
            .toString(36)
            .slice(2, 9)}`,
        })
      );

      setDataTable(results);
      setTotal(resp.data.count || 0);
    } catch (err) {
      console.error(err);
    }
  }, [params, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= SEARCH DEBOUNCE ================= */
  useEffect(() => {
    const t = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchText, offset: 0 }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchText]);

  /* ================= DATE FILTER ================= */
  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (!dates || !dates[0] || !dates[1]) return;
    setDateRange([dates[0], dates[1]]);
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
        params: {
          ...params,
          offset: 0,
          limit: 5000,
        },
      });

      const rows = (resp.data?.results || []) as ITransferMemberList[];
      if (!rows.length) {
        message.warning('Tidak ada data untuk diexport');
        return;
      }

      /* ================= MAP DATA ================= */
      const dataToExport = rows.map((r) => ({
        Tanggal:
          r.transfer_member_datetime &&
          dayjs(r.transfer_member_datetime).isValid()
            ? dayjs(r.transfer_member_datetime).format('DD MMMM YYYY HH:mm')
            : '-',
        Tujuan: r.purpose || '-',

        'Pengirim - Member No': r.user_from_member_number || '-',
        'Pengirim - Role': r.user_from_role_name || '-',
        'Pengirim - Nama': r.user_from_user_name || '-',

        'Penerima - Member No': r.user_to_member_number || '-',
        'Penerima - Role': r.user_to_role_name || '-',
        'Penerima - Nama': r.user_to_user_name || '-',

        'Berat Transfer (gr)': Number(r.transfer_member_gold_weight) || 0,
        'Admin Weight (gr)': Number(r.transfer_member_admin_weight) || 0,
        'Berat Diterima (gr)': Number(r.transfer_member_transfered_weight) || 0,

        'Nominal Transfer (Rp)': Number(r.transfer_member_amount) || 0,
        'Nominal Diterima (Rp)': Number(r.transfer_member_amount_received) || 0,

        Catatan: r.note || '-',
      }));

      type ExportRow = (typeof dataToExport)[number];

      /* ================= EXCEL WORKBOOK ================= */
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Transfer Member');

      const totalColumns = Object.keys(dataToExport[0]).length;
      const lastColumnLetter = getExcelColumnLabel(totalColumns);

      /* ================= METADATA HEADER ================= */
      const formattedStartDate =
        params.start_date && dayjs(params.start_date).isValid()
          ? dayjs(params.start_date).format('DD MMMM YYYY')
          : '-';
      const formattedEndDate =
        params.end_date && dayjs(params.end_date).isValid()
          ? dayjs(params.end_date).format('DD MMMM YYYY')
          : '-';

      const metadata = [
        { cell: 'A1', val: 'LAPORAN TRANSFER MEMBER', bold: true, size: 14 },
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

      worksheet.addRow([]); // Blank Row

      /* ================= ACTIVE FILTERS INFO ================= */
      const activeFilters: string[] = [];
      if (params.purpose) activeFilters.push(`Tujuan: ${params.purpose}`);
      if (params.user_from_role_name)
        activeFilters.push(`Role Pengirim: ${params.user_from_role_name}`);
      if (params.user_from_user_name)
        activeFilters.push(`Nama Pengirim: ${params.user_from_user_name}`);
      if (params.user_to_role_name)
        activeFilters.push(`Role Penerima: ${params.user_to_role_name}`);
      if (params.user_to_user_name)
        activeFilters.push(`Nama Penerima: ${params.user_to_user_name}`);

      if (activeFilters.length > 0) {
        const filterTitleRow = worksheet.addRow(['Filter Aktif:']);
        filterTitleRow.font = { name: 'Calibri', bold: true, size: 10 };
        worksheet.mergeCells(
          `A${filterTitleRow.number}:${lastColumnLetter}${filterTitleRow.number}`
        );

        activeFilters.forEach((text) => {
          const filterRow = worksheet.addRow([`- ${text}`]);
          filterRow.font = { name: 'Calibri', size: 10, italic: true };
          worksheet.mergeCells(
            `A${filterRow.number}:${lastColumnLetter}${filterRow.number}`
          );
        });

        worksheet.addRow([]); // Blank Row
      }

      /* ================= TABLE HEADER ================= */
      const headerKeys = Object.keys(dataToExport[0]) as (keyof ExportRow)[];
      const headerRow = worksheet.addRow(headerKeys);
      const headerRowIndex = headerRow.number;
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
      const dataStartRow = headerRowIndex + 1;

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
        | 'Admin Weight (gr)'
        | 'Berat Diterima (gr)'
        | 'Nominal Transfer (Rp)'
        | 'Nominal Diterima (Rp)';

      const totalFields: NumericExportKey[] = [
        'Berat Transfer (gr)',
        'Admin Weight (gr)',
        'Berat Diterima (gr)',
        'Nominal Transfer (Rp)',
        'Nominal Diterima (Rp)',
      ];

      const totalRowValues = headerKeys.map((key, colIdx) => {
        if (key === 'Tanggal') return 'TOTAL';
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
          // Abaikan baris metadata/filter di atas header agar kolom tidak melar berlebihan
          if (rowNumber < headerRowIndex) return;

          let strVal = '';
          if (
            cell.value &&
            typeof cell.value === 'object' &&
            'formula' in cell.value
          ) {
            strVal = '123,456,789.00'; // Fallback estimasi panjang angka hasil SUM
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
        `laporan_transfer_member_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
      message.error('Gagal mengunduh laporan Excel');
    } finally {
      setIsModalLoading(false);
    }
  };

  /* ================= HANDLERS FILTER ================= */
  const handlePurposeChange = (value: string) => {
    setPurpose(value);
    setParams((prev) => ({
      ...prev,
      purpose: value,
      offset: 0,
    }));
  };

  const handleFilterRoleFrom = (value: string) => {
    setFilterRoleFrom(value);
    setParams((prev) => ({
      ...prev,
      user_from_role_name: value,
      offset: 0,
    }));
  };

  const handleFilterRoleTo = (value: string) => {
    setFilterRoleTo(value);
    setParams((prev) => ({
      ...prev,
      user_to_role_name: value,
      offset: 0,
    }));
  };

  // Debounced input handler menggunakan useCallback agar fungsi stabil
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetUserFrom = useCallback(
    debounce((value: string) => {
      setParams((prev) => ({
        ...prev,
        user_from_user_name: value,
        offset: 0,
      }));
    }, 800),
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetUserTo = useCallback(
    debounce((value: string) => {
      setParams((prev) => ({
        ...prev,
        user_to_user_name: value,
        offset: 0,
      }));
    }, 800),
    []
  );

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<ITransferMemberList> = useMemo(
    () => [
      {
        title: 'Tanggal',
        dataIndex: 'transfer_member_datetime',
        key: 'transfer_member_datetime',
        sorter: true,
        render: (v) => (v ? moment(v).format('DD MMM YYYY HH:mm') : '-'),
      },
      {
        title: 'Tujuan',
        dataIndex: 'purpose',
        key: 'purpose',
        sorter: true,
      },
      {
        title: 'Pengirim',
        children: [
          {
            title: 'Member No',
            dataIndex: 'user_from_member_number',
            key: 'user_from_member_number',
          },
          {
            title: 'Role',
            dataIndex: 'user_from_role_name',
            key: 'user_from_role_name',
          },
          {
            title: 'Nama',
            dataIndex: 'user_from_user_name',
            key: 'user_from_user_name',
          },
        ],
      },
      {
        title: 'Penerima',
        children: [
          {
            title: 'Member No',
            dataIndex: 'user_to_member_number',
            key: 'user_to_member_number',
          },
          {
            title: 'Role',
            dataIndex: 'user_to_role_name',
            key: 'user_to_role_name',
          },
          {
            title: 'Nama',
            dataIndex: 'user_to_user_name',
            key: 'user_to_user_name',
          },
        ],
      },
      {
        title: 'Berat Transfer (gr)',
        dataIndex: 'transfer_member_gold_weight',
        key: 'transfer_member_gold_weight',
        sorter: true,
        align: 'right',
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Admin Weight (gr)',
        dataIndex: 'transfer_member_admin_weight',
        key: 'transfer_member_admin_weight',
        sorter: true,
        align: 'right',
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Berat Diterima (gr)',
        dataIndex: 'transfer_member_transfered_weight',
        key: 'transfer_member_transfered_weight',
        sorter: true,
        align: 'right',
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Nominal Transfer',
        dataIndex: 'transfer_member_amount',
        key: 'transfer_member_amount',
        sorter: true,
        align: 'right',
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      {
        title: 'Nominal Diterima',
        dataIndex: 'transfer_member_amount_received',
        key: 'transfer_member_amount_received',
        sorter: true,
        align: 'right',
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      {
        title: 'Catatan',
        dataIndex: 'note',
        key: 'note',
      },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <RangePicker
              size="small"
              className="w-[320px] h-[40px]"
              onChange={onRangeChange}
              value={dateRange}
            />
            <input
              placeholder="Cari data..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm"
            />
            <Select
              allowClear
              size="large"
              className="w-[148px] select-sm"
              placeholder="Semua tujuan"
              value={filterPurpose || undefined}
              onChange={handlePurposeChange}
              options={[
                { value: '', label: 'Semua Tujuan' },
                { value: 'Retur', label: 'Return' },
                { value: 'Transfer', label: 'Transfer' },
              ]}
            />
          </div>
          <div className="flex items-center gap-[40px]">
            <div className="flex items-center gap-2">
              <label className="w-[100px]">Tipe Pengirim</label>
              <Select
                allowClear
                size="large"
                className="w-[200px] select-sm"
                placeholder="Semua"
                value={filterRoleFrom || undefined}
                onChange={handleFilterRoleFrom}
                options={[
                  { value: '', label: 'Semua' },
                  { value: 'Admin', label: 'Admin' },
                  { value: 'Toko', label: 'Toko' },
                  { value: 'User', label: 'User' },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-[100px]">Nama Pengirim</label>
              <input
                type="text"
                className="border rounded px-3 w-[220px] h-[40px] !font-normal"
                placeholder="cari data"
                onChange={(e) => debouncedSetUserFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-[40px]">
            <div className="flex items-center gap-2">
              <label className="w-[100px]">Tipe Penerima</label>
              <Select
                allowClear
                size="large"
                className="w-[200px] select-sm"
                placeholder="Semua"
                value={filterRoleTo || undefined}
                onChange={handleFilterRoleTo}
                options={[
                  { value: '', label: 'Semua' },
                  { value: 'Admin', label: 'Admin' },
                  { value: 'Toko', label: 'Toko' },
                  { value: 'User', label: 'User' },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-[100px]">Nama Penerima</label>
              <input
                type="text"
                className="border rounded px-3 w-[220px] h-[40px] !font-normal"
                placeholder="cari data"
                onChange={(e) => debouncedSetUserTo(e.target.value)}
              />
            </div>
          </div>
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

      <div className=" rounded-tr-[8px] rounded-tl-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={dataTable}
            size="small"
            scroll={{ x: 1600, y: 550 }}
            pagination={false}
            onChange={handleTableChange}
            rowKey="__row_id"
            className="table-basic"
          />
        </div>

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

export default TransferMemberListTable;
