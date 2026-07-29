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
      align: 'right',
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
      align: 'right',
      render: (_, record) =>
        record.order_total_price
          ? `Rp${formatDecimal(parseFloat(record.order_total_price.toString()))}`
          : '-',
    },
    {
      title: 'Biaya Admin',
      dataIndex: 'order_admin_amount',
      key: 'order_admin_amount',
      width: 150,
      align: 'right',
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
      align: 'right',
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
      align: 'right',
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
      align: 'right',
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
      align: 'center',
      fixed: 'right',
    },
    {
      title: 'Status Pembayaran',
      dataIndex: 'order_gold_payment_status',
      key: 'order_gold_payment_status',
      width: 150,
      align: 'center',
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

  const getExportedBy = () => {
    if (typeof window === 'undefined') return '-';

    try {
      const rawUser =
        localStorage.getItem('user') ||
        localStorage.getItem('auth_user') ||
        localStorage.getItem('profile');

      if (!rawUser) return '-';

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

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData(url, params);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const dataToExport = rows.map((item: ISalesOrder, index: number) => ({
        No: index + 1,
        'Nomor Order': item.order_number || '-',
        'Tanggal Order': moment(item.order_timestamp).format(
          'DD MMMM YYYY HH:mm'
        ),
        User: item.user_name || '-',
        'Berat Emas': `${formatDecimal(
          Number(item.order_item_weight || 0)
        )} Gram`,
        'Nominal Pesanan': `Rp${formatDecimal(Number(item.order_amount || 0))}`,
        'Total Harga': `Rp${formatDecimal(Number(item.order_total_price || 0))}`,
        'Biaya Admin': `Rp${formatDecimal(
          Number(item.order_admin_amount || 0)
        )}`,
        'Biaya Asuransi': `Rp${formatDecimal(
          Number(item.order_tracking_insurance_total_round || 0)
        )}`,
        'Biaya Pengiriman': `Rp${formatDecimal(
          Number(item.order_tracking_total_amount_round || 0)
        )}`,
        'Grand Total': `Rp${formatDecimal(
          Number(item.order_grand_total_price || 0)
        )}`,
        'Status Pesanan': item.order_status || '-',
        'Status Pembayaran': item.order_gold_payment_status || '-',
      }));

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';
      workbook.company = 'NEMAS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Penjualan Emas Fisik');

      const exportedAt = dayjs().format('DD MMMM YYYY HH:mm:ss');

      const totalColumns = Object.keys(dataToExport[0]).length;
      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // =============================
      // Title
      // =============================

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

      // =============================
      // Export Info
      // =============================

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

      worksheet.getCell('A3').font = { bold: true };
      worksheet.getCell('A4').font = { bold: true };
      worksheet.getCell('A5').font = { bold: true };
      worksheet.getCell('A6').font = { bold: true };

      worksheet.addRow([]);

      // =============================
      // Header
      // =============================

      const header = Object.keys(dataToExport[0]);

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
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // =============================
      // Freeze Header
      // =============================

      worksheet.views = [
        {
          state: 'frozen',
          ySplit: 8,
        },
      ];

      worksheet.autoFilter = {
        from: 'A8',
        to: `${lastColumnLetter}8`,
      };

      // =============================
      // Data
      // =============================

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

          switch (colNumber) {
            case 1: // No
              horizontal = 'center';
              break;

            case 5: // Berat
            case 6: // Nominal
            case 7: // Total Harga
            case 8: // Admin
            case 9: // Asuransi
            case 10: // Pengiriman
            case 11: // Grand Total
              horizontal = 'right';
              break;

            case 12: // Status Pesanan
            case 13: // Status Pembayaran
              horizontal = 'center';
              break;

            default:
              horizontal = 'left';
          }

          cell.alignment = {
            horizontal,
            vertical: 'middle',
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // =============================
      // Total
      // =============================

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

      const totalInsurance = rows.reduce(
        (acc, cur) =>
          acc + Number(cur.order_tracking_insurance_total_round || 0),
        0
      );

      const totalShipping = rows.reduce(
        (acc, cur) => acc + Number(cur.order_tracking_total_amount_round || 0),
        0
      );

      const totalGrand = rows.reduce(
        (acc, cur) => acc + Number(cur.order_grand_total_price || 0),
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
        `Rp${formatDecimal(totalInsurance)}`,
        `Rp${formatDecimal(totalShipping)}`,
        `Rp${formatDecimal(totalGrand)}`,
        '',
        '',
      ]);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        switch (colNumber) {
          case 1:
            horizontal = 'center';
            break;

          case 5:
          case 6:
          case 7:
          case 8:
          case 9:
          case 10:
          case 11:
            horizontal = 'right';
            break;

          case 12:
          case 13:
            horizontal = 'center';
            break;

          default:
            horizontal = 'left';
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
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // =============================
      // Auto Width
      // =============================

      worksheet.columns.forEach((column: any) => {
        let maxLength = 10;

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const value = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, value.length);
        });

        column.width = Math.min(maxLength + 3, 40);
      });

      // =============================
      // Export
      // =============================

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
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

      <div className="flex flex-col  rounded-tr-[8px] rounded-tl-[8px] mt-3">
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
