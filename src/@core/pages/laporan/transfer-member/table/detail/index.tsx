/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Pagination, Select, Table } from 'antd';
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
import debounce from 'debounce';

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
  type ExportRow = {
    Tanggal: string;
    Tujuan: string;

    'Pengirim - Member No': string;
    'Pengirim - Role': string;
    'Pengirim - Nama': string;

    'Penerima - Member No': string;
    'Penerima - Role': string;
    'Penerima - Nama': string;

    'Berat Transfer (gr)': number;
    'Admin Weight (gr)': number;
    'Berat Diterima (gr)': number;

    'Nominal Transfer (Rp)': number;
    'Nominal Diterima (Rp)': number;

    Catatan: string;
  };
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const resp = await axiosInstance.get(url, {
        params: {
          ...params,
          offset: 0,
          limit: 5000,
        },
      });

      const rows = resp.data.results as ITransferMemberList[];
      if (!rows || rows.length === 0) return;

      /* ================= MAP DATA ================= */
      const dataToExport: ExportRow[] = rows.map((r) => ({
        Tanggal: moment(r.transfer_member_datetime).format(
          'DD MMMM YYYY HH:mm'
        ),
        Tujuan: r.purpose || '-',

        'Pengirim - Member No': r.user_from_member_number || '-',
        'Pengirim - Role': r.user_from_role_name || '-',
        'Pengirim - Nama': r.user_from_user_name || '-',

        'Penerima - Member No': r.user_to_member_number || '-',
        'Penerima - Role': r.user_to_role_name || '-',
        'Penerima - Nama': r.user_to_user_name || '-',

        'Berat Transfer (gr)': Number(r.transfer_member_gold_weight || 0),
        'Admin Weight (gr)': Number(r.transfer_member_admin_weight || 0),
        'Berat Diterima (gr)': Number(r.transfer_member_transfered_weight || 0),

        'Nominal Transfer (Rp)': Number(r.transfer_member_amount || 0),
        'Nominal Diterima (Rp)': Number(r.transfer_member_amount_received || 0),

        Catatan: r.note || '-',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Transfer Member');

      /* ================= TITLE ================= */
      worksheet.mergeCells('A1:N1');
      worksheet.getCell('A1').value = 'LAPORAN TRANSFER MEMBER';
      worksheet.getCell('A1').font = { size: 14, bold: true };

      /* ================= PERIODE ================= */
      worksheet.mergeCells('A2:N2');
      worksheet.getCell('A2').value = `Periode: ${dayjs(
        params.start_date
      ).format('DD MMMM YYYY')} s/d ${dayjs(params.end_date).format(
        'DD MMMM YYYY'
      )}`;

      worksheet.addRow([]);

      /* ================= FILTER HEADER ================= */
      const activeFilters: string[] = [];

      if (params.purpose) {
        activeFilters.push(`Tujuan: ${params.purpose}`);
      }
      if (params.user_from_role_name) {
        activeFilters.push(`Role Pengirim: ${params.user_from_role_name}`);
      }
      if (params.user_from_user_name) {
        activeFilters.push(`Nama Pengirim: ${params.user_from_user_name}`);
      }
      if (params.user_to_role_name) {
        activeFilters.push(`Role Penerima: ${params.user_to_role_name}`);
      }
      if (params.user_to_user_name) {
        activeFilters.push(`Nama Penerima: ${params.user_to_user_name}`);
      }

      if (activeFilters.length > 0) {
        worksheet.mergeCells('A4:N4');
        worksheet.getCell('A4').value = 'Filter:';
        worksheet.getCell('A4').font = { bold: true };

        activeFilters.forEach((text) => {
          const row = worksheet.addRow([`- ${text}`]);
          worksheet.mergeCells(`A${row.number}:N${row.number}`);
        });

        worksheet.addRow([]);
      }

      /* ================= HEADER TABLE ================= */
      const headerKeys = Object.keys(dataToExport[0]) as (keyof ExportRow)[];

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
        const values = headerKeys.map((key) => row[key as keyof typeof row]);
        const newRow = worksheet.addRow(values);

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

      /* ================= TOTAL ================= */
      const totalFields: (keyof ExportRow)[] = [
        'Berat Transfer (gr)',
        'Admin Weight (gr)',
        'Berat Diterima (gr)',
        'Nominal Transfer (Rp)',
        'Nominal Diterima (Rp)',
      ];

      const totals: Record<string, number> = {};
      totalFields.forEach((f) => {
        totals[f] = dataToExport.reduce((sum, r) => sum + Number(r[f] || 0), 0);
      });

      const totalRow = worksheet.addRow(
        headerKeys.map((key) =>
          key === 'Tanggal'
            ? 'TOTAL'
            : totalFields.includes(key)
            ? new Intl.NumberFormat('id-ID').format(totals[key])
            : ''
        )
      );

      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'medium' },
          bottom: { style: 'medium' },
        };
      });

      /* ================= AUTO WIDTH ================= */
      worksheet.columns.forEach((col) => {
        let max = 0;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          max = Math.max(max, String(cell.value || '').length);
        });
        col.width = Math.min(max + 2, 40);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `laporan_transfer_member_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsModalLoading(false);
    }
  };

  //handle filter

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

  const handleFilterUserFrom = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      user_from_user_name: value,
    });
  };

  const handleFilterUserTo = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      user_to_user_name: value,
    });
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
                onChange={debounce(
                  (event) => handleFilterUserFrom(event.target.value),
                  1000
                )}
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
                onChange={debounce(
                  (event) => handleFilterUserTo(event.target.value),
                  1000
                )}
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

      <div className="border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={dataTable}
            size="small"
            scroll={{ x: 1600, y: 550 }} // 👈 penting
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
