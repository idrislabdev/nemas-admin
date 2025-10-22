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

export interface IGoldBuySummaryUser {
  user_id: string;
  user_name: string;
  user_member_number: string;
  user_seller_unique_code: string;
  total_pembelian: number;
  total_emas_dibeli: number;
  jumlah_transaksi: number;
  total_komisi: number;
  transaksi_terakhir: string;
}

const GoldBuySummaryUserTable = () => {
  const url = `/reports/gold-buy-transaction/summary-user`;

  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<IGoldBuySummaryUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    order_by: 'jumlah_transaksi',
    order_direction: 'DESC',
  });

  const [rangeValue, setRangeValue] = useState<[Dayjs, Dayjs]>([
    dayjs(startOfMonth),
    dayjs(today),
  ]);

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

  // 📆 Filter tanggal
  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (!dates || !dates[0] || !dates[1]) return;
    setRangeValue([dates[0], dates[1]]);
    setParams({
      ...params,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
      offset: 0,
    });
  };

  // 📄 Pagination
  const onChangePage = (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  // 📑 Sorting handler
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
        order_by: 'jumlah_transaksi',
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
      const rows = resp.data.results as IGoldBuySummaryUser[];

      if (!rows.length) {
        setIsModalLoading(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Summary Pembelian Emas');

      // === HEADER JUDUL (rata kiri) ===
      worksheet.mergeCells('A1:H1');
      worksheet.getCell('A1').value = 'LAPORAN SUMMARY PEMBELIAN EMAS PER USER';
      worksheet.getCell('A1').alignment = { horizontal: 'left' };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      worksheet.mergeCells('A2:H2');
      const periodeText =
        params.start_date && params.end_date
          ? `Periode: ${dayjs(params.start_date).format(
              'DD MMMM YYYY'
            )} s/d ${dayjs(params.end_date).format('DD MMMM YYYY')}`
          : 'Periode: Semua Tanggal';
      worksheet.getCell('A2').value = periodeText;
      worksheet.getCell('A2').alignment = { horizontal: 'left' };
      worksheet.getCell('A2').font = { italic: true };

      worksheet.mergeCells('A3:H3');
      worksheet.getCell('A3').value = `Dicetak pada: ${dayjs().format(
        'DD MMMM YYYY HH:mm'
      )}`;
      worksheet.getCell('A3').alignment = { horizontal: 'left' };
      worksheet.getCell('A3').font = { italic: true };

      worksheet.addRow([]);

      // === HEADER KOLOM ===
      const header = [
        'Nama User',
        'Nomor Member',
        'Kode Seller',
        'Jumlah Transaksi',
        'Total Pembelian (Rp)',
        'Total Emas Dibeli (gram)',
        'Total Komisi (Rp)',
        'Transaksi Terakhir',
      ];
      const headerRow = worksheet.addRow(header);
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
          fgColor: { argb: 'FFE5E5E5' },
        };
      });

      // === ISI DATA ===
      rows.forEach((item) => {
        const row = worksheet.addRow([
          item.user_name,
          item.user_member_number,
          item.user_seller_unique_code,
          item.jumlah_transaksi,
          `Rp${formatDecimal(item.total_pembelian)}`,
          formatDecimal(item.total_emas_dibeli),
          `Rp${formatDecimal(item.total_komisi)}`,
          item.transaksi_terakhir
            ? moment(item.transaksi_terakhir).format('DD MMM YYYY HH:mm')
            : '-',
        ]);

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.alignment = { vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // === FIT WIDTH KOLOM ===
      worksheet.columns.forEach((col: any) => {
        let maxLength = 0;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';
          if (val.length > maxLength) maxLength = val.length;
        });
        col.width = Math.min(maxLength + 2, 40); // batasi agar tidak terlalu lebar
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_summary_user_${dayjs().format(
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

  // 📋 Kolom tabel
  const columns: ColumnsType<IGoldBuySummaryUser> = useMemo(
    () => [
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
        title: 'Kode Seller',
        dataIndex: 'user_seller_unique_code',
        key: 'user_seller_unique_code',
      },
      {
        title: 'Jumlah Transaksi',
        dataIndex: 'jumlah_transaksi',
        key: 'jumlah_transaksi',
        sorter: true,
      },
      {
        title: 'Total Pembelian',
        dataIndex: 'total_pembelian',
        key: 'total_pembelian',
        sorter: true,
        render: (val) => `Rp${formatDecimal(val)}`,
      },
      {
        title: 'Total Emas Dibeli (gram)',
        dataIndex: 'total_emas_dibeli',
        key: 'total_emas_dibeli',
        sorter: true,
        render: (val) => formatDecimal(val),
      },
      {
        title: 'Total Komisi',
        dataIndex: 'total_komisi',
        key: 'total_komisi',
        render: (val) => `Rp${formatDecimal(val)}`,
      },
      {
        title: 'Transaksi Terakhir',
        dataIndex: 'transaksi_terakhir',
        key: 'transaksi_terakhir',
        sorter: true,
        render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
      },
    ],
    []
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <RangePicker
          size="small"
          className="w-[300px] h-[40px]"
          value={rangeValue}
          onChange={onRangeChange}
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

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          onChange={handleTableChange}
          rowKey="user_id"
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

export default GoldBuySummaryUserTable;
