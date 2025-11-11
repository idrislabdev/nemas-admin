'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ISalesOrder } from '@/@core/@types/interface';
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

const PenjualanEmasFisikPage = () => {
  const url = `/reports/gold-sales-order/list`;
  const [dataTable, setDataTable] = useState<Array<ISalesOrder>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 📅 Default tanggal: tanggal 1 bulan aktif - hari ini
  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart,
    end_date: defaultEnd,
    search: '',
  });

  // 🔎 Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setParams((prev) => ({ ...prev, offset: 0, search: debouncedSearch }));
  }, [debouncedSearch]);

  const columns: ColumnsType<ISalesOrder> = [
    {
      title: 'Nomor Order',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 150,
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'order_timestamp',
      key: 'order_timestamp',
      width: 180,
      render: (_, record) =>
        moment(record.order_timestamp).format('DD MMMM YYYY HH:mm'),
    },
    { title: 'User', dataIndex: 'user_name', key: 'user_name', width: 150 },
    {
      title: 'Berat Emas',
      dataIndex: 'order_item_weight',
      key: 'order_item_weight',
      width: 150,
      render: (_, record) =>
        record.order_item_weight
          ? `${formatDecimal(
              parseFloat(record.order_item_weight.toString())
            )} Gram`
          : '-',
    },
    {
      title: 'Nominal Pesanan',
      dataIndex: 'order_amount',
      key: 'order_amount',
      width: 150,
      render: (_, record) =>
        record.order_amount
          ? `Rp${formatDecimal(parseFloat(record.order_amount.toString()))}`
          : '-',
    },
    {
      title: 'Total Harga',
      dataIndex: 'order_total_price',
      key: 'order_total_price',
      width: 150,
      render: (_, record) =>
        record.order_total_price
          ? `Rp${formatDecimal(
              parseFloat(record.order_total_price.toString())
            )}`
          : '-',
    },
    {
      title: 'Biaya Admin',
      dataIndex: 'order_admin_amount',
      key: 'order_admin_amount',
      width: 150,
      render: (_, record) =>
        record.order_admin_amount
          ? `Rp${formatDecimal(
              parseFloat(record.order_admin_amount.toString())
            )}`
          : '-',
    },
    {
      title: 'Biaya Asuransi',
      dataIndex: 'order_tracking_insurance_total_round',
      key: 'order_tracking_insurance_total_round',
      width: 150,
      render: (_, record) =>
        record.order_tracking_insurance_total_round
          ? `Rp${formatDecimal(
              parseFloat(record.order_tracking_insurance_total_round.toString())
            )}`
          : '-',
    },
    {
      title: 'Biaya Pengiriman',
      dataIndex: 'order_tracking_total_amount_round',
      key: 'order_tracking_total_amount_round',
      width: 150,
      render: (_, record) =>
        record.order_tracking_total_amount_round
          ? `Rp${formatDecimal(
              parseFloat(record.order_tracking_total_amount_round.toString())
            )}`
          : '-',
    },
    {
      title: 'Grand Total',
      dataIndex: 'order_grand_total_price',
      key: 'order_grand_total_price',
      width: 150,
      render: (_, record) =>
        record.order_grand_total_price
          ? `Rp${formatDecimal(
              parseFloat(record.order_grand_total_price.toString())
            )}`
          : '-',
    },
    {
      title: 'Status Pesanan',
      dataIndex: 'order_status',
      key: 'order_status',
      width: 150,
      fixed: 'right',
    },
    {
      title: 'Status Pembayaran',
      dataIndex: 'order_gold_payment_status',
      key: 'order_gold_payment_status',
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
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset: i * limit },
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

      const dataToExport = rows.map((item: ISalesOrder) => ({
        'Nomor Order': item.order_number || '-',
        'Tanggal Order': moment(item.order_timestamp).format('DD MMMM YYYY'),
        User: item.user_name || '-',
        'Berat Emas (Gram)': Number(item.order_item_weight || 0),
        'Nominal Pesanan (Rp)': Number(item.order_amount || 0),
        'Total Harga (Rp)': Number(item.order_total_price || 0),
        'Biaya Admin (Rp)': Number(item.order_admin_amount || 0),
        'Biaya Asuransi (Rp)': Number(
          item.order_tracking_insurance_total_round || 0
        ),
        'Biaya Pengiriman (Rp)': Number(
          item.order_tracking_total_amount_round || 0
        ),
        'Grand Total (Rp)': Number(item.order_grand_total_price || 0),
        'Status Pesanan': item.order_status || '-',
        'Status Pembayaran': item.order_gold_payment_status || '-',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Penjualan Emas Fisik');

      // === Header Title ===
      worksheet.mergeCells('A1:L1');
      const title = worksheet.getCell('A1');
      title.value = 'LAPORAN PENJUALAN EMAS FISIK';
      title.font = { size: 14, bold: true };
      title.alignment = { horizontal: 'left', vertical: 'middle' };

      // === Periode ===
      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A2:L2');
        const period = worksheet.getCell('A2');
        period.value = `Periode: ${dayjs(params.start_date).format(
          'DD-MM-YYYY'
        )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;
        period.alignment = { horizontal: 'left' };
      }

      worksheet.addRow([]);

      // === Table Header ===
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

      // === Table Rows ===
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
            // Format number sebagai string dengan pemisah ribuan
            cell.value = new Intl.NumberFormat('id-ID').format(cell.value);
          }
        });
      });

      // === Hitung Total di akhir ===
      // === Hitung Total di akhir ===
      const totalFields: (keyof (typeof dataToExport)[number])[] = [
        'Berat Emas (Gram)',
        'Nominal Pesanan (Rp)',
        'Total Harga (Rp)',
        'Biaya Admin (Rp)',
        'Biaya Asuransi (Rp)',
        'Biaya Pengiriman (Rp)',
        'Grand Total (Rp)',
      ];

      const totals: Record<string, number> = {};

      totalFields.forEach((field) => {
        totals[field] = dataToExport.reduce(
          (sum, row) => sum + (Number(row[field]) || 0),
          0
        );
      });

      const totalRowValues = headerKeys.map((key) => {
        if (key === 'Nomor Order') return 'TOTAL';
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
          fgColor: { argb: 'FFF9E79F' }, // Kuning lembut untuk total
        };
      });

      // === Auto Width Columns ===
      worksheet.columns.forEach((col) => {
        if (!col) return; // pastikan col tidak undefined
        let maxLength = 0;

        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, val.length);
        });

        col.width = Math.min(maxLength + 2, 40);
      });

      // === Save File ===
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_penjualan_emas_fisik_${dayjs().format(
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
          />
          <input
            type="text"
            placeholder="Cari..."
            className="pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md w-[200px] focus:outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn !h-[40px] btn-primary" onClick={exportData}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] mt-3">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="order_gold_id"
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

export default PenjualanEmasFisikPage;
