'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ISalesOrder } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
import Link from 'next/link';

moment.locale('id');

const { RangePicker } = DatePicker;

const ComTarikEmasPage = () => {
  const url = `/reports/gold-sales-order/list?order_type=redeem`;

  const [dataTable, setDataTable] = useState<Array<ISalesOrder>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // 🗓️ Default tanggal awal = tanggal 1 bulan aktif, akhir = hari ini
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  // 📦 Parameter API
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
  });

  const columns: ColumnsType<ISalesOrder> = [
    {
      title: 'Nomor Order',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 150,
      render: (_, record) => (
        <Link
          href={`/transaksi/emas-fisik/${record.order_gold_id}`}
          className="items-start text-primary"
        >
          {record.order_number}
        </Link>
      ),
    },
    {
      title: 'Tanggal Order',
      dataIndex: 'order_timestamp',
      key: 'order_timestamp',
      width: 180,
      render: (_, record) =>
        moment(record.order_timestamp).format('DD MMMM YYYY'),
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120,
    },
    {
      title: 'Berat Emas',
      dataIndex: 'order_item_weight',
      key: 'order_item_weight',
      width: 150,
      render: (_, record) =>
        record.order_item_weight !== null
          ? `${formatDecimal(
              parseFloat(record.order_item_weight.toString())
            )} Gram`
          : '-',
    },
    {
      title: 'Nominal Pesanan',
      dataIndex: 'order_amount',
      key: 'order_amount',
      width: 160,
      render: (_, record) =>
        record.order_amount !== null
          ? `Rp${formatDecimal(parseFloat(record.order_amount.toString()))}`
          : '-',
    },
    {
      title: 'Biaya Pengiriman',
      dataIndex: 'order_tracking_total_amount_round',
      key: 'order_tracking_total_amount_round',
      width: 150,
      render: (_, record) =>
        record.order_tracking_total_amount_round !== null
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
        record.order_grand_total_price !== null
          ? `Rp${formatDecimal(
              parseFloat(record.order_grand_total_price.toString())
            )}`
          : '-',
    },
  ];

  // 🔁 Fetch data
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }, [params, url]);

  // 📆 Handle perubahan tanggal
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

  // 📑 Pagination
  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  // 🧾 Export Excel (tidak diubah dari logika sebelumnya)
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
      const param = {
        ...params,
        offset: 0,
        limit: 1000,
      };

      const rows = await fetchAllData(url, param);
      if (!rows.length) {
        setIsModalLoading(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Tarik Emas');

      worksheet.mergeCells('A1:J1');
      worksheet.getCell('A1').value = 'LAPORAN TARIK EMAS';
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      worksheet.mergeCells('A2:J2');
      worksheet.getCell('A2').value = `Periode: ${dayjs(
        params.start_date
      ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
        'DD-MM-YYYY'
      )}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      worksheet.addRow([]);
      const header = Object.keys({
        'Nomor Order': '',
        'Tanggal Order': '',
        User: '',
        'Berat Emas': '',
        'Nominal Pesanan': '',
        'Total Harga': '',
        'Biaya Admin': '',
        'Biaya Asuransi': '',
        'Biaya Pengiriman': '',
        'Grand Total': '',
      });
      const headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      rows.forEach((item: ISalesOrder) => {
        worksheet.addRow([
          item.order_number,
          moment(item.order_timestamp).format('DD MMMM YYYY'),
          item.user_name,
          `${formatDecimal(
            parseFloat(item.order_item_weight.toString())
          )} Gram`,
          `Rp${formatDecimal(parseFloat(item.order_amount.toString()))}`,
          `Rp${formatDecimal(parseFloat(item.order_total_price.toString()))}`,
          `Rp${formatDecimal(parseFloat(item.order_admin_amount.toString()))}`,
          `Rp${formatDecimal(
            parseFloat(
              item.order_tracking_insurance_total_round
                ? item.order_tracking_insurance_total_round.toString()
                : '0'
            )
          )}`,
          `Rp${formatDecimal(
            parseFloat(
              item.order_tracking_total_amount_round
                ? item.order_tracking_total_amount_round.toString()
                : '0'
            )
          )}`,
          `Rp${formatDecimal(
            parseFloat(item.order_grand_total_price.toString())
          )}`,
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_tarik_emas_${dayjs().format(
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
      <div className="flex items-center justify-between mb-4">
        <RangePicker
          size="small"
          className="w-[300px] h-[40px]"
          onChange={onRangeChange}
          defaultValue={[dayjs(startOfMonth), dayjs(today)]}
        />
        <button
          className="btn btn-primary"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />
          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
        </button>
      </div>

      <div className="flex flex-col rounded-tr-[8px] rounded-tl-[8px]">
        <div className="overflow-x-auto rounded-tr-[8px] rounded-tl-[8px] max-h-[600px]">
          <table className="min-w-full text-sm border-collapse table-fixed">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {columns.map((col: any) => (
                  <th
                    key={col.key?.toString() || col.dataIndex?.toString()}
                    className="px-4 py-2 border text-left font-medium text-gray-700"
                    style={{ width: col.width }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataTable.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-6 text-gray-400"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                dataTable.map((record: any) => (
                  <tr key={record.order_gold_id} className="hover:bg-gray-50">
                    {columns.map((col: any) => {
                      const rawValue =
                        record[col.dataIndex as keyof typeof record] ?? '';
                      const cellContent = col.render
                        ? col.render(rawValue, record, 0)
                        : rawValue;
                      return (
                        <td key={col.key} className="px-4 py-2 border">
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default ComTarikEmasPage;
