/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Pagination, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
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

// ==============================
// Interface sesuai response baru
// ==============================
export interface IGoldSellTransaction {
  gold_transaction_id: string;
  transaction_date: string;
  gold_sell_number: string;
  user_id: string;
  user_member_number: string;
  user_name: string;
  user_email: string;
  user_phone_number: string;
  weight: number;
  gold_history_price_sell: number;
  total_price: number;
  weight_before: string;
  weight_after: string;
  status: string;
  user_seller_unique_code: string;
}

const GoldSellTransactionDetailsTable = () => {
  const url = `/reports/gold-sell-transaction/details`;

  // 📅 Default tanggal awal dan akhir
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<IGoldSellTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    order_by: 'transaction_date',
    order_direction: 'DESC',
    search: '',
  });

  // 🔁 Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Update params saat debounce selesai
  useEffect(() => {
    setParams((prev) => ({ ...prev, search: debouncedSearch, offset: 0 }));
  }, [debouncedSearch]);

  // 🔁 Fetch data
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results || []);
      setTotal(resp.data.count || 0);
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }, [params, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 📆 Range date filter
  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams({
      ...params,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
      offset: 0,
    });
  };

  // 📑 Pagination
  const onChangePage = (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  // 📊 Sorting handler
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _: any,
    sorter: any
  ) => {
    if (Array.isArray(sorter)) return;
    if (sorter.order) {
      const direction = sorter.order === 'ascend' ? 'ASC' : 'DESC';
      setParams({
        ...params,
        order_by: sorter.field,
        order_direction: direction,
        offset: 0,
      });
    } else {
      setParams({
        ...params,
        order_by: 'transaction_date',
        order_direction: 'DESC',
        offset: 0,
      });
    }
  };

  // 📦 Export Excel
  const exportData = async () => {
    try {
      setIsModalLoading(true);
      const resp = await axiosInstance.get(url, {
        params: { ...params, offset: 0, limit: 1000 },
      });
      const rows = resp.data.results as IGoldSellTransaction[];

      if (!rows.length) {
        setIsModalLoading(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Penjualan Emas');

      worksheet.mergeCells('A1:M1');
      worksheet.getCell('A1').value = 'LAPORAN TRANSAKSI PENJUALAN EMAS';
      worksheet.getCell('A1').alignment = { horizontal: 'left' };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      worksheet.mergeCells('A2:M2');
      const periodeText =
        params.start_date && params.end_date
          ? `Periode: ${dayjs(params.start_date).format(
              'DD MMMM YYYY'
            )} s/d ${dayjs(params.end_date).format('DD MMMM YYYY')}`
          : 'Periode: Semua Tanggal';
      worksheet.getCell('A2').value = periodeText;
      worksheet.getCell('A2').alignment = { horizontal: 'left' };
      worksheet.getCell('A2').font = { italic: true };

      worksheet.mergeCells('A3:M3');
      worksheet.getCell('A3').value = `Dicetak pada: ${dayjs().format(
        'DD MMMM YYYY HH:mm'
      )}`;
      worksheet.getCell('A3').alignment = { horizontal: 'left' };
      worksheet.getCell('A3').font = { size: 10, color: { argb: '777777' } };

      worksheet.addRow([]);
      worksheet.addRow([]);

      const header = [
        'Tanggal Transaksi',
        'Nomor Transaksi',
        'Nama User',
        'Nomor Member',
        'Email',
        'No. HP',
        'Berat (gram)',
        'Berat Sebelum (gram)',
        'Berat Sesudah (gram)',
        'Harga Emas /gr',
        'Total Harga',
        'Status',
        'Kode Seller',
      ];
      const headerRow = worksheet.addRow(header);
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
          fgColor: { argb: 'FFDDDDDD' },
        };
      });

      rows.forEach((item) => {
        const row = worksheet.addRow([
          moment(item.transaction_date).format('DD MMMM YYYY HH:mm'),
          item.gold_sell_number,
          item.user_name,
          item.user_member_number,
          item.user_email,
          item.user_phone_number,
          item.weight,
          item.weight_before,
          item.weight_after,
          `Rp${formatDecimal(item.gold_history_price_sell)}`,
          `Rp${formatDecimal(item.total_price)}`,
          item.status,
          item.user_seller_unique_code,
        ]);

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      worksheet.columns.forEach((col: any) => {
        let maxLength = 0;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';
          if (val.length > maxLength) maxLength = val.length;
        });
        col.width = Math.min(Math.max(maxLength + 2, 12), 40);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_gold_sell_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const columns: ColumnsType<IGoldSellTransaction> = useMemo(
    () => [
      {
        title: 'Tanggal Transaksi',
        dataIndex: 'transaction_date',
        key: 'transaction_date',
        sorter: true,
        render: (val) => moment(val).format('DD MMMM YYYY HH:mm'),
      },
      {
        title: 'Nomor Transaksi',
        dataIndex: 'gold_sell_number',
        key: 'gold_sell_number',
        sorter: true,
      },
      {
        title: 'Nama User',
        dataIndex: 'user_name',
        key: 'user_name',
        sorter: true,
      },
      {
        title: 'Nomor Member',
        dataIndex: 'user_member_number',
        key: 'user_member_number',
        sorter: true,
      },
      {
        title: 'Email',
        dataIndex: 'user_email',
        key: 'user_email',
      },
      {
        title: 'No. HP',
        dataIndex: 'user_phone_number',
        key: 'user_phone_number',
      },
      {
        title: 'Berat (gram)',
        dataIndex: 'weight',
        key: 'weight',
        sorter: true,
        render: (val) => formatDecimal(val),
      },
      {
        title: 'Berat Sebelum (gram)',
        dataIndex: 'weight_before',
        key: 'weight_before',
        width: 150,
      },
      {
        title: 'Berat Sesudah (gram)',
        dataIndex: 'weight_after',
        key: 'weight_after',
        width: 150,
      },
      {
        title: 'Harga Emas /gr',
        dataIndex: 'gold_history_price_sell',
        key: 'gold_history_price_sell',
        sorter: true,
        render: (val) => `Rp${formatDecimal(val)}`,
      },
      {
        title: 'Total Harga',
        dataIndex: 'total_price',
        key: 'total_price',
        sorter: true,
        render: (val) => `Rp${formatDecimal(val)}`,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: 'Kode Seller',
        dataIndex: 'user_seller_unique_code',
        key: 'user_seller_unique_code',
      },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[dayjs(startOfMonth), dayjs(today)]}
          />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />
          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          onChange={handleTableChange}
          rowKey="gold_transaction_id"
          className="table-basic"
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

export default GoldSellTransactionDetailsTable;
