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

moment.locale('id');
const { RangePicker } = DatePicker;

export interface ITransferMemberList {
  __row_id: string;
  gold_transfer_id: string;
  phone_number: string;
  transfer_member_gold_weight: number;
  transfer_member_admin_weight: number;
  transfer_member_admin_percentage: number;
  transfer_member_transfered_weight: number;
  transfer_ref_number: string;
  transfer_member_notes: string;
  transfer_member_service_option: string;
  transfer_member_amount_received: number;
  transfer_member_admin_amount: number;
  transfer_member_datetime: string;
}

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

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    order_by: 'transfer_member_datetime',
    order_direction: 'DESC',
    search: '',
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
  }, [params]);

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

      const resp = await axiosInstance.get(url, {
        params: { ...params, offset: 0, limit: 1000 },
      });

      const rows = resp.data.results as ITransferMemberList[];
      if (!rows || rows.length === 0) return;

      /* ================= MAP DATA ================= */
      const dataToExport = rows.map((r) => ({
        Tanggal: moment(r.transfer_member_datetime).format(
          'DD MMMM YYYY HH:mm'
        ),
        'No Referensi': r.transfer_ref_number || '-',
        'No HP': r.phone_number || '-',
        'Berat Transfer (gr)': Number(r.transfer_member_gold_weight || 0),
        'Admin Weight (gr)': Number(r.transfer_member_admin_weight || 0),
        'Admin (%)': Number(r.transfer_member_admin_percentage || 0),
        'Berat Diterima (gr)': Number(r.transfer_member_transfered_weight || 0),
        'Nominal Diterima (Rp)': Number(r.transfer_member_amount_received || 0),
        'Admin Amount (Rp)': Number(r.transfer_member_admin_amount || 0),
        Layanan: r.transfer_member_service_option || '-',
        Catatan: r.transfer_member_notes || '-',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Transfer Member List');

      /* ================= TITLE ================= */
      worksheet.mergeCells('A1:K1');
      const title = worksheet.getCell('A1');
      title.value = 'LAPORAN TRANSFER MEMBER';
      title.font = { size: 14, bold: true };
      title.alignment = { horizontal: 'left', vertical: 'middle' };

      /* ================= PERIODE ================= */
      worksheet.mergeCells('A2:K2');
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
          const isNumeric =
            header.includes('(Rp)') ||
            header.includes('(gr)') ||
            header.includes('(%)');

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
        'Admin Weight (gr)',
        'Berat Diterima (gr)',
        'Nominal Diterima (Rp)',
        'Admin Amount (Rp)',
      ];

      const totals: Record<string, number> = {};
      totalFields.forEach((field) => {
        totals[field] = dataToExport.reduce(
          (sum, row) => sum + Number(row[field] || 0),
          0
        );
      });

      const totalRowValues = headerKeys.map((key) => {
        if (key === 'Tanggal') return 'TOTAL';
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
          fgColor: { argb: 'FFF9E79F' }, // kuning lembut
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
        `laporan_transfer_member_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<ITransferMemberList> = useMemo(
    () => [
      {
        title: 'Tanggal',
        dataIndex: 'transfer_member_datetime',
        key: 'transfer_member_datetime',
        sorter: true,
        render: (v) => moment(v).format('DD MMM YYYY HH:mm'),
      },
      {
        title: 'No Referensi',
        dataIndex: 'transfer_ref_number',
        key: 'transfer_ref_number',
        sorter: true,
      },
      {
        title: 'No HP',
        dataIndex: 'phone_number',
        key: 'phone_number',
        sorter: true,
      },
      {
        title: 'Berat Transfer (gr)',
        dataIndex: 'transfer_member_gold_weight',
        key: 'transfer_member_gold_weight',
        sorter: true,
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Admin Weight (gr)',
        dataIndex: 'transfer_member_admin_weight',
        key: 'transfer_member_admin_weight',
        sorter: true,
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Admin (%)',
        dataIndex: 'transfer_member_admin_percentage',
        key: 'transfer_member_admin_percentage',
        sorter: true,
        render: (v) => `${v}%`,
      },
      {
        title: 'Berat Diterima (gr)',
        dataIndex: 'transfer_member_transfered_weight',
        key: 'transfer_member_transfered_weight',
        sorter: true,
        render: (v) => formatDecimal(v),
      },
      {
        title: 'Nominal Diterima',
        dataIndex: 'transfer_member_amount_received',
        key: 'transfer_member_amount_received',
        sorter: true,
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      {
        title: 'Admin Amount',
        dataIndex: 'transfer_member_admin_amount',
        key: 'transfer_member_admin_amount',
        sorter: true,
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      {
        title: 'Layanan',
        dataIndex: 'transfer_member_service_option',
        key: 'transfer_member_service_option',
        sorter: true,
      },
      {
        title: 'Catatan',
        dataIndex: 'transfer_member_notes',
        key: 'transfer_member_notes',
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
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            value={dateRange}
          />
          <input
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm"
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

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          onChange={handleTableChange}
          rowKey="__row_id"
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

export default TransferMemberListTable;
