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

export interface IGoldRedeemSummary {
  order_timestamp: string;

  order_number: string;

  name: string;

  qty: number;

  weight: number;

  gold_price: number;

  cert_price: number;

  order_admin_amount: number;

  discount_user_admin_fee: number;

  order_tracking_insurance: number;

  order_tracking_insurance_total: number;

  discount_user_insurance_fee: number;

  order_tracking_total_amount: number;

  discount_user_delivery_fee: number;

  order_total_redeem_price: number;

  discount_user_redeem_fee: number;

  total_user_level_discount: number;

  order_grand_total_price: number;

  order_discount: number;

  order_amount: number;

  order_payment_method_name: string;

  order_payment_va_bank: string;

  order_payment_number: string;

  order_gold_payment_status: string;

  tracking_number: string | null;

  delivery_pickup_date: string;

  tracking_courier_name: string;

  delivery_status: string;
}

/* =========================================================
   EXPORT TYPE
========================================================= */

type ExportSummaryRow = {
  'Tanggal Order': string;

  'No Order': string;

  Nama: string;

  Qty: number;

  'Berat (gr)': number;

  'Harga Emas (Rp)': number;

  'Biaya Admin (Rp)': number;

  'Diskon Biaya Admin (Rp)': number;

  'Biaya Asuransi (Rp)': number;

  'Diskon Biaya Asuransi (Rp)': number;

  'Biaya Pengiriman (Rp)': number;

  'Diskon Biaya Pengiriman (Rp)': number;

  'Biaya Cetak Sertifikat (Rp)': number;

  'Diskon Biaya Sertifikat (Rp)': number;

  'Diskon Promo (Rp)': number;

  'Grand Total (Rp)': number;

  'Diskon Total (Rp)': number;

  'Total Netto Biaya (Rp)': number;

  'Metode Pembayaran': string;

  'No Pembayaran': string;

  'Status Pembayaran': string;

  Kurir: string;

  'No Resi': string;

  'Status Pengiriman': string;
};

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

