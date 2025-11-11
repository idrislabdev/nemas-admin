'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldLoan } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
moment.locale('id');

const { RangePicker } = DatePicker;

const PinjamanEmasTablePage = () => {
  const url = `/reports/gold-loan/list`;
  const [dataTable, setDataTable] = useState<Array<IGoldLoan>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // 🟢 Default tanggal: awal bulan hingga hari ini
  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '',
  });

  const [searchText, setSearchText] = useState('');

  // 🔍 Debounce pencarian
  useEffect(() => {
    const delay = setTimeout(() => {
      setParams((prev) => ({ ...prev, offset: 0, search: searchText }));
    }, 500);
    return () => clearTimeout(delay);
  }, [searchText]);

  const columns: ColumnsType<IGoldLoan> = [
    {
      title: 'No. Pinjaman',
      dataIndex: 'loan_ref_number',
      key: 'loan_ref_number',
      width: 160,
      fixed: 'left',
    },
    {
      title: 'Tanggal Pinjaman',
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
      title: 'Jumlah Pinjaman',
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
      title: 'Total Pinjaman',
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

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

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
        'No. Pinjaman': item.loan_ref_number || '-',
        'Tanggal Pinjaman': moment(item.loan_date_time).format(
          'DD MMMM YYYY HH:mm'
        ),
        User: item.user_name || '-',
        'Berat Emas (Gram)': Number(item.loan_gold_wgt || 0),
        'Harga Jual Emas (Rp)': Number(item.loan_gold_price_sell || 0),
        'Jumlah Pinjaman (Rp)': Number(item.loan_amt || 0),
        'Biaya Admin (Rp)': Number(item.loan_cost_admin || 0),
        'Biaya Transfer (Rp)': Number(item.loan_cost_transfer || 0),
        'Total Pinjaman (Rp)': Number(item.loan_total_amt || 0),
        'Jumlah Transfer (Rp)': Number(item.loan_transfer_amount || 0),
        'Tanggal Jatuh Tempo': moment(item.loan_due_date).format(
          'DD MMMM YYYY'
        ),
        Status: item.loan_status_name || '-',
        Catatan: item.loan_note || '-',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Pinjaman Emas');

      // === Judul ===
      worksheet.mergeCells('A1:M1');
      const title = worksheet.getCell('A1');
      title.value = 'LAPORAN PINJAMAN EMAS';
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
        'Jumlah Pinjaman (Rp)',
        'Biaya Admin (Rp)',
        'Biaya Transfer (Rp)',
        'Total Pinjaman (Rp)',
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
      const fileName = `laporan_pinjaman_emas_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
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
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            value={[defaultStart, defaultEnd]}
          />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-[40px] w-[250px] pl-9 pr-3 border rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
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
          className="table-basic"
          rowKey="id"
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

export default PinjamanEmasTablePage;
