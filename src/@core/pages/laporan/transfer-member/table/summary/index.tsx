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
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
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

      const resp = await axiosInstance.get(url, {
        params: { ...params, offset: 0, limit: 1000 },
      });

      const rows = resp.data.results as ITransferMemberSummary[];
      if (!rows || rows.length === 0) return;

      /* ================= MAP DATA ================= */
      const dataToExport = rows.map((r) => ({
        Nama: r.name || '-',
        Role: r.role_name || '-',
        'Nomor Member': r.member_number || '-',
        Email: r.email || '-',
        'No HP': r.phone_number || '-',
        'Berat Transfer (gr)': Number(r.transfer_weight || 0),
        'Berat Diterima (gr)': Number(r.transfer_weight_received || 0),
        'Admin Weight (gr)': Number(r.admin_weight || 0),
        'Nominal Transfer (Rp)': Number(r.transfer_amount || 0),
        'Nominal Diterima (Rp)': Number(r.transfer_amount_received || 0),
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Summary Transfer Member');

      /* ================= TITLE ================= */
      worksheet.mergeCells('A1:J1');
      const title = worksheet.getCell('A1');
      title.value = 'LAPORAN SUMMARY TRANSFER MEMBER';
      title.font = { size: 14, bold: true };
      title.alignment = { horizontal: 'left', vertical: 'middle' };

      /* ================= PERIODE ================= */
      worksheet.mergeCells('A2:J2');
      const period = worksheet.getCell('A2');
      period.value = `Periode: ${dayjs(params.start_date).format(
        'DD MMMM YYYY'
      )} s/d ${dayjs(params.end_date).format('DD MMMM YYYY')}`;
      period.alignment = { horizontal: 'left' };

      worksheet.addRow([]);

      /* ================= HEADER ================= */
      const headerKeys = Object.keys(dataToExport[0]);
      const headerRow = worksheet.addRow(headerKeys);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEFEFEF' },
        };
      });

      /* ================= ROWS ================= */
      dataToExport.forEach((row) => {
        const rowValues = headerKeys.map((key) => row[key as keyof typeof row]);
        const newRow = worksheet.addRow(rowValues);

        newRow.eachCell((cell, colNumber) => {
          const header = headerKeys[colNumber - 1];
          const isNumeric = header.includes('(Rp)') || header.includes('(gr)');

          cell.alignment = {
            vertical: 'middle',
            horizontal: isNumeric ? 'right' : 'left',
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          if (isNumeric && typeof cell.value === 'number') {
            cell.value = new Intl.NumberFormat('id-ID').format(cell.value);
          }
        });
      });

      /* ================= SUMMARY / TOTAL ================= */
      const totalFields: (keyof (typeof dataToExport)[number])[] = [
        'Berat Transfer (gr)',
        'Berat Diterima (gr)',
        'Admin Weight (gr)',
        'Nominal Transfer (Rp)',
        'Nominal Diterima (Rp)',
      ];

      const totals: Record<string, number> = {};
      totalFields.forEach((field) => {
        totals[field] = dataToExport.reduce(
          (sum, row) => sum + Number(row[field] || 0),
          0
        );
      });

      const totalRowValues = headerKeys.map((key) => {
        if (key === 'Nama') return 'TOTAL';
        if (totalFields.includes(key as any)) {
          return new Intl.NumberFormat('id-ID').format(totals[key]);
        }
        return '';
      });

      const totalRow = worksheet.addRow(totalRowValues);

      totalRow.eachCell((cell, colNumber) => {
        const header = headerKeys[colNumber - 1];
        const isNumeric = totalFields.includes(header as any);

        cell.font = { bold: true };
        cell.alignment = {
          vertical: 'middle',
          horizontal: isNumeric ? 'right' : 'left',
        };
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'thin' },
          bottom: { style: 'medium' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9E79F' },
        };
      });

      /* ================= AUTO WIDTH ================= */
      worksheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, val.length);
        });
        col.width = Math.min(maxLength + 2, 40);
      });

      /* ================= SAVE ================= */
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `laporan_summary_transfer_member_${dayjs().format(
          'YYYYMMDD_HHmmss'
        )}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
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
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Berat Diterima (gr)',
        dataIndex: 'transfer_weight_received',
        key: 'transfer_weight_received',
        sorter: true,
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Admin Weight (gr)',
        dataIndex: 'admin_weight',
        key: 'admin_weight',
        sorter: true,
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Nominal Transfer',
        dataIndex: 'transfer_amount',
        key: 'transfer_amount',
        sorter: true,
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      {
        title: 'Nominal Diterima',
        dataIndex: 'transfer_amount_received',
        key: 'transfer_amount_received',
        sorter: true,
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
            value={rangeValue}
            onChange={onRangeChange}
          />
          <input
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border rounded px-3 h-[40px]"
          />
        </div>
        <button className="btn btn-primary" onClick={exportData}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <Table
        columns={columns}
        dataSource={dataTable}
        pagination={false}
        onChange={handleTableChange}
        rowKey="user_from_id"
        size="small"
      />

      <div className="flex justify-end mt-3">
        <Pagination
          total={total}
          pageSize={params.limit}
          onChange={onChangePage}
          showSizeChanger={false}
        />
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default TransferMemberSummaryTable;
