'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ISalesOrder, IUser } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import {
  CalendarCheck01,
  ClipboardCheck,
  FileDownload02,
  Truck01,
} from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Select } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
import Link from 'next/link';
import ModalDO from '@/@core/pages/transaksi/emas-fisik/modal-do';
import { useSearchParams, useRouter } from 'next/navigation';

moment.locale('id');

const { RangePicker } = DatePicker;

const ComEmasFisikPage = (props: {
  title: string;
  parentUrl: string;
  urlVal: string;
}) => {
  const { title, parentUrl, urlVal } = props;

  const url = urlVal;

  const router = useRouter();
  const searchParams = useSearchParams();

  // =========================================================
  // DETEKSI ORDER TYPE
  // =========================================================

  const orderType = useMemo(() => {
    const query = urlVal.split('?')[1];

    if (!query) {
      return '';
    }

    const queryParams = new URLSearchParams(query);

    return queryParams.get('order_type') || '';
  }, [urlVal]);

  const isRedeem = orderType === 'redeem';
  // const isBuy = orderType === 'buy';

  // =========================================================
  // STATE
  // =========================================================

  const [dataTable, setDataTable] = useState<Array<ISalesOrder>>([]);
  const [total, setTotal] = useState(0);

  const [isModalLoading, setIsModalLoading] = useState(false);

  const [isModalDO, setIsModalDO] = useState(false);

  const [selectedId, setSelectedId] = useState('');

  const startOfMonth = dayjs().subtract(2, 'month').format('YYYY-MM-DD');

  const today = dayjs().format('YYYY-MM-DD');

  // =========================================================
  // FILTER
  // =========================================================

  const [filterStatus, setFilterStatus] = useState<string>('');

  const [filterPickedUp, setFilterPickedUp] = useState<string>('');

  // =========================================================
  // PARAMS
  // =========================================================

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    status: '',
    is_picked_up: '',
  });

  // =========================================================
  // BACA QUERY PARAM DARI URL
  // =========================================================

  useEffect(() => {
    const statusParam = searchParams.get('status');

    const pickedParam = searchParams.get('is_picked_up');

    if (statusParam) {
      setFilterStatus(statusParam);
    }

    if (pickedParam === 'true' || pickedParam === 'false') {
      setFilterPickedUp(pickedParam);
    }
  }, [searchParams]);

  // =========================================================
  // UPDATE QUERY PARAM
  // =========================================================

  const updateQueryParams = (key: string, value: string | null) => {
    const queryParams = new URLSearchParams(window.location.search);

    if (value) {
      queryParams.set(key, value);
    } else {
      queryParams.delete(key);
    }

    router.replace(`?${queryParams.toString()}`);
  };

  // =========================================================
  // FILTER STATUS
  // =========================================================

  const handleStatusChange = (value: string) => {
    setFilterStatus(value || '');

    updateQueryParams('status', value || null);

    setParams((prev) => ({
      ...prev,
      offset: 0,
    }));
  };

  // =========================================================
  // FILTER PENGIRIMAN
  // =========================================================

  const handlePickedUpChange = (value: string) => {
    setFilterPickedUp(value || '');

    updateQueryParams('is_picked_up', value || null);

    setParams((prev) => ({
      ...prev,
      offset: 0,
    }));
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return '-';
    }

    return `Rp${formatDecimal(Number(value))}`;
  };

  // =========================================================
  // GET TOTAL NETTO
  // =========================================================

  const getTotalNetto = (record: ISalesOrder) => {
    const grandTotal = Number(record.order_grand_total_price || 0);

    const discountTotal = Number(record.order_discount || 0);

    return grandTotal - discountTotal;
  };

  // =========================================================
  // COLUMNS DINAMIS
  // =========================================================

  const columns: ColumnsType<ISalesOrder> = useMemo(() => {
    const baseColumns: any[] = [
      // ===================================================
      // NOMOR ORDER
      // ===================================================

      {
        title: 'Nomor Order',
        dataIndex: 'order_number',
        key: 'order_number',
        width: 150,

        render: (_: any, record: ISalesOrder) => (
          <Link
            href={`/transaksi/emas-fisik/${record.order_gold_id}`}
            className="items-start text-primary"
          >
            {record.order_number}
          </Link>
        ),
      },

      // ===================================================
      // TANGGAL ORDER
      // ===================================================

      {
        title: 'Tanggal Order',
        dataIndex: 'order_timestamp',
        key: 'order_timestamp',
        width: 180,

        render: (_: any, record: ISalesOrder) =>
          moment(record.order_timestamp).format('DD MMMM YYYY'),
      },

      // ===================================================
      // USER
      // ===================================================

      {
        title: 'User',
        dataIndex: 'user_name',
        key: 'user_name',
        width: 120,
      },

      // ===================================================
      // BERAT EMAS
      // ===================================================

      {
        title: 'Berat Emas',
        dataIndex: 'order_item_weight',
        key: 'order_item_weight',
        width: 150,

        render: (_: any, record: ISalesOrder) => (
          <>
            {record.order_item_weight !== null
              ? `${formatDecimal(Number(record.order_item_weight))} Gram`
              : '-'}
          </>
        ),
      },

      // ===================================================
      // NOMINAL PESANAN
      // ===================================================

      {
        title: 'Nominal Pesanan',
        dataIndex: 'order_amount',
        key: 'order_amount',
        width: 160,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.order_amount),
      },

      // ===================================================
      // TOTAL HARGA
      // ===================================================

      {
        title: 'Total Harga',
        dataIndex: 'order_total_price',
        key: 'order_total_price',
        width: 160,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.order_total_price),
      },

      // ===================================================
      // BIAYA ADMIN
      // ===================================================

      {
        title: 'Biaya Admin',
        dataIndex: 'order_admin_amount',
        key: 'order_admin_amount',
        width: 150,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.order_admin_amount),
      },

      // ===================================================
      // DISKON BIAYA ADMIN
      // ===================================================

      {
        title: 'Diskon Biaya Admin',
        dataIndex: 'discount_user_admin_fee',
        key: 'discount_user_admin_fee',
        width: 180,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.discount_user_admin_fee),
      },

      // ===================================================
      // BIAYA ASURANSI
      // ===================================================

      {
        title: 'Biaya Asuransi',
        dataIndex: 'order_tracking_insurance_total',
        key: 'order_tracking_insurance_total',
        width: 160,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.order_tracking_insurance_total),
      },

      // ===================================================
      // DISKON BIAYA ASURANSI
      // ===================================================

      {
        title: 'Diskon Biaya Asuransi',
        dataIndex: 'discount_user_insurance_fee',
        key: 'discount_user_insurance_fee',
        width: 190,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.discount_user_insurance_fee),
      },

      // ===================================================
      // BIAYA PENGIRIMAN
      // ===================================================

      {
        title: 'Biaya Pengiriman',
        dataIndex: 'order_tracking_total_amount',
        key: 'order_tracking_total_amount',
        width: 170,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.order_tracking_total_amount),
      },

      // ===================================================
      // DISKON BIAYA PENGIRIMAN
      // ===================================================

      {
        title: 'Diskon Biaya Pengiriman',

        dataIndex: 'discount_user_delivery_fee',

        key: 'discount_user_delivery_fee',

        width: 200,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.discount_user_delivery_fee),
      },
    ];

    // =====================================================
    // KHUSUS TARIK EMAS
    // =====================================================

    if (isRedeem) {
      baseColumns.push(
        // =================================================
        // BIAYA CETAK SERTIFIKAT
        // =================================================

        {
          title: 'Biaya Cetak Sertifikat',

          dataIndex: 'order_total_redeem_price',

          key: 'order_total_redeem_price',

          width: 200,

          render: (_: any, record: ISalesOrder) =>
            formatCurrency(record.order_total_redeem_price),
        },

        // =================================================
        // DISKON BIAYA SERTIFIKAT
        // =================================================

        {
          title: 'Diskon Biaya Sertifikat',

          dataIndex: 'discount_user_redeem_fee',

          key: 'discount_user_redeem_fee',

          width: 200,

          render: (_: any, record: ISalesOrder) =>
            formatCurrency(record.discount_user_redeem_fee),
        },

        // =================================================
        // DISKON PROMO
        // =================================================

        {
          title: 'Diskon Promo',

          dataIndex: 'total_user_level_discount',

          key: 'total_user_level_discount',

          width: 160,

          render: (_: any, record: ISalesOrder) =>
            formatCurrency(record.total_user_level_discount),
        }
      );
    }

    // =====================================================
    // GRAND TOTAL
    // =====================================================

    baseColumns.push(
      {
        title: 'Grand Total',

        dataIndex: 'order_grand_total_price',

        key: 'order_grand_total_price',

        width: 160,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.order_grand_total_price),
      },

      // ===================================================
      // DISKON TOTAL
      // ===================================================

      {
        title: 'Diskon Total',

        dataIndex: 'order_discount',

        key: 'order_discount',

        width: 150,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(record.order_discount),
      },

      // ===================================================
      // NETTO
      // ===================================================

      {
        title: isRedeem ? 'Total Netto Biaya' : 'Total Netto Penjualan',

        key: 'total_netto',

        width: 210,

        render: (_: any, record: ISalesOrder) =>
          formatCurrency(getTotalNetto(record)),
      }
    );

    // =====================================================
    // STATUS PESANAN
    // =====================================================

    baseColumns.push(
      {
        title: 'Status Pesanan',

        dataIndex: 'order_status',

        key: 'order_status',

        width: 200,

        fixed: 'right',

        render: (_: any, record: ISalesOrder) => (
          <div className="flex flex-col gap-[4px]">
            <label className="flex items-center gap-[4px]">
              Pesanan :
              <span className="bg-yellow-600 text-white text-[11px] rounded-md flex gap-[4px] items-center justify-center w-[70px] h-[20px] italic">
                {record.order_status}
              </span>
            </label>

            <label className="flex items-center gap-[4px]">
              Pembayaran :
              <span className="bg-blue-600 text-white text-[11px] rounded-md flex gap-[4px] items-center justify-center w-[70px] h-[20px] italic">
                {record.order_gold_payment_status}
              </span>
            </label>

            <label className="flex items-center gap-[4px]">
              Pengiriman :
              {record.is_picked_up && (
                <span className="bg-green-600 text-white text-[11px] rounded-md flex gap-[4px] items-center justify-center w-[70px] h-[20px] italic">
                  <span className="my-icon icon-xs">
                    <Truck01 />
                  </span>
                  Dikirim
                </span>
              )}
            </label>
          </div>
        ),
      },

      // ===================================================
      // STATUS PENGIRIMAN
      // ===================================================

      {
        title: 'Status Pengiriman',

        dataIndex: 'order_gold_payment_status_pengiriman',

        key: 'order_gold_payment_status_pengiriman',

        width: 135,

        fixed: 'right',

        align: 'center',

        render: (_: any, record: ISalesOrder) => (
          <div className="flex items-center justify-center">
            {!record.is_picked_up &&
              record.order_gold_payment_status === 'PAID' && (
                <Link
                  href={`${parentUrl}/${record.order_gold_id}/delivery`}
                  className="bg-primary text-white text-[11px] flex-row gap-[4px] w-full h-[28px] rounded"
                >
                  <span className="my-icon icon-sm">
                    <CalendarCheck01 />
                  </span>
                  Proses
                </Link>
              )}

            {record.is_picked_up && (
              <a
                onClick={() => {
                  setSelectedId(record.order_gold_id);

                  setIsModalDO(true);
                }}
                className="bg-green-600 text-white text-[11px] flex-row gap-[4px] w-full h-[28px] rounded cursor-pointer"
              >
                <span className="my-icon icon-sm">
                  <ClipboardCheck />
                </span>
                Surat Jalan
              </a>
            )}
          </div>
        ),
      }
    );

    return baseColumns;
  }, [isRedeem, parentUrl]);

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, {
        params: {
          ...params,

          status: filterStatus || undefined,

          is_picked_up:
            filterPickedUp !== ''
              ? filterPickedUp === 'true'
                ? true
                : false
              : undefined,
        },
      });

      setDataTable(resp.data.results);

      setTotal(resp.data.count);
    } catch (error) {
      console.error('Fetch data failed:', error);

      setDataTable([]);
      setTotal(0);
    }
  }, [params, url, filterStatus, filterPickedUp]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const onChangePage = (val: number) => {
    setParams((prev) => ({
      ...prev,

      offset: (val - 1) * prev.limit,
    }));
  };

  // =========================================================
  // DATE RANGE
  // =========================================================

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams((prev) => ({
      ...prev,

      offset: 0,

      limit: 10,

      start_date: dateStrings[0],

      end_date: dateStrings[1],
    }));
  };

  // =========================================================
  // FETCH ALL DATA UNTUK EXPORT
  // =========================================================

  const fetchAllData = async (requestUrl: string, requestParams: any) => {
    let allRows: any[] = [];

    const limit = 100;

    const requestParamsWithFilter = {
      ...requestParams,

      limit,

      offset: 0,

      status: filterStatus || undefined,

      is_picked_up:
        filterPickedUp !== ''
          ? filterPickedUp === 'true'
            ? true
            : false
          : undefined,
    };

    const firstResp = await axiosInstance.get(requestUrl, {
      params: requestParamsWithFilter,
    });

    allRows = allRows.concat(firstResp.data.results);

    const totalCount = firstResp.data.count;

    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;

      const nextParams = {
        ...requestParamsWithFilter,

        offset,
      };

      const resp = await axiosInstance.get(requestUrl, {
        params: nextParams,
      });

      allRows = allRows.concat(resp.data.results);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return allRows;
  };

  // =========================================================
  // EXPORT EXCEL
  // =========================================================

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const exportParams = {
        ...params,

        offset: 0,

        limit: 1000,
      };

      const rows = await fetchAllData(url, exportParams);

      if (!rows.length) {
        setIsModalLoading(false);

        return;
      }

      // =====================================================
      // DATA EXPORT
      // =====================================================

      const dataToExport = rows.map((item: ISalesOrder) => {
        const grandTotal = Number(item.order_grand_total_price || 0);

        const discountTotal = Number(item.order_discount || 0);

        const totalNetto = grandTotal - discountTotal;

        const baseData: any = {
          'Nomor Order': item.order_number,

          'Tanggal Order': moment(item.order_timestamp).format('DD MMMM YYYY'),

          User: item.user_name,

          'Berat Emas': Number(item.order_item_weight || 0),

          'Nominal Pesanan': Number(item.order_amount || 0),

          'Total Harga': Number(item.order_total_price || 0),

          // =========================================
          // ADMIN
          // =========================================

          'Biaya Admin': Number(item.order_admin_amount || 0),

          'Diskon Biaya Admin': Number(item.discount_user_admin_fee || 0),

          // =========================================
          // ASURANSI
          // =========================================

          'Biaya Asuransi': Number(item.order_tracking_insurance_total || 0),

          'Diskon Biaya Asuransi': Number(
            item.discount_user_insurance_fee || 0
          ),

          // =========================================
          // PENGIRIMAN
          // =========================================

          'Biaya Pengiriman': Number(item.order_tracking_total_amount || 0),

          'Diskon Biaya Pengiriman': Number(
            item.discount_user_delivery_fee || 0
          ),
        };

        // =================================================
        // KHUSUS TARIK EMAS
        // =================================================

        if (isRedeem) {
          baseData['Biaya Cetak Sertifikat'] = Number(
            item.order_total_redeem_price || 0
          );

          baseData['Diskon Biaya Sertifikat'] = Number(
            item.discount_user_redeem_fee || 0
          );

          baseData['Diskon Promo'] = Number(
            item.total_user_level_discount || 0
          );
        }

        // =================================================
        // GRAND TOTAL + NETTO
        // =================================================

        baseData['Grand Total'] = grandTotal;

        baseData['Diskon Total'] = discountTotal;

        baseData[isRedeem ? 'Total Netto Biaya' : 'Total Netto Penjualan'] =
          totalNetto;

        // =================================================
        // STATUS
        // =================================================

        baseData['Status Pesanan'] = item.order_status;

        baseData['Status Pembayaran'] = item.order_gold_payment_status;

        baseData['Status Pengiriman'] = item.is_picked_up ? 'Dikirim' : '-';

        return baseData;
      });

      // =====================================================
      // WORKBOOK
      // =====================================================

      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet(`Laporan ${title}`);

      const header = Object.keys(dataToExport[0]);

      // =====================================================
      // LAST COLUMN DINAMIS
      // =====================================================

      const getExcelColumnLetter = (columnNumber: number) => {
        let dividend = columnNumber;

        let columnName = '';

        while (dividend > 0) {
          const modulo = (dividend - 1) % 26;

          columnName = String.fromCharCode(65 + modulo) + columnName;

          dividend = Math.floor((dividend - modulo) / 26);
        }

        return columnName;
      };

      const lastColumnLetter = getExcelColumnLetter(header.length);

      // =====================================================
      // NUMERIC CURRENCY
      // =====================================================

      const numericCurrencyColumns = [
        'Nominal Pesanan',

        'Total Harga',

        'Biaya Admin',

        'Diskon Biaya Admin',

        'Biaya Asuransi',

        'Diskon Biaya Asuransi',

        'Biaya Pengiriman',

        'Diskon Biaya Pengiriman',

        'Biaya Cetak Sertifikat',

        'Diskon Biaya Sertifikat',

        'Diskon Promo',

        'Grand Total',

        'Diskon Total',

        'Total Netto Penjualan',

        'Total Netto Biaya',
      ];

      const numericWeightColumns = ['Berat Emas'];

      // =====================================================
      // TITLE
      // =====================================================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      worksheet.getCell('A1').value = `LAPORAN ${title.toUpperCase()}`;

      worksheet.getCell('A1').alignment = {
        horizontal: 'left',

        vertical: 'middle',
      };

      worksheet.getCell('A1').font = {
        size: 14,

        bold: true,
      };

      // =====================================================
      // DIBUAT OLEH
      // =====================================================

      worksheet.mergeCells(`A2:${lastColumnLetter}2`);

      worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;

      worksheet.getCell('A2').alignment = {
        horizontal: 'left',

        vertical: 'middle',
      };

      // =====================================================
      // TANGGAL EXPORT
      // =====================================================

      worksheet.mergeCells(`A3:${lastColumnLetter}3`);

      worksheet.getCell('A3').value = `Tanggal Export : ${dayjs().format(
        'DD MMMM YYYY HH:mm'
      )}`;

      worksheet.getCell('A3').alignment = {
        horizontal: 'left',

        vertical: 'middle',
      };

      // =====================================================
      // TOTAL DATA
      // =====================================================

      worksheet.mergeCells(`A4:${lastColumnLetter}4`);

      worksheet.getCell('A4').value = `Total Data : ${rows.length}`;

      worksheet.getCell('A4').alignment = {
        horizontal: 'left',

        vertical: 'middle',
      };

      // =====================================================
      // PERIODE
      // =====================================================

      let periodeText = 'Semua Periode';

      if (params.start_date && params.end_date) {
        periodeText = `${dayjs(params.start_date).format(
          'DD-MM-YYYY'
        )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;
      }

      worksheet.mergeCells(`A5:${lastColumnLetter}5`);

      worksheet.getCell('A5').value = `Periode : ${periodeText}`;

      worksheet.getCell('A5').alignment = {
        horizontal: 'left',

        vertical: 'middle',
      };

      worksheet.addRow([]);

      // =====================================================
      // HEADER
      // =====================================================

      const headerRow = worksheet.addRow(header);

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
        };

        cell.alignment = {
          horizontal: 'center',

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

        cell.fill = {
          type: 'pattern',

          pattern: 'solid',

          fgColor: {
            argb: 'FFE5E5E5',
          },
        };
      });

      // =====================================================
      // DATA
      // =====================================================

      dataToExport.forEach((row: any) => {
        const rowValues = header.map((key) => {
          const value = row[key];

          if (typeof value === 'number') {
            if (numericWeightColumns.includes(key)) {
              return `${formatDecimal(value)} Gram`;
            }

            if (numericCurrencyColumns.includes(key)) {
              return `Rp${formatDecimal(value)}`;
            }

            return formatDecimal(value);
          }

          return value;
        });

        const newRow = worksheet.addRow(rowValues);

        newRow.eachCell(
          {
            includeEmpty: true,
          },

          (cell, colNumber) => {
            const headerName = header[colNumber - 1];

            const isNumeric = [
              ...numericWeightColumns,
              ...numericCurrencyColumns,
            ].includes(headerName);

            cell.alignment = {
              vertical: 'middle',

              horizontal: isNumeric ? 'right' : 'left',
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
          }
        );
      });

      // =====================================================
      // TOTAL BARIS
      // =====================================================

      const totalValues: Record<string, number> = {
        'Berat Emas': rows.reduce(
          (sum, item) => sum + Number(item.order_item_weight || 0),

          0
        ),

        'Nominal Pesanan': rows.reduce(
          (sum, item) => sum + Number(item.order_amount || 0),

          0
        ),

        'Total Harga': rows.reduce(
          (sum, item) => sum + Number(item.order_total_price || 0),

          0
        ),

        'Biaya Admin': rows.reduce(
          (sum, item) => sum + Number(item.order_admin_amount || 0),

          0
        ),

        'Diskon Biaya Admin': rows.reduce(
          (sum, item) => sum + Number(item.discount_user_admin_fee || 0),

          0
        ),

        'Biaya Asuransi': rows.reduce(
          (sum, item) => sum + Number(item.order_tracking_insurance_total || 0),

          0
        ),

        'Diskon Biaya Asuransi': rows.reduce(
          (sum, item) => sum + Number(item.discount_user_insurance_fee || 0),

          0
        ),

        'Biaya Pengiriman': rows.reduce(
          (sum, item) => sum + Number(item.order_tracking_total_amount || 0),

          0
        ),

        'Diskon Biaya Pengiriman': rows.reduce(
          (sum, item) => sum + Number(item.discount_user_delivery_fee || 0),

          0
        ),

        'Grand Total': rows.reduce(
          (sum, item) => sum + Number(item.order_grand_total_price || 0),

          0
        ),

        'Diskon Total': rows.reduce(
          (sum, item) => sum + Number(item.order_discount || 0),

          0
        ),

        ...(isRedeem
          ? {
              'Biaya Cetak Sertifikat': rows.reduce(
                (sum, item) => sum + Number(item.order_total_redeem_price || 0),

                0
              ),

              'Diskon Biaya Sertifikat': rows.reduce(
                (sum, item) => sum + Number(item.discount_user_redeem_fee || 0),

                0
              ),

              'Diskon Promo': rows.reduce(
                (sum, item) =>
                  sum + Number(item.total_user_level_discount || 0),

                0
              ),
            }
          : {}),

        ...(isRedeem
          ? {
              'Total Netto Biaya': rows.reduce(
                (sum, item) =>
                  sum +
                  Number(item.order_grand_total_price || 0) -
                  Number(item.order_discount || 0),

                0
              ),
            }
          : {
              'Total Netto Penjualan': rows.reduce(
                (sum, item) =>
                  sum +
                  Number(item.order_grand_total_price || 0) -
                  Number(item.order_discount || 0),

                0
              ),
            }),
      };

      // =====================================================
      // TOTAL ROW
      // =====================================================

      const totalRowValues = header.map((key) => {
        if (key === 'Nomor Order') {
          return 'TOTAL';
        }

        if (key in totalValues) {
          const value = totalValues[key];

          if (numericWeightColumns.includes(key)) {
            return `${formatDecimal(value)} Gram`;
          }

          if (numericCurrencyColumns.includes(key)) {
            return `Rp${formatDecimal(value)}`;
          }

          return formatDecimal(value);
        }

        return '';
      });

      const totalRow = worksheet.addRow(totalRowValues);

      totalRow.eachCell(
        {
          includeEmpty: true,
        },

        (cell, colNumber) => {
          const headerName = header[colNumber - 1];

          const isNumeric = [
            ...numericWeightColumns,
            ...numericCurrencyColumns,
          ].includes(headerName);

          cell.font = {
            bold: true,
          };

          cell.fill = {
            type: 'pattern',

            pattern: 'solid',

            fgColor: {
              argb: 'FFFCE29F',
            },
          };

          cell.alignment = {
            vertical: 'middle',

            horizontal: isNumeric ? 'right' : 'left',
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
        }
      );

      // =====================================================
      // AUTO WIDTH
      // =====================================================

      worksheet.columns.forEach((col: any) => {
        if (!col) {
          return;
        }

        let maxLength = 0;

        col.eachCell?.(
          {
            includeEmpty: true,
          },

          (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';

            if (val.length > maxLength) {
              maxLength = val.length;
            }
          }
        );

        col.width = Math.min(maxLength + 2, 40);
      });

      // =====================================================
      // FREEZE HEADER
      // =====================================================

      worksheet.views = [
        {
          state: 'frozen',

          ySplit: 7,
        },
      ];

      // =====================================================
      // SAVE
      // =====================================================

      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `laporan_${title}_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  // =========================================================
  // FETCH INITIAL DATA
  // =========================================================

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          FILTER
      ===================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[38px]"
            onChange={onRangeChange}
            defaultValue={[dayjs(startOfMonth), dayjs(today)]}
          />

          {/* STATUS PESANAN */}

          <Select
            allowClear
            size="large"
            className="w-[180px] select-sm"
            placeholder="Semua Status"
            value={filterStatus || undefined}
            onChange={handleStatusChange}
            options={[
              {
                value: '',
                label: 'Semua Status',
              },

              {
                value: 'paid',
                label: 'Paid',
              },

              {
                value: 'unpaid',
                label: 'Unpaid',
              },
            ]}
          />

          {/* STATUS PENGIRIMAN */}

          <Select
            allowClear
            size="large"
            className="w-[180px] select-sm"
            placeholder="Semua Pengiriman"
            value={filterPickedUp || undefined}
            onChange={handlePickedUpChange}
            options={[
              {
                value: 'true',
                label: 'Sudah Dikirim',
              },

              {
                value: 'false',
                label: 'Belum Dikirim',
              },
            ]}
          />
        </div>

        {/* EXPORT */}

        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="flex flex-col rounded-tr-[8px] rounded-tl-[8px]">
        <div className="overflow-x-auto rounded-tr-[8px] rounded-tl-[8px] max-h-[600px]">
          <table className="min-w-full text-sm border-collapse table-fixed">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {columns.map((col: any) => (
                  <th
                    key={col.key?.toString() || col.dataIndex?.toString()}
                    className={`px-4 py-2 border text-left font-medium text-gray-700 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                    style={{
                      width: col.width,
                    }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {dataTable.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-6 text-gray-400"
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}

              {dataTable.map((record: any) => (
                <tr key={record.order_gold_id} className="hover:bg-gray-50">
                  {columns.map((col: any) => {
                    const rawValue = col.dataIndex
                      ? (record[col.dataIndex] ?? '')
                      : '';

                    const cellContent = col.render
                      ? col.render(rawValue, record, 0)
                      : rawValue;

                    return (
                      <td
                        key={col.key?.toString() || col.dataIndex?.toString()}
                        className={`px-4 py-2 border ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                        }`}
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

      {/* =====================================================
          MODAL LOADING
      ===================================================== */}

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />

      {/* =====================================================
          MODAL DO
      ===================================================== */}

      <ModalDO
        isModalOpen={isModalDO}
        setIsModalOpen={setIsModalDO}
        orderId={selectedId}
      />
    </>
  );
};

export default ComEmasFisikPage;
