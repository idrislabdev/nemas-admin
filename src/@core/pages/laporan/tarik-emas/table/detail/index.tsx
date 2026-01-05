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

/* ================= INTERFACE ================= */
export interface IGoldRedeemReport {
  order_timestamp: string;
  order_number: string;
  name: string;
  gold_type: string;
  gold_brand: string;
  cert_code: string;
  weight: number;
  gold_price: number;
  cert_price: number;
  order_price: number;
  order_payment_method_name: string;
  order_payment_va_bank: string;
  order_payment_number: string;
  order_gold_payment_status: string;
  tracking_number: string;
  delivery_pickup_date: string;
  tracking_courier_name: string;
  delivery_status: string;
}

/* ================= EXPORT TYPES ================= */
type ExportRow = {
  'Tanggal Order': string;
  'No Order': string;
  Nama: string;
  'Jenis Emas': string;
  Brand: string;
  'Kode Sertifikat': string;
  'Berat (gr)': number;
  'Harga Emas (Rp)': number;
  'Harga Sertifikat (Rp)': number;
  'Total Order (Rp)': number;
  'Metode Pembayaran': string;
  'No Pembayaran': string;
  'Status Pembayaran': string;
  Kurir: string;
  'No Resi': string;
  'Status Pengiriman': string;
};

const TarikEmasListTable = () => {
  const url = '/reports/gold-redeem/list';

  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<IGoldRedeemReport[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    order_by: 'order_price',
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

      const rows = resp.data.results as IGoldRedeemReport[];
      if (!rows.length) return;

      /* ================= MAP DATA ================= */
      const dataToExport: ExportRow[] = rows.map((r) => ({
        'Tanggal Order': moment(r.order_timestamp).format('DD MMMM YYYY HH:mm'),
        'No Order': r.order_number,
        Nama: r.name,
        'Jenis Emas': r.gold_type,
        Brand: r.gold_brand,
        'Kode Sertifikat': r.cert_code,
        'Berat (gr)': r.weight ?? 0,
        'Harga Emas (Rp)': r.gold_price ?? 0,
        'Harga Sertifikat (Rp)': r.cert_price ?? 0,
        'Total Order (Rp)': r.order_price ?? 0,
        'Metode Pembayaran': r.order_payment_method_name,
        'No Pembayaran': r.order_payment_number,
        'Status Pembayaran': r.order_gold_payment_status,
        Kurir: r.tracking_courier_name,
        'No Resi': r.tracking_number,
        'Status Pengiriman': r.delivery_status,
      }));

      /* ================= EXCEL ================= */
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Tarik Emas Detail');

      worksheet.mergeCells('A1:P1');
      worksheet.getCell('A1').value = 'LAPORAN TARIK EMAS DETAIL';
      worksheet.getCell('A1').font = {
        bold: true,
        size: 14,
      };

      worksheet.mergeCells('A2:P2');
      worksheet.getCell('A2').value = `Periode: ${dayjs(
        params.start_date
      ).format('DD MMMM YYYY')} s/d ${dayjs(params.end_date).format(
        'DD MMMM YYYY'
      )}`;

      worksheet.addRow([]);

      /* ================= HEADER ================= */
      const headerKeys = Object.keys(dataToExport[0]) as (keyof ExportRow)[];

      const headerRow = worksheet.addRow(headerKeys);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
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

      /* ================= DATA ROW ================= */
      dataToExport.forEach((row) => {
        const newRow = worksheet.addRow(headerKeys.map((key) => row[key]));

        newRow.eachCell((cell, col) => {
          const header = headerKeys[col - 1] as string;
          const isNumeric = header.includes('(Rp)') || header.includes('(gr)');

          cell.alignment = {
            horizontal: isNumeric ? 'right' : 'left',
          };

          if (isNumeric && typeof cell.value === 'number') {
            cell.value = new Intl.NumberFormat('id-ID').format(cell.value);
          }

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      /* ================= TOTAL ================= */
      type NumericExportKey =
        | 'Berat (gr)'
        | 'Harga Emas (Rp)'
        | 'Harga Sertifikat (Rp)'
        | 'Total Order (Rp)';

      const totalFields: NumericExportKey[] = [
        'Berat (gr)',
        'Harga Emas (Rp)',
        'Harga Sertifikat (Rp)',
        'Total Order (Rp)',
      ];

      const totals: Record<NumericExportKey, number> = {
        'Berat (gr)': 0,
        'Harga Emas (Rp)': 0,
        'Harga Sertifikat (Rp)': 0,
        'Total Order (Rp)': 0,
      };

      totalFields.forEach((field) => {
        totals[field] = dataToExport.reduce(
          (sum, row) => sum + Number(row[field]),
          0
        );
      });

      const totalRow = worksheet.addRow(
        headerKeys.map((key) => {
          if (key === 'Tanggal Order') return 'TOTAL';

          if (totalFields.includes(key as NumericExportKey)) {
            return new Intl.NumberFormat('id-ID').format(
              totals[key as NumericExportKey]
            );
          }

          return '';
        })
      );

      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9E79F' },
        };
      });

      /* ================= COLUMN WIDTH ================= */
      worksheet.columns.forEach((col) => {
        let max = 0;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          max = Math.max(max, cell.value?.toString().length || 0);
        });
        col.width = Math.min(max + 2, 40);
      });

      /* ================= SAVE ================= */
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `laporan_tarik_emas_detail_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsModalLoading(false);
    }
  };

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<IGoldRedeemReport> = useMemo(
    () => [
      {
        title: 'Tanggal Order',
        dataIndex: 'order_timestamp',
        render: (v) => moment(v).format('DD MMM YYYY HH:mm'),
        width: 200,
      },
      { title: 'No Order', dataIndex: 'order_number' },
      { title: 'Nama', dataIndex: 'name' },
      { title: 'Jenis Emas', dataIndex: 'gold_type' },
      { title: 'Brand', dataIndex: 'gold_brand' },
      { title: 'Kode Sertifikat', dataIndex: 'cert_code' },
      {
        title: 'Berat (gr)',
        dataIndex: 'weight',
        render: formatDecimal,
      },
      {
        title: 'Harga Emas',
        dataIndex: 'gold_price',
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      {
        title: 'Harga Sertifikat',
        dataIndex: 'cert_price',
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      {
        title: 'Total Order',
        dataIndex: 'order_price',
        render: (v) => `Rp${formatDecimal(v)}`,
      },
      { title: 'Metode Bayar', dataIndex: 'order_payment_method_name' },
      { title: 'Status Pembayaran', dataIndex: 'order_gold_payment_status' },
      { title: 'Kurir', dataIndex: 'tracking_courier_name' },
      { title: 'No Resi', dataIndex: 'tracking_number' },
      { title: 'Status Pengiriman', dataIndex: 'delivery_status' },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div className="flex gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
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
      <div className="border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={dataTable}
            pagination={false}
            onChange={handleTableChange}
            rowKey="order_number"
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
        </div>
      </div>
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default TarikEmasListTable;