const TarikEmasSummaryTable = () => {
  const url = '/reports/gold-redeem/summary';

  /* =======================================================
     DEFAULT DATE
  ======================================================= */

  const defaultStart = dayjs().startOf('month');

  const defaultEnd = dayjs();

  /* =======================================================
     STATE
  ======================================================= */

  const [dataTable, setDataTable] = useState<IGoldRedeemSummary[]>([]);

  const [total, setTotal] = useState(0);

  const [isModalLoading, setIsModalLoading] = useState(false);

  const [rangeValue, setRangeValue] = useState<[Dayjs, Dayjs]>([
    defaultStart,
    defaultEnd,
  ]);

  const [searchText, setSearchText] = useState('');

  /* =======================================================
     PARAMS
  ======================================================= */

  const [params, setParams] = useState({
    format: 'json',

    offset: 0,

    limit: 10,

    start_date: defaultStart.format('YYYY-MM-DD'),

    end_date: defaultEnd.format('YYYY-MM-DD'),

    order_by: 'order_amount',

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

  const getTotalNetto = (record: IGoldRedeemSummary) => {
    const grandTotal = Number(record.order_grand_total_price || 0);

    const discountTotal = Number(record.order_discount || 0);

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

  /* =======================================================
     INITIAL / PARAM FETCH
  ======================================================= */

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

  const onPaymentStatusChange = (value: string) => {
    setParams((prev) => ({
      ...prev,

      order_gold_payment_status: value,

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

  const columns: ColumnsType<IGoldRedeemSummary> = useMemo(
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
           QTY
        =============================================== */

      {
        title: 'Qty',

        dataIndex: 'qty',

        key: 'qty',

        width: 80,

        align: 'right',
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

        dataIndex: 'order_total_redeem_price',

        key: 'order_total_redeem_price',

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

        dataIndex: 'order_discount',

        key: 'order_discount',

        width: 150,

        align: 'right',

        render: (value: number) => formatCurrency(value),
      },

      /* ===============================================
           TOTAL NETTO BIAYA
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
    const allRows: IGoldRedeemSummary[] = [];

    const limit = 100;

    const requestParams = {
      ...params,

      offset: 0,

      limit,
    };

    const firstResp = await axiosInstance.get(url, {
      params: requestParams,
    });

    const firstRows = (firstResp.data?.results || []) as IGoldRedeemSummary[];

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

      const rows = (resp.data?.results || []) as IGoldRedeemSummary[];

      allRows.push(...rows);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return allRows;
  };

  /* =======================================================
     EXPORT EXCEL
  ======================================================= */

  const exportSummary = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const rows = await fetchAllData();

      if (!rows || rows.length === 0) {
        message.warning('Tidak ada data untuk diexport.');

        return;
      }

      /* ===================================================
         MAPPING
      =================================================== */

      const dataToExport: ExportSummaryRow[] = rows.map((r) => {
        const grandTotal = Number(r.order_grand_total_price || 0);

        const discountTotal = Number(r.order_discount || 0);

        const totalNetto = grandTotal - discountTotal;

        return {
          'Tanggal Order': r.order_timestamp
            ? dayjs(r.order_timestamp).format('DD MMMM YYYY HH:mm')
            : '-',

          'No Order': r.order_number || '-',

          Nama: r.name || '-',

          Qty: Number(r.qty || 0),

          'Berat (gr)': Number(r.weight || 0),

          'Harga Emas (Rp)': Number(r.gold_price || 0),

          /* =========================================
               ADMIN
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

          'Biaya Cetak Sertifikat (Rp)': Number(
            r.order_total_redeem_price || 0
          ),

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

      /* ===================================================
         WORKBOOK
      =================================================== */

      const workbook = new ExcelJS.Workbook();

      workbook.creator = user?.name || 'System';

      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Tarik Emas Summary');

      const headerKeys = Object.keys(
        dataToExport[0]
      ) as (keyof ExportSummaryRow)[];

      const totalColumns = headerKeys.length;

      const lastColumnLetter = getExcelColumnLabel(totalColumns);

      /* ===================================================
         TITLE
      =================================================== */

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN TARIK EMAS SUMMARY';

      titleCell.font = {
        size: 16,

        bold: true,

        color: {
          argb: 'FF0057B7',
        },
      };

      titleCell.alignment = {
        horizontal: 'left',

        vertical: 'middle',
      };

      /* ===================================================
         METADATA
      =================================================== */

      worksheet.getCell('A3').value = 'Dibuat Oleh';

      worksheet.getCell('B3').value = `: ${user?.name || '-'}`;

      worksheet.getCell('A4').value = 'Tanggal Export';

      worksheet.getCell('B4').value = `: ${dayjs().format(
        'DD MMMM YYYY HH:mm:ss'
      )}`;

      worksheet.getCell('A5').value = 'Total Data';

      worksheet.getCell('B5').value = `: ${rows.length}`;

      const periodeText =
        params?.start_date && params?.end_date
          ? `${dayjs(params.start_date).format('DD MMMM YYYY')} s/d ${dayjs(
              params.end_date
            ).format('DD MMMM YYYY')}`
          : '-';

      worksheet.getCell('A6').value = 'Periode';

      worksheet.getCell('B6').value = `: ${periodeText}`;

      const statusText = params.order_gold_payment_status || 'Semua Status';

      worksheet.getCell('A7').value = 'Status Pembayaran';

      worksheet.getCell('B7').value = `: ${statusText}`;

      ['A3', 'A4', 'A5', 'A6', 'A7'].forEach((cell) => {
        worksheet.getCell(cell).font = {
          bold: true,
        };
      });

      worksheet.addRow([]);

      /* ===================================================
         HEADER
      =================================================== */

      const headerRow = worksheet.addRow(headerKeys);

      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,

          color: {
            argb: 'FFFFFFFF',
          },
        };

        cell.fill = {
          type: 'pattern',

          pattern: 'solid',

          fgColor: {
            argb: 'FF0057B7',
          },
        };

        cell.alignment = {
          horizontal: 'center',

          vertical: 'middle',

          wrapText: true,
        };

        cell.border = {
          top: {
            style: 'thin',
          },

          left: {
            style: 'thin',
          },

          bottom: {
            style: 'thin',
          },

          right: {
            style: 'thin',
          },
        };
      });

      /* ===================================================
         FORMAT
      =================================================== */

      const currencyFormat = '"Rp"#,##0.00;("Rp"#,##0.00);"-"';

      const weightFormat = '#,##0.00" Gram"';

      const qtyFormat = '#,##0';

      /* ===================================================
         DATA ROW
      =================================================== */

      dataToExport.forEach((row, index) => {
        const newRow = worksheet.addRow(headerKeys.map((key) => row[key]));

        /* Zebra */

        if (index % 2 === 1) {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',

              pattern: 'solid',

              fgColor: {
                argb: 'FFF8FBFF',
              },
            };
          });
        }

        newRow.eachCell((cell, colNumber) => {
          const header = headerKeys[colNumber - 1];

          let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

          if (
            header === 'Tanggal Order' ||
            header === 'Status Pembayaran' ||
            header === 'Status Pengiriman' ||
            header === 'Kurir' ||
            header === 'No Resi' ||
            header === 'Metode Pembayaran'
          ) {
            horizontal = 'center';
          }

          if (header === 'Qty') {
            horizontal = 'right';

            cell.numFmt = qtyFormat;
          }

          if (header === 'Berat (gr)') {
            horizontal = 'right';

            cell.numFmt = weightFormat;
          }

          if (header.includes('(Rp)')) {
            horizontal = 'right';

            cell.numFmt = currencyFormat;
          }

          cell.alignment = {
            horizontal,

            vertical: 'middle',

            wrapText: false,
          };

          cell.border = {
            top: {
              style: 'thin',
            },

            left: {
              style: 'thin',
            },

            bottom: {
              style: 'thin',
            },

            right: {
              style: 'thin',
            },
          };
        });
      });

      /* ===================================================
         TOTAL ROW
      =================================================== */

      const startRow = 10;

      const endRow = 9 + rows.length;

      type NumericKey =
        | 'Qty'
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

      const totalFields: NumericKey[] = [
        'Qty',

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

      const totalRow = worksheet.addRow(
        headerKeys.map((key, colIdx) => {
          if (key === 'Tanggal Order') {
            return 'TOTAL';
          }

          if (totalFields.includes(key as NumericKey)) {
            const colLetter = getExcelColumnLabel(colIdx + 1);

            return {
              formula: `SUM(${colLetter}${startRow}:${colLetter}${endRow})`,
            };
          }

          return '';
        })
      );

      const totalRowNumber = totalRow.number;

      /* Merge TOTAL */

      worksheet.mergeCells(`A${totalRowNumber}:C${totalRowNumber}`);

      totalRow.eachCell((cell, colNumber) => {
        const header = headerKeys[colNumber - 1];

        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) {
          horizontal = 'center';
        }

        if (totalFields.includes(header as NumericKey)) {
          horizontal = 'right';
        }

        if (header === 'Qty') {
          cell.numFmt = qtyFormat;
        }

        if (header === 'Berat (gr)') {
          cell.numFmt = weightFormat;
        }

        if (header.includes('(Rp)')) {
          cell.numFmt = currencyFormat;
        }

        cell.font = {
          bold: true,
        };

        cell.fill = {
          type: 'pattern',

          pattern: 'solid',

          fgColor: {
            argb: 'FFFFF59D',
          },
        };

        cell.alignment = {
          horizontal,

          vertical: 'middle',
        };

        cell.border = {
          top: {
            style: 'thin',
          },

          left: {
            style: 'thin',
          },

          bottom: {
            style: 'thin',
          },

          right: {
            style: 'thin',
          },
        };
      });

      /* ===================================================
         FREEZE HEADER EXCEL
      =================================================== */

      worksheet.views = [
        {
          state: 'frozen',

          ySplit: 9,
        },
      ];

      /* ===================================================
         AUTOFILTER
      =================================================== */

      worksheet.autoFilter = {
        from: {
          row: 9,

          column: 1,
        },

        to: {
          row: 9,

          column: totalColumns,
        },
      };

      /* ===================================================
         AUTO WIDTH
      =================================================== */

      worksheet.columns.forEach((column: any, colIdx: number) => {
        let maxLength = headerKeys[colIdx]?.length || 10;

        column.eachCell(
          {
            includeEmpty: true,
          },

          (cell: any, rowNum: number) => {
            if (rowNum >= 9) {
              const value = cell.value ? cell.value.toString() : '';

              maxLength = Math.max(maxLength, value.length);
            }
          }
        );

        column.width = Math.min(maxLength + 4, 35);
      });

      /* ===================================================
         SAVE
      =================================================== */

      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `laporan_tarik_emas_summary_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
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
        <div className="flex flex-wrap gap-2">
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
          onClick={exportSummary}
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
          <table className="min-w-[3200px] text-sm border-collapse table-fixed">
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

export default TarikEmasSummaryTable;
