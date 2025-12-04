/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { IGoldLoan } from '@/@core/@types/interface';
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
  const queryStatus = searchParams.get('loan_status_name') || '';
  const queryPage = Number(searchParams.get('page') || 1);

  const defaultStart = queryStart
    ? dayjs(queryStart)
    : dayjs().startOf('month');
  const defaultEnd = queryEnd ? dayjs(queryEnd) : dayjs();

  const [filterStatus, setFilterStatus] = useState(queryStatus);

  const [params, setParams] = useState({
    format: 'json',
    offset: (queryPage - 1) * 10,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    loan_status_name: queryStatus,
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

      const rows = await fetchAllData(url, params);
      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const dataToExport = rows.map((item: IGoldLoan) => ({
        'No. Gadai': item.loan_ref_number || '-',
        'Tanggal Gadai': moment(item.loan_date_time).format(
          'DD MMMM YYYY HH:mm'
        ),
        User: item.user_name || '-',
        'Berat Emas (Gram)': Number(item.loan_gold_wgt || 0),
        'Harga Jual Emas (Rp)': Number(item.loan_gold_price_sell || 0),
        'Jumlah Gadai (Gram)': Number(item.loan_amt || 0),
        'Biaya Admin (Rp)': Number(item.loan_cost_admin || 0),
        'Biaya Transfer (Rp)': Number(item.loan_cost_transfer || 0),
        'Total Nilai Aktif (Rp)': Number(item.loan_total_amt || 0),
        'Jumlah Transfer (Rp)': Number(item.loan_transfer_amount || 0),
        'Tanggal Jatuh Tempo': moment(item.loan_due_date).format(
          'DD MMMM YYYY'
        ),
        Status: item.loan_status_name || '-',
        Catatan: item.loan_note || '-',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Gadai Emas');

      // === Judul ===
      worksheet.mergeCells('A1:M1');
      const title = worksheet.getCell('A1');
      title.value = 'LAPORAN GADAI EMAS';
      title.font = { size: 14, bold: true };
      title.alignment = { horizontal: 'left', vertical: 'middle' };

      // === Periode ===
      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A2:M2');
        const period = worksheet.getCell('A2');
        period.value = `Periode: ${dayjs(params.start_date).format(
          'DD-MM-YYYY'
        )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;
        period.alignment = { horizontal: 'left' };
      }

      worksheet.addRow([]);

      // === Header Tabel ===
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

      // === Baris Data ===
      dataToExport.forEach((row) => {
        const rowValues = headerKeys.map((key) => row[key as keyof typeof row]);
        const newRow = worksheet.addRow(rowValues);

        newRow.eachCell((cell, colNumber) => {
          const header = headerKeys[colNumber - 1];
          const isNumeric =
            header.includes('(Rp)') || header.includes('(Gram)');
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

      // === Hitung Total ===
      const totalFields: (keyof (typeof dataToExport)[number])[] = [
        'Berat Emas (Gram)',
        'Harga Jual Emas (Rp)',
        'Jumlah Gadai (Gram)',
        'Biaya Admin (Rp)',
        'Biaya Transfer (Rp)',
        'Total Nilai Aktif (Rp)',
        'Jumlah Transfer (Rp)',
      ];

      const totals: Record<string, number> = {};
      totalFields.forEach((field) => {
        totals[field] = dataToExport.reduce(
          (sum, row) => sum + ((row[field] as number) || 0),
          0
        );
      });

      const totalRowValues = headerKeys.map((key) => {
        if (key === 'No. Pinjaman') return 'TOTAL';
        if (totalFields.includes(key as any)) {
          return new Intl.NumberFormat('id-ID').format(totals[key]);
        }
        return '';
      });

      const totalRow = worksheet.addRow(totalRowValues);
      totalRow.eachCell((cell, colNumber) => {
        const header: any = headerKeys[colNumber - 1];
        const isNumeric = totalFields.includes(header);
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

      // === Lebar Kolom Otomatis ===
      worksheet.columns.forEach((col) => {
        if (!col) return; // pastikan col tidak undefined
        let maxLength = 0;

        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, val.length);
        });

        col.width = Math.min(maxLength + 2, 40);
      });

      // === Simpan File ===
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
      render: (_, record) =>
        record.loan_amt ? `Rp${formatDecimal(record.loan_amt)}` : '-',
    },
    {
      title: 'Biaya Admin',
      dataIndex: 'loan_cost_admin',
      key: 'loan_cost_admin',
      width: 150,
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
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          {/* FILTER DATE RANGE */}
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            value={
              params.start_date && params.end_date
                ? [dayjs(params.start_date), dayjs(params.end_date)]
                : null
            }
          />

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
              { value: 'paid', label: 'Paid' },
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending' },
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
