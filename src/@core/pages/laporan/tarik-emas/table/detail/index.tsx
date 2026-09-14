'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DatePicker, Pagination, message } from 'antd';

import { ColumnsType } from 'antd/es/table';

import { FileDownload02 } from '@untitled-ui/icons-react';

import axiosInstance from '@/@core/utils/axios';

import ModalLoading from '@/@core/components/modal/modal-loading';

import { formatDecimal } from '@/@core/utils/general';

import ExcelJS from 'exceljs';

import { saveAs } from 'file-saver';

import dayjs, { Dayjs } from 'dayjs';

import 'dayjs/locale/id';

import { IUser } from '@/@core/@types/interface';

dayjs.locale('id');

const { RangePicker } = DatePicker;

/* =========================================================
   INTERFACE
========================================================= */

export interface IGoldRedeemReport {
  order_timestamp: string;

  order_number: string;

  name: string;

  gold_type: string;

  gold_brand: string;

  cert_code: string;

  weight: number;

  gold_price: number;

  order_price: number;

  order_payment_method_name: string;

  order_payment_va_bank: string;

  order_payment_number: string;

  order_gold_payment_status: string;

  tracking_number: string | null;

  delivery_pickup_date: string;

  tracking_courier_name: string;

  delivery_status: string;

  /* =====================================================
     BIAYA
  ===================================================== */

  order_total_price: number;

  order_total_price_round: number;

  order_grand_total_price: number;

  cert_price: number;

  order_admin_amount: number;

  discount_user_admin_fee: number;

  order_tracking_insurance: number;

  order_tracking_insurance_admin: number;

  order_tracking_insurance_total: number;

  order_tracking_insurance_total_round: number;

  discount_user_insurance_fee: number;

  order_tracking_total_amount: number;

  order_tracking_total_amount_round: number;

  discount_user_delivery_fee: number;

  total_user_level_discount_weight: number;

  discount_user_redeem_fee: number;

  total_user_level_discount: number;
}

/* =========================================================
   HELPER EXCEL COLUMN
========================================================= */

const getExcelColumnLabel = (colIndex: number): string => {
  let label = '';

  let index = colIndex;

  while (index > 0) {
    const remainder = (index - 1) % 26;

    label = String.fromCharCode(65 + remainder) + label;

    index = Math.floor((index - 1) / 26);
  }

  return label;
};

/* =========================================================
   COMPONENT
========================================================= */

