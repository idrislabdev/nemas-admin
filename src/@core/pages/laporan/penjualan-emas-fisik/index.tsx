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

  // =========================================================
  // DEFAULT TANGGAL
  // =========================================================

  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');

  const defaultEnd = dayjs().format('YYYY-MM-DD');

  // =========================================================
  // PARAMS
  // =========================================================

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart,
    end_date: defaultEnd,
    search: '',
    status: '',
    order_type: 'buy',
  });

  // =========================================================
  // DEBOUNCE SEARCH
  // =========================================================

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

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
  // TOTAL NETTO
  // =========================================================

  const getTotalNetto = (record: ISalesOrder) => {
    const grandTotal = Number(record.order_grand_total_price || 0);

    const discountTotal = Number(record.order_discount || 0);

    return grandTotal - discountTotal;
  };

  // =========================================================
  // COLUMNS
  // =========================================================

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

    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 150,
    },

    {
      title: 'Berat Emas',
      dataIndex: 'order_item_weight',
      key: 'order_item_weight',
      width: 150,
      align: 'right',
      render: (_, record) =>
        record.order_item_weight !== null &&
        record.order_item_weight !== undefined
          ? `${formatDecimal(Number(record.order_item_weight))} Gram`
          : '-',
    },

    {
      title: 'Nominal Pesanan',
      dataIndex: 'order_amount',
      key: 'order_amount',
      width: 150,
      align: 'right',
      render: (_, record) => formatCurrency(record.order_amount),
    },

    // =======================================================
    // TOTAL HARGA
    // =======================================================

    {
      title: 'Total Harga',
      dataIndex: 'order_total_price',
      key: 'order_total_price',
      width: 150,
      align: 'right',
      render: (_, record) => formatCurrency(record.order_total_price),
    },

    // =======================================================
    // BIAYA ADMIN
    // =======================================================

    {
      title: 'Biaya Admin',
      dataIndex: 'order_admin_amount',
      key: 'order_admin_amount',
      width: 150,
      align: 'right',
      render: (_, record) => formatCurrency(record.order_admin_amount),
    },

    // =======================================================
    // DISKON BIAYA ADMIN
    // =======================================================

    {
      title: 'Diskon Biaya Admin',
      dataIndex: 'discount_user_admin_fee',
      key: 'discount_user_admin_fee',
      width: 180,
      align: 'right',
      render: (_, record) => formatCurrency(record.discount_user_admin_fee),
    },

    // =======================================================
    // BIAYA ASURANSI
    // =======================================================

    {
      title: 'Biaya Asuransi',
      dataIndex: 'order_tracking_insurance_total',
      key: 'order_tracking_insurance_total',
      width: 160,
      align: 'right',
      render: (_, record) =>
        formatCurrency(record.order_tracking_insurance_total),
    },

    // =======================================================
    // DISKON BIAYA ASURANSI
    // =======================================================

    {
      title: 'Diskon Biaya Asuransi',
      dataIndex: 'discount_user_insurance_fee',
      key: 'discount_user_insurance_fee',
      width: 190,
      align: 'right',
      render: (_, record) => formatCurrency(record.discount_user_insurance_fee),
    },

    // =======================================================
    // BIAYA PENGIRIMAN
    // =======================================================

    {
      title: 'Biaya Pengiriman',
      dataIndex: 'order_tracking_total_amount',
      key: 'order_tracking_total_amount',
      width: 170,
      align: 'right',
      render: (_, record) => formatCurrency(record.order_tracking_total_amount),
    },

    // =======================================================
    // DISKON BIAYA PENGIRIMAN
    // =======================================================

    {
      title: 'Diskon Biaya Pengiriman',
      dataIndex: 'discount_user_delivery_fee',
      key: 'discount_user_delivery_fee',
      width: 200,
      align: 'right',
      render: (_, record) => formatCurrency(record.discount_user_delivery_fee),
    },

    // =======================================================
    // BIAYA CETAK SERTIFIKAT
    // =======================================================

    {
      title: 'Biaya Cetak Sertifikat',
      dataIndex: 'order_total_redeem_price',
      key: 'order_total_redeem_price',
      width: 200,
      align: 'right',
      render: (_, record) => formatCurrency(record.order_total_redeem_price),
    },

    // =======================================================
    // DISKON BIAYA SERTIFIKAT
    // =======================================================

    {
      title: 'Diskon Biaya Sertifikat',
      dataIndex: 'discount_user_redeem_fee',
      key: 'discount_user_redeem_fee',
      width: 200,
      align: 'right',
      render: (_, record) => formatCurrency(record.discount_user_redeem_fee),
    },

    // =======================================================
    // GRAND TOTAL
    // =======================================================

    {
      title: 'Grand Total',
      dataIndex: 'order_grand_total_price',
      key: 'order_grand_total_price',
      width: 160,
      align: 'right',
      render: (_, record) => formatCurrency(record.order_grand_total_price),
    },

    // =======================================================
    // DISKON PROMO
    // =======================================================

    {
      title: 'Diskon Promo',
      dataIndex: 'total_user_level_discount',
      key: 'total_user_level_discount',
      width: 160,
      align: 'right',
      render: (_, record) => formatCurrency(record.total_user_level_discount),
    },

    // =======================================================
    // DISKON TOTAL
    // =======================================================

    {
      title: 'Diskon Total',
      dataIndex: 'order_discount',
      key: 'order_discount',
      width: 150,
      align: 'right',
      render: (_, record) => formatCurrency(record.order_discount),
    },

    // =======================================================
    // TOTAL NETTO PENJUALAN
    // =======================================================

    {
      title: 'Total Netto Penjualan',
      key: 'total_netto_penjualan',
      width: 200,
      align: 'right',
      render: (_, record) => formatCurrency(getTotalNetto(record)),
    },

    // =======================================================
    // STATUS PESANAN
    // =======================================================

    {
      title: 'Status Pesanan',
      dataIndex: 'order_status',
      key: 'order_status',
      width: 150,
      align: 'center',
      fixed: 'right',
    },

    // =======================================================
    // STATUS PEMBAYARAN
    // =======================================================

    {
      title: 'Status Pembayaran',
      dataIndex: 'order_gold_payment_status',
      key: 'order_gold_payment_status',
      width: 150,
      align: 'center',
      fixed: 'right',
    },
  ];

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, {
        params,
      });

      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (error) {
      console.error('Gagal mengambil data penjualan emas fisik:', error);

      setDataTable([]);
      setTotal(0);
    }
  }, [params, url]);

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
    if (!dates || !dates[0] || !dates[1]) {
      return;
    }

    setParams((prev) => ({
      ...prev,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    }));
  };

  // =========================================================
  // STATUS FILTER
  // =========================================================

  const onStatusChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      status: value,
    }));
  };

  // =========================================================
  // FETCH ALL DATA
  // =========================================================

  const fetchAllData = async (requestUrl: string, requestParams: any) => {
    let allRows: ISalesOrder[] = [];

    const limit = 100;

    const firstResp = await axiosInstance.get(requestUrl, {
      params: {
        ...requestParams,
        limit,
        offset: 0,
        order_type: 'buy',
      },
    });

    allRows = allRows.concat(firstResp.data.results);

    const totalCount = firstResp.data.count;

    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const resp = await axiosInstance.get(requestUrl, {
        params: {
          ...requestParams,
          limit,
          offset: i * limit,
          order_type: 'buy',
        },
      });

      allRows = allRows.concat(resp.data.results);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return allRows;
  };

  // =========================================================
  // GET EXPORTED BY
  // =========================================================

  const getExportedBy = () => {
    if (typeof window === 'undefined') {
      return '-';
    }

    try {
      const rawUser =
        localStorage.getItem('user') ||
        localStorage.getItem('auth_user') ||
        localStorage.getItem('profile');

      if (!rawUser) {
        return '-';
      }

      const parsedUser = JSON.parse(rawUser);

      return (
        parsedUser?.full_name ||
        parsedUser?.name ||
        parsedUser?.username ||
        parsedUser?.email ||
        '-'
      );
    } catch (error) {
      console.error('Gagal membaca user dari localStorage:', error);

      return '-';
    }
  };

  // =========================================================
  // EXPORT EXCEL
  // =========================================================

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const exportParams = {
        ...params,
        offset: 0,
        limit: 100,
        order_type: 'buy',
      };

      const rows = await fetchAllData(url, exportParams);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');

        return;
      }

      // =====================================================
      // DATA EXPORT
      // =====================================================

      const dataToExport = rows.map((item: ISalesOrder, index: number) => {
        const grandTotal = Number(item.order_grand_total_price || 0);

        const discountTotal = Number(item.order_discount || 0);

        const totalNetto = grandTotal - discountTotal;

        return {
          No: index + 1,

          'Nomor Order': item.order_number || '-',

          'Tanggal Order': moment(item.order_timestamp).format(
            'DD MMMM YYYY HH:mm'
          ),

          User: item.user_name || '-',

          'Berat Emas': `${formatDecimal(
            Number(item.order_item_weight || 0)
          )} Gram`,

          'Nominal Pesanan': `Rp${formatDecimal(
            Number(item.order_amount || 0)
          )}`,

          // =============================================
          // TOTAL HARGA
          // =============================================

          'Total Harga': `Rp${formatDecimal(
            Number(item.order_total_price || 0)
          )}`,

          // =============================================
          // ADMIN
          // =============================================

          'Biaya Admin': `Rp${formatDecimal(
            Number(item.order_admin_amount || 0)
          )}`,

          'Diskon Biaya Admin': `Rp${formatDecimal(
            Number(item.discount_user_admin_fee || 0)
          )}`,

          // =============================================
          // ASURANSI
          // =============================================

          'Biaya Asuransi': `Rp${formatDecimal(
            Number(item.order_tracking_insurance_total || 0)
          )}`,

          'Diskon Biaya Asuransi': `Rp${formatDecimal(
            Number(item.discount_user_insurance_fee || 0)
          )}`,

          // =============================================
          // PENGIRIMAN
          // =============================================

          'Biaya Pengiriman': `Rp${formatDecimal(
            Number(item.order_tracking_total_amount || 0)
          )}`,

          'Diskon Biaya Pengiriman': `Rp${formatDecimal(
            Number(item.discount_user_delivery_fee || 0)
          )}`,

          // =============================================
          // SERTIFIKAT
          // =============================================

          'Biaya Cetak Sertifikat': `Rp${formatDecimal(
            Number(item.order_total_redeem_price || 0)
          )}`,

          'Diskon Biaya Sertifikat': `Rp${formatDecimal(
            Number(item.discount_user_redeem_fee || 0)
          )}`,

          // =============================================
          // GRAND TOTAL
          // =============================================

          'Grand Total': `Rp${formatDecimal(grandTotal)}`,

          // =============================================
          // DISKON PROMO
          // =============================================

          'Diskon Promo': `Rp${formatDecimal(
            Number(item.total_user_level_discount || 0)
          )}`,

          // =============================================
          // DISKON TOTAL
          // =============================================

          'Diskon Total': `Rp${formatDecimal(discountTotal)}`,

          // =============================================
          // NETTO
          // =============================================

          'Total Netto Penjualan': `Rp${formatDecimal(totalNetto)}`,

          // =============================================
          // STATUS
          // =============================================

          'Status Pesanan': item.order_status || '-',

          'Status Pembayaran': item.order_gold_payment_status || '-',
        };
      });

      // =====================================================
      // WORKBOOK
      // =====================================================

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';

      workbook.company = 'NEMAS';

      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Penjualan Emas Fisik');

      const exportedAt = dayjs().format('DD MMMM YYYY HH:mm:ss');

      const header = Object.keys(dataToExport[0]);

      // =====================================================
      // EXCEL COLUMN LETTER
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
      // TITLE
      // =====================================================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN PENJUALAN EMAS FISIK';

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

      // =====================================================
      // EXPORT INFO
      // =====================================================

      worksheet.getCell('A3').value = 'Dibuat Oleh';

      worksheet.getCell('B3').value = `: ${getExportedBy()}`;

      worksheet.getCell('A4').value = 'Diexport Pada';

      worksheet.getCell('B4').value = `: ${exportedAt}`;

      worksheet.getCell('A5').value = 'Total Data';

      worksheet.getCell('B5').value = `: ${rows.length}`;

      let periodeText = 'Semua Periode';

      if (params.start_date && params.end_date) {
        periodeText = `${dayjs(params.start_date).format(
          'DD MMMM YYYY'
        )} s/d ${dayjs(params.end_date).format('DD MMMM YYYY')}`;
      }

      worksheet.getCell('A6').value = 'Periode';

      worksheet.getCell('B6').value = `: ${periodeText}`;

      const statusText = params.status || 'Semua Status';

      worksheet.getCell('A7').value = 'Status Pesanan';

      worksheet.getCell('B7').value = `: ${statusText}`;

      worksheet.getCell('A3').font = {
        bold: true,
      };

      worksheet.getCell('A4').font = {
        bold: true,
      };

      worksheet.getCell('A5').font = {
        bold: true,
      };

      worksheet.getCell('A6').font = {
        bold: true,
      };

      worksheet.getCell('A7').font = {
        bold: true,
      };

      worksheet.addRow([]);

      // =====================================================
      // HEADER
      // =====================================================

      const headerRow = worksheet.addRow(header);

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

      // =====================================================
      // FREEZE HEADER
      // =====================================================

      worksheet.views = [
        {
          state: 'frozen',
          ySplit: 9,
        },
      ];

      worksheet.autoFilter = {
        from: 'A9',
        to: `${lastColumnLetter}9`,
      };

      // =====================================================
      // DATA
      // =====================================================

      dataToExport.forEach((row: any) => {
        const values = header.map((key) => row[key]);

        const newRow = worksheet.addRow(values);

        if (newRow.number % 2 === 1) {
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
          let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

          // No
          if (colNumber === 1) {
            horizontal = 'center';
          }

          // Numeric columns:
          // 5 = Berat
          // 6 = Nominal
          // 7 = Total Harga
          // 8 = Admin
          // 9 = Diskon Admin
          // 10 = Asuransi
          // 11 = Diskon Asuransi
          // 12 = Pengiriman
          // 13 = Diskon Pengiriman
          // 14 = Cetak Sertifikat
          // 15 = Diskon Sertifikat
          // 16 = Grand Total
          // 17 = Diskon Promo
          // 18 = Diskon Total
          // 19 = Netto
          if (colNumber >= 5 && colNumber <= 19) {
            horizontal = 'right';
          }

          // Status
          if (colNumber === 20 || colNumber === 21) {
            horizontal = 'center';
          }

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
      });

      // =====================================================
      // TOTAL
      // =====================================================

      const totalWeight = rows.reduce(
        (acc, cur) => acc + Number(cur.order_item_weight || 0),
        0
      );

      const totalOrder = rows.reduce(
        (acc, cur) => acc + Number(cur.order_amount || 0),
        0
      );

      const totalPrice = rows.reduce(
        (acc, cur) => acc + Number(cur.order_total_price || 0),
        0
      );

      const totalAdmin = rows.reduce(
        (acc, cur) => acc + Number(cur.order_admin_amount || 0),
        0
      );

      const totalAdminDiscount = rows.reduce(
        (acc, cur) => acc + Number(cur.discount_user_admin_fee || 0),
        0
      );

      const totalInsurance = rows.reduce(
        (acc, cur) => acc + Number(cur.order_tracking_insurance_total || 0),
        0
      );

      const totalInsuranceDiscount = rows.reduce(
        (acc, cur) => acc + Number(cur.discount_user_insurance_fee || 0),
        0
      );

      const totalShipping = rows.reduce(
        (acc, cur) => acc + Number(cur.order_tracking_total_amount || 0),
        0
      );

      const totalShippingDiscount = rows.reduce(
        (acc, cur) => acc + Number(cur.discount_user_delivery_fee || 0),
        0
      );

      const totalCertificate = rows.reduce(
        (acc, cur) => acc + Number(cur.order_total_redeem_price || 0),
        0
      );

      const totalCertificateDiscount = rows.reduce(
        (acc, cur) => acc + Number(cur.discount_user_redeem_fee || 0),
        0
      );

      const totalGrand = rows.reduce(
        (acc, cur) => acc + Number(cur.order_grand_total_price || 0),
        0
      );

      const totalPromoDiscount = rows.reduce(
        (acc, cur) => acc + Number(cur.total_user_level_discount || 0),
        0
      );

      const totalDiscount = rows.reduce(
        (acc, cur) => acc + Number(cur.order_discount || 0),
        0
      );

      const totalNetto = rows.reduce(
        (acc, cur) =>
          acc +
          Number(cur.order_grand_total_price || 0) -
          Number(cur.order_discount || 0),
        0
      );

      const totalRow = worksheet.addRow([
        'TOTAL',

        '',

        '',

        '',

        `${formatDecimal(totalWeight)} Gram`,

        `Rp${formatDecimal(totalOrder)}`,

        `Rp${formatDecimal(totalPrice)}`,

        `Rp${formatDecimal(totalAdmin)}`,

        `Rp${formatDecimal(totalAdminDiscount)}`,

        `Rp${formatDecimal(totalInsurance)}`,

        `Rp${formatDecimal(totalInsuranceDiscount)}`,

        `Rp${formatDecimal(totalShipping)}`,

        `Rp${formatDecimal(totalShippingDiscount)}`,

        `Rp${formatDecimal(totalCertificate)}`,

        `Rp${formatDecimal(totalCertificateDiscount)}`,

        `Rp${formatDecimal(totalGrand)}`,

        `Rp${formatDecimal(totalPromoDiscount)}`,

        `Rp${formatDecimal(totalDiscount)}`,

        `Rp${formatDecimal(totalNetto)}`,

        '',

        '',
      ]);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) {
          horizontal = 'center';
        }

        if (colNumber >= 5 && colNumber <= 19) {
          horizontal = 'right';
        }

        if (colNumber === 20 || colNumber === 21) {
          horizontal = 'center';
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

      // =====================================================
      // AUTO WIDTH
      // =====================================================

      worksheet.columns.forEach((column: any) => {
        let maxLength = 10;

        column.eachCell(
          {
            includeEmpty: true,
          },
          (cell: any) => {
            const value = cell.value ? cell.value.toString() : '';

            maxLength = Math.max(maxLength, value.length);
          }
        );

        column.width = Math.min(maxLength + 3, 40);
      });

      // =====================================================
      // SAVE
      // =====================================================

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `laporan_penjualan_emas_fisik_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  // =========================================================
  // FETCH DATA
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            onChange={onRangeChange}
            value={[dayjs(params.start_date), dayjs(params.end_date)]}
          />

          <select
            value={params.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Semua Status</option>

            <option value="delivered">delivered</option>

            <option value="paid">paid</option>

            <option value="unpaid">unpaid</option>
          </select>

          <input
            type="text"
            placeholder="Cari..."
            className="pl-3 pr-2 py-1.5 text-sm border border-gray-300 rounded-md w-[200px] h-[40px] focus:outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="btn !h-[40px] btn-primary"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />

          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
        </button>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="flex flex-col rounded-tr-[8px] rounded-tl-[8px] mt-3">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{
            x: 'max-content',
            y: 550,
          }}
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

      {/* =====================================================
          LOADING
      ===================================================== */}

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default PenjualanEmasFisikPage;