const TarikEmasListTable = () => {
  const url = '/reports/gold-redeem/list';

  /* =======================================================
     DEFAULT DATE
  ======================================================= */

  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

  const today = dayjs().format('YYYY-MM-DD');

  /* =======================================================
     STATE
  ======================================================= */

  const [dataTable, setDataTable] = useState<IGoldRedeemReport[]>([]);

  const [total, setTotal] = useState(0);

  const [isModalLoading, setIsModalLoading] = useState(false);

  const [rangeValue, setRangeValue] = useState<[Dayjs, Dayjs]>([
    dayjs(startOfMonth),
    dayjs(today),
  ]);

  const [searchText, setSearchText] = useState('');

  /* =======================================================
     PARAMS
  ======================================================= */

  const [params, setParams] = useState({
    format: 'json',

    offset: 0,

    limit: 10,

    start_date: startOfMonth,

    end_date: today,

    order_by: 'order_price',

    order_direction: 'DESC',

    search: '',

    order_gold_payment_status: '',
  });

  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return '-';
    }

    return `Rp${formatDecimal(Number(value))}`;
  };

  /* =======================================================
     TOTAL NETTO
  ======================================================= */

  const getTotalNetto = (record: IGoldRedeemReport) => {
    const grandTotal = Number(record.order_grand_total_price || 0);

    const discountTotal = Number(record.total_user_level_discount || 0);

    return grandTotal - discountTotal;
  };

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, {
        params,
      });

      setDataTable(resp.data?.results || []);

      setTotal(resp.data?.count || 0);
    } catch (err) {
      console.error('Fetch failed:', err);

      setDataTable([]);

      setTotal(0);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const timeout = setTimeout(() => {
      setParams((prev) => {
        if (prev.search === searchText) {
          return prev;
        }

        return {
          ...prev,

          search: searchText,

          offset: 0,
        };
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchText]);

  /* =======================================================
     DATE RANGE
  ======================================================= */

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (!dates || !dates[0] || !dates[1]) {
      return;
    }

    setRangeValue([dates[0], dates[1]]);

    setParams((prev) => ({
      ...prev,

      start_date: dateStrings[0],

      end_date: dateStrings[1],

      offset: 0,
    }));
  };

  /* =======================================================
     PAYMENT STATUS
  ======================================================= */

  const onPaymentStatusChange = (status: string) => {
    setParams((prev) => ({
      ...prev,

      order_gold_payment_status: status,

      offset: 0,
    }));
  };

  /* =======================================================
     PAGINATION
  ======================================================= */

  const onChangePage = (page: number) => {
    setParams((prev) => ({
      ...prev,

      offset: (page - 1) * prev.limit,
    }));
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns: ColumnsType<IGoldRedeemReport> = useMemo(
    () => [
      /* ===============================================
           TANGGAL ORDER
        =============================================== */

      {
        title: 'Tanggal Order',

        dataIndex: 'order_timestamp',

        key: 'order_timestamp',

        width: 180,

        render: (value: string) =>
          value ? dayjs(value).format('DD MMM YYYY HH:mm') : '-',
      },

      /* ===============================================
           NO ORDER
        =============================================== */

      {
        title: 'No Order',

        dataIndex: 'order_number',

        key: 'order_number',

        width: 160,
      },

      /* ===============================================
           NAMA
        =============================================== */

      {
        title: 'Nama',

        dataIndex: 'name',

        key: 'name',

        width: 140,
      },

      /* ===============================================
           JENIS EMAS
        =============================================== */

      {
        title: 'Jenis Emas',

        dataIndex: 'gold_type',

        key: 'gold_type',

        width: 130,
      },

      /* ===============================================
           BRAND
        =============================================== */

      {
        title: 'Brand',

        dataIndex: 'gold_brand',

        key: 'gold_brand',

        width: 130,
      },

      /* ===============================================
           KODE SERTIFIKAT
        =============================================== */

      {
        title: 'Kode Sertifikat',

        dataIndex: 'cert_code',

        key: 'cert_code',

        width: 160,
      },

      /* ===============================================
           BERAT
        =============================================== */

      {
        title: 'Berat (gr)',

        dataIndex: 'weight',

        key: 'weight',

        width: 120,

        align: 'right',

        render: (value: number) => `${formatDecimal(Number(value || 0))} Gram`,
      },

      /* ===============================================
           HARGA EMAS
        =============================================== */

      {
        title: 'Harga Emas',

        dataIndex: 'gold_price',

        key: 'gold_price',

        width: 160,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           BIAYA ADMIN
        =============================================== */

      {
        title: 'Biaya Admin',

        dataIndex: 'order_admin_amount',

        key: 'order_admin_amount',

        width: 150,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           DISKON BIAYA ADMIN
        =============================================== */

      {
        title: 'Diskon Biaya Admin',

        dataIndex: 'discount_user_admin_fee',

        key: 'discount_user_admin_fee',

        width: 180,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           BIAYA ASURANSI
        =============================================== */

      {
        title: 'Biaya Asuransi',

        dataIndex: 'order_tracking_insurance_total',

        key: 'order_tracking_insurance_total',

        width: 160,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           DISKON BIAYA ASURANSI
        =============================================== */

      {
        title: 'Diskon Biaya Asuransi',

        dataIndex: 'discount_user_insurance_fee',

        key: 'discount_user_insurance_fee',

        width: 190,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           BIAYA PENGIRIMAN
        =============================================== */

      {
        title: 'Biaya Pengiriman',

        dataIndex: 'order_tracking_total_amount',

        key: 'order_tracking_total_amount',

        width: 170,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           DISKON BIAYA PENGIRIMAN
        =============================================== */

      {
        title: 'Diskon Biaya Pengiriman',

        dataIndex: 'discount_user_delivery_fee',

        key: 'discount_user_delivery_fee',

        width: 200,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           BIAYA CETAK SERTIFIKAT
        =============================================== */

      {
        title: 'Biaya Cetak Sertifikat',

        dataIndex: 'cert_price',

        key: 'cert_price',

        width: 210,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           DISKON BIAYA SERTIFIKAT
        =============================================== */

      {
        title: 'Diskon Biaya Sertifikat',

        dataIndex: 'discount_user_redeem_fee',

        key: 'discount_user_redeem_fee',

        width: 210,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           DISKON PROMO
        =============================================== */

      {
        title: 'Diskon Promo',

        dataIndex: 'total_user_level_discount',

        key: 'total_user_level_discount',

        width: 160,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           GRAND TOTAL
        =============================================== */

      {
        title: 'Grand Total',

        dataIndex: 'order_grand_total_price',

        key: 'order_grand_total_price',

        width: 170,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           DISKON TOTAL
        =============================================== */

      {
        title: 'Diskon Total',

        dataIndex: 'total_user_level_discount',

        key: 'total_user_level_discount',

        width: 150,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           TOTAL NETTO
        =============================================== */

      {
        title: 'Total Netto Biaya',

        key: 'total_netto_biaya',

        width: 190,

        align: 'right',

        render: (_: any, record) => formatCurrency(getTotalNetto(record)),
      },

      /* ===============================================
           METODE PEMBAYARAN
        =============================================== */

      {
        title: 'Metode Bayar',

        dataIndex: 'order_payment_method_name',

        key: 'order_payment_method_name',

        width: 150,

        align: 'center',
      },

      /* ===============================================
           NO PEMBAYARAN
        =============================================== */

      {
        title: 'No Pembayaran',

        dataIndex: 'order_payment_number',

        key: 'order_payment_number',

        width: 180,

        align: 'center',

        render: (value: string) => value || '-',
      },

      /* ===============================================
           STATUS PEMBAYARAN
        =============================================== */

      {
        title: 'Status Pembayaran',

        dataIndex: 'order_gold_payment_status',

        key: 'order_gold_payment_status',

        width: 170,

        align: 'center',
      },

      /* ===============================================
           KURIR
        =============================================== */

      {
        title: 'Kurir',

        dataIndex: 'tracking_courier_name',

        key: 'tracking_courier_name',

        width: 130,

        align: 'center',
      },

      /* ===============================================
           NO RESI
        =============================================== */

      {
        title: 'No Resi',

        dataIndex: 'tracking_number',

        key: 'tracking_number',

        width: 180,

        align: 'center',

        render: (value: string | null) => value || '-',
      },

      /* ===============================================
           STATUS PENGIRIMAN
        =============================================== */

      {
        title: 'Status Pengiriman',

        dataIndex: 'delivery_status',

        key: 'delivery_status',

        width: 170,

        align: 'center',

        render: (value: string) => value || '-',
      },
    ],
    []
  );

  /* =======================================================
     FETCH ALL DATA UNTUK EXPORT
  ======================================================= */

  const fetchAllData = async () => {
    const allRows: IGoldRedeemReport[] = [];

    const limit = 100;

    const requestParams = {
      ...params,

      offset: 0,

      limit,
    };

    const firstResp = await axiosInstance.get(url, {
      params: requestParams,
    });

    const firstRows = (firstResp.data?.results || []) as IGoldRedeemReport[];

    allRows.push(...firstRows);

    const totalCount = Number(firstResp.data?.count || 0);

    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const resp = await axiosInstance.get(url, {
        params: {
          ...requestParams,

          offset: i * limit,
        },
      });

      const rows = (resp.data?.results || []) as IGoldRedeemReport[];

      allRows.push(...rows);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return allRows;
  };

  /* =======================================================
     EXPORT EXCEL
  ======================================================= */

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

      const rows = await fetchAllData();

      if (!rows.length) {
        message.warning('Tidak ada data untuk diexport');

        return;
      }

      /* =================================================
           DATA EXPORT
        ================================================= */

      const dataToExport = rows.map((r) => {
        const grandTotal = Number(r.order_grand_total_price || 0);

        const discountTotal = Number(r.total_user_level_discount || 0);

        const totalNetto = grandTotal - discountTotal;

        return {
          'Tanggal Order':
            r.order_timestamp && dayjs(r.order_timestamp).isValid()
              ? dayjs(r.order_timestamp).format('DD MMMM YYYY HH:mm')
              : '-',

          'No Order': r.order_number || '-',

          Nama: r.name || '-',

          'Jenis Emas': r.gold_type || '-',

          Brand: r.gold_brand || '-',

          'Kode Sertifikat': r.cert_code || '-',

          'Berat (gr)': Number(r.weight || 0),

          /* =========================================
                   HARGA EMAS
                ========================================= */

          'Harga Emas (Rp)': Number(r.gold_price || 0),

          /* =========================================
                   BIAYA ADMIN
                ========================================= */

          'Biaya Admin (Rp)': Number(r.order_admin_amount || 0),

          'Diskon Biaya Admin (Rp)': Number(r.discount_user_admin_fee || 0),

          /* =========================================
                   ASURANSI
                ========================================= */

          'Biaya Asuransi (Rp)': Number(r.order_tracking_insurance_total || 0),

          'Diskon Biaya Asuransi (Rp)': Number(
            r.discount_user_insurance_fee || 0
          ),

          /* =========================================
                   PENGIRIMAN
                ========================================= */

          'Biaya Pengiriman (Rp)': Number(r.order_tracking_total_amount || 0),

          'Diskon Biaya Pengiriman (Rp)': Number(
            r.discount_user_delivery_fee || 0
          ),

          /* =========================================
                   SERTIFIKAT
                ========================================= */

          'Biaya Cetak Sertifikat (Rp)': Number(r.cert_price || 0),

          'Diskon Biaya Sertifikat (Rp)': Number(
            r.discount_user_redeem_fee || 0
          ),

          /* =========================================
                   DISKON PROMO
                ========================================= */

          'Diskon Promo (Rp)': Number(r.total_user_level_discount || 0),

          /* =========================================
                   TOTAL
                ========================================= */

          'Grand Total (Rp)': grandTotal,

          'Diskon Total (Rp)': discountTotal,

          'Total Netto Biaya (Rp)': totalNetto,

          /* =========================================
                   PEMBAYARAN
                ========================================= */

          'Metode Pembayaran': r.order_payment_method_name || '-',

          'No Pembayaran': r.order_payment_number || '-',

          'Status Pembayaran': r.order_gold_payment_status || '-',

          /* =========================================
                   PENGIRIMAN
                ========================================= */

          Kurir: r.tracking_courier_name || '-',

          'No Resi': r.tracking_number || '-',

          'Status Pengiriman': r.delivery_status || '-',
        };
      });

      /* =================================================
           WORKBOOK
        ================================================= */

      const workbook = new ExcelJS.Workbook();

      workbook.creator = user?.name || 'System';

      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Tarik Emas Detail');

      const headerKeys = Object.keys(dataToExport[0]);

      const totalColumns = headerKeys.length;

      const lastColumnLetter = getExcelColumnLabel(totalColumns);

      /* =================================================
           TITLE
        ================================================= */

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      worksheet.getCell('A1').value = 'LAPORAN TARIK EMAS DETAIL';

      worksheet.getCell('A1').font = {
        name: 'Calibri',

        bold: true,

        size: 14,

        color: {
          argb: 'FF1E293B',
        },
      };

      worksheet.getCell('A1').alignment = {
        horizontal: 'left',

        vertical: 'middle',
      };

      /* =================================================
           METADATA
        ================================================= */

      const formattedStartDate =
        params.start_date && dayjs(params.start_date).isValid()
          ? dayjs(params.start_date).format('DD MMMM YYYY')
          : '-';

      const formattedEndDate =
        params.end_date && dayjs(params.end_date).isValid()
          ? dayjs(params.end_date).format('DD MMMM YYYY')
          : '-';

      const statusText = params.order_gold_payment_status || 'Semua Status';

      const metadata = [
        `Dibuat oleh : ${user?.name || '-'}`,

        `Tanggal Export : ${dayjs().format('DD MMMM YYYY HH:mm')}`,

        `Total Data : ${rows.length}`,

        `Periode : ${formattedStartDate} s/d ${formattedEndDate}`,

        `Status Pembayaran : ${statusText}`,
      ];

      metadata.forEach((value, index) => {
        const rowNumber = index + 2;

        worksheet.mergeCells(`A${rowNumber}:${lastColumnLetter}${rowNumber}`);

        const cell = worksheet.getCell(`A${rowNumber}`);

        cell.value = value;

        cell.font = {
          name: 'Calibri',

          size: 11,

          color: {
            argb: 'FF1E293B',
          },
        };

        cell.alignment = {
          horizontal: 'left',

          vertical: 'middle',
        };
      });

      worksheet.addRow([]);

      /* =================================================
           HEADER
        ================================================= */

      const headerRowIndex = 8;

      const headerRow = worksheet.addRow(headerKeys);

      headerRow.height = 26;

      headerRow.eachCell((cell) => {
        cell.font = {
          name: 'Calibri',

          bold: true,

          color: {
            argb: 'FFFFFFFF',
          },

          size: 11,
        };

        cell.alignment = {
          horizontal: 'center',

          vertical: 'middle',

          wrapText: true,
        };

        cell.border = {
          top: {
            style: 'thin',

            color: {
              argb: 'FFCBD5E1',
            },
          },

          left: {
            style: 'thin',

            color: {
              argb: 'FFCBD5E1',
            },
          },

          bottom: {
            style: 'medium',

            color: {
              argb: 'FF004397',
            },
          },

          right: {
            style: 'thin',

            color: {
              argb: 'FFCBD5E1',
            },
          },
        };

        cell.fill = {
          type: 'pattern',

          pattern: 'solid',

          fgColor: {
            argb: 'FF0057B7',
          },
        };
      });

      /* =================================================
           DATA
        ================================================= */

      const dataStartRow = headerRowIndex + 1;

      dataToExport.forEach((row, index) => {
        const rowValues = headerKeys.map((key) => (row as any)[key]);

        const newRow = worksheet.addRow(rowValues);

        newRow.height = 20;

        const rowBgColor = index % 2 === 1 ? 'FFF8FBFF' : 'FFFFFFFF';

        for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
          const cell = newRow.getCell(colIndex);

          const header = headerKeys[colIndex - 1];

          const isCurrency = header.includes('(Rp)');

          const isWeight = header.includes('(gr)');

          cell.font = {
            name: 'Calibri',

            size: 10,

            color: {
              argb: 'FF334155',
            },
          };

          cell.alignment = {
            horizontal: isCurrency || isWeight ? 'right' : 'left',

            vertical: 'middle',
          };

          if (isCurrency && typeof cell.value === 'number') {
            cell.numFmt = '#,##0.00';
          }

          if (isWeight && typeof cell.value === 'number') {
            cell.numFmt = '#,##0.00';
          }

          cell.fill = {
            type: 'pattern',

            pattern: 'solid',

            fgColor: {
              argb: rowBgColor,
            },
          };

          cell.border = {
            top: {
              style: 'thin',

              color: {
                argb: 'FFE2E8F0',
              },
            },

            left: {
              style: 'thin',

              color: {
                argb: 'FFE2E8F0',
              },
            },

            bottom: {
              style: 'thin',

              color: {
                argb: 'FFE2E8F0',
              },
            },

            right: {
              style: 'thin',

              color: {
                argb: 'FFE2E8F0',
              },
            },
          };
        }
      });

      const dataEndRow = dataStartRow + dataToExport.length - 1;

      /* =================================================
           TOTAL ROW
        ================================================= */

      type NumericExportKey =
        | 'Berat (gr)'
        | 'Harga Emas (Rp)'
        | 'Biaya Admin (Rp)'
        | 'Diskon Biaya Admin (Rp)'
        | 'Biaya Asuransi (Rp)'
        | 'Diskon Biaya Asuransi (Rp)'
        | 'Biaya Pengiriman (Rp)'
        | 'Diskon Biaya Pengiriman (Rp)'
        | 'Biaya Cetak Sertifikat (Rp)'
        | 'Diskon Biaya Sertifikat (Rp)'
        | 'Diskon Promo (Rp)'
        | 'Grand Total (Rp)'
        | 'Diskon Total (Rp)'
        | 'Total Netto Biaya (Rp)';

      const totalFields: NumericExportKey[] = [
        'Berat (gr)',

        'Harga Emas (Rp)',

        'Biaya Admin (Rp)',

        'Diskon Biaya Admin (Rp)',

        'Biaya Asuransi (Rp)',

        'Diskon Biaya Asuransi (Rp)',

        'Biaya Pengiriman (Rp)',

        'Diskon Biaya Pengiriman (Rp)',

        'Biaya Cetak Sertifikat (Rp)',

        'Diskon Biaya Sertifikat (Rp)',

        'Diskon Promo (Rp)',

        'Grand Total (Rp)',

        'Diskon Total (Rp)',

        'Total Netto Biaya (Rp)',
      ];

      const totalRowValues = headerKeys.map((key, colIndex) => {
        if (key === 'Tanggal Order') {
          return 'TOTAL';
        }

        if (totalFields.includes(key as NumericExportKey)) {
          const colLetter = getExcelColumnLabel(colIndex + 1);

          return {
            formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`,
          };
        }

        return '';
      });

      const totalRow = worksheet.addRow(totalRowValues);

      totalRow.height = 22;

      for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
        const cell = totalRow.getCell(colIndex);

        const header = headerKeys[colIndex - 1];

        const isNumeric = totalFields.includes(header as NumericExportKey);

        cell.font = {
          name: 'Calibri',

          bold: true,

          color: {
            argb: 'FF1E293B',
          },

          size: 11,
        };

        cell.alignment = {
          horizontal: isNumeric ? 'right' : 'left',

          vertical: 'middle',
        };

        if (isNumeric) {
          cell.numFmt = header.includes('(gr)') ? '#,##0.00' : '#,##0.00';
        }

        cell.fill = {
          type: 'pattern',

          pattern: 'solid',

          fgColor: {
            argb: 'FFFFF59D',
          },
        };

        cell.border = {
          top: {
            style: 'thin',

            color: {
              argb: 'FF94A3B8',
            },
          },

          left: {
            style: 'thin',

            color: {
              argb: 'FF94A3B8',
            },
          },

          bottom: {
            style: 'double',

            color: {
              argb: 'FF475569',
            },
          },

          right: {
            style: 'thin',

            color: {
              argb: 'FF94A3B8',
            },
          },
        };
      }

      /* =================================================
           FREEZE PANE EXCEL
        ================================================= */

      worksheet.views = [
        {
          state: 'frozen',

          xSplit: 0,

          ySplit: headerRowIndex,
        },
      ];

      /* =================================================
           AUTOFILTER
        ================================================= */

      worksheet.autoFilter = `A${headerRowIndex}:${lastColumnLetter}${dataEndRow}`;

      /* =================================================
           AUTO WIDTH
        ================================================= */

      worksheet.columns.forEach((column) => {
        let maxLength = 0;

        column.eachCell?.(
          {
            includeEmpty: true,
          },

          (cell) => {
            let value = '';

            if (
              cell.value &&
              typeof cell.value === 'object' &&
              'formula' in cell.value
            ) {
              value = '123,456,789.00';
            } else if (cell.value !== null && cell.value !== undefined) {
              value = cell.value.toString();
            }

            maxLength = Math.max(maxLength, value.length);
          }
        );

        column.width = Math.min(Math.max(maxLength + 4, 14), 35);
      });

      /* =================================================
           SAVE
        ================================================= */

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `laporan_tarik_emas_detail_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);

      message.error('Gagal mengunduh laporan Excel');
    } finally {
      setIsModalLoading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          FILTER
      =================================================== */}

      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* DATE */}

          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            value={rangeValue}
            onChange={onRangeChange}
          />

          {/* PAYMENT STATUS */}

          <select
            value={params.order_gold_payment_status}
            onChange={(e) => onPaymentStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Semua Status</option>

            <option value="CANCELLED">CANCELLED</option>

            <option value="ISSUED">ISSUED</option>

            <option value="PAID">PAID</option>

            <option value="PENDING">PENDING</option>
          </select>

          {/* SEARCH */}

          <input
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border rounded px-3 h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* EXPORT */}

        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />

          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
        </button>
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="flex flex-col rounded-tr-[8px] rounded-tl-[8px]">
        <div className="overflow-x-auto rounded-tr-[8px] rounded-tl-[8px] max-h-[600px]">
          <table className="min-w-[3400px] text-sm border-collapse table-fixed">
            {/* =================================================
                HEADER
            ================================================= */}

            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {columns.map((col: any) => (
                  <th
                    key={col.key?.toString() || col.dataIndex?.toString()}
                    className={`px-4 py-2 border text-left font-medium text-gray-700 whitespace-nowrap ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                    style={{
                      width: col.width,

                      minWidth: col.width,

                      maxWidth: col.width,
                    }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>

            {/* =================================================
                BODY
            ================================================= */}

            <tbody>
              {dataTable.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-6 text-gray-400 border"
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}

              {dataTable.map((record) => (
                <tr key={record.order_number} className="hover:bg-gray-50">
                  {columns.map((col: any) => {
                    const rawValue = col.dataIndex
                      ? ((record as any)[col.dataIndex] ?? '')
                      : '';

                    const cellContent = col.render
                      ? col.render(rawValue, record, 0)
                      : rawValue;

                    return (
                      <td
                        key={col.key?.toString() || col.dataIndex?.toString()}
                        className={`px-4 py-2 border whitespace-nowrap ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                        }`}
                        style={{
                          width: col.width,

                          minWidth: col.width,

                          maxWidth: col.width,
                        }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===================================================
            PAGINATION
        =================================================== */}

        <div className="flex justify-end p-[12px]">
          <Pagination
            onChange={onChangePage}
            pageSize={params.limit}
            total={total}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* ===================================================
          MODAL LOADING
      =================================================== */}

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default TarikEmasListTable;
