/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react';
import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
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

export interface IReportWalletDisburst {
  disburst_transaction_id: string;
  disburst_timestamp: string;
  user_id: string;
  user_name: string;
  user_member_number: string;
  disburst_number: string;
  disburst_payment_bank_number: string;
  disburst_payment_bank_code: string;
  disburst_payment_bank_account_holder_name: string;
  disburst_total_amount: number;
  disburst_admin: number;
  disburst_amount: number;
  disburst_status: string;
  disburst_payment_ref: string;
}

const WalletDisburstTable = () => {
  const url = `/reports/wallet-disburst`;

  const [dataTable, setDataTable] = useState<IReportWalletDisburst[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // 🧭 Default tanggal awal = 1 bulan aktif, akhir = hari ini
  const startOfMonth = dayjs().startOf('month');
  const today = dayjs();

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth.format('YYYY-MM-DD'),
    end_date: today.format('YYYY-MM-DD'),
  });

  const columns: ColumnsType<IReportWalletDisburst> = [
    {
      title: 'Tanggal',
      dataIndex: 'disburst_timestamp',
      key: 'disburst_timestamp',
      width: 180,
      render: (_, record) =>
        moment(record.disburst_timestamp).format('DD MMMM YYYY HH:mm'),
    },
    {
      title: 'Nomor Disburst',
      dataIndex: 'disburst_number',
      key: 'disburst_number',
      width: 200,
    },
    {
      title: 'Nama User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 200,
    },
    {
      title: 'Nomor Member',
      dataIndex: 'user_member_number',
      key: 'user_member_number',
      width: 180,
    },
    {
      title: 'Kode Bank',
      dataIndex: 'disburst_payment_bank_code',
      key: 'disburst_payment_bank_code',
      width: 100,
    },
    {
      title: 'Nomor Rekening',
      dataIndex: 'disburst_payment_bank_number',
      key: 'disburst_payment_bank_number',
      width: 180,
    },
    {
      title: 'Nama Pemilik Rekening',
      dataIndex: 'disburst_payment_bank_account_holder_name',
      key: 'disburst_payment_bank_account_holder_name',
      width: 220,
    },
    {
      title: 'Nominal Disburst',
      dataIndex: 'disburst_amount',
      key: 'disburst_amount',
      width: 180,
      render: (_, record) =>
        record.disburst_amount
          ? `Rp${formatDecimal(parseFloat(record.disburst_amount.toString()))}`
          : '-',
    },
    {
      title: 'Admin Fee',
      dataIndex: 'disburst_admin',
      key: 'disburst_admin',
      width: 150,
      render: (_, record) =>
        record.disburst_admin
          ? `Rp${formatDecimal(parseFloat(record.disburst_admin.toString()))}`
          : '-',
    },
    {
      title: 'Total Disburst',
      dataIndex: 'disburst_total_amount',
      key: 'disburst_total_amount',
      width: 180,
      render: (_, record) =>
        record.disburst_total_amount
          ? `Rp${formatDecimal(
              parseFloat(record.disburst_total_amount.toString())
            )}`
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'disburst_status',
      key: 'disburst_status',
      width: 150,
    },
    {
      title: 'Kode Referensi',
      dataIndex: 'disburst_payment_ref',
      key: 'disburst_payment_ref',
      width: 200,
    },
  ];

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = (val: number) => {
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
      const offset = i * limit;
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset },
      });
      allRows = allRows.concat(resp.data.results);
      await new Promise((r) => setTimeout(r, 150));
    }

    return allRows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);
      const param = { ...params, offset: 0, limit: 10 };
      const rows = await fetchAllData(url, param);

      if (rows.length === 0) {
        setIsModalLoading(false);
        return;
      }

      const dataToExport = rows.map((item: IReportWalletDisburst) => ({
        'Tanggal Transaksi': moment(item.disburst_timestamp).format(
          'DD MMMM YYYY HH:mm'
        ),
        'Nomor Disburst': item.disburst_number,
        'Nama User': item.user_name,
        'Nomor Member': item.user_member_number,
        'Kode Bank': item.disburst_payment_bank_code,
        'Nomor Rekening': item.disburst_payment_bank_number,
        'Nama Pemilik Rekening': item.disburst_payment_bank_account_holder_name,
        'Nominal Disburst': `Rp${formatDecimal(
          parseFloat(item.disburst_amount.toString())
        )}`,
        'Admin Fee': `Rp${formatDecimal(
          parseFloat(item.disburst_admin.toString())
        )}`,
        'Total Disburst': `Rp${formatDecimal(
          parseFloat(item.disburst_total_amount.toString())
        )}`,
        Status: item.disburst_status,
        'Kode Referensi': item.disburst_payment_ref,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Disburst Wallet');

      // 🔹 Header rata kiri
      worksheet.mergeCells('A1:L1');
      worksheet.getCell('A1').value = 'LAPORAN DISBURST WALLET';
      worksheet.getCell('A1').alignment = { horizontal: 'left' };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      worksheet.mergeCells('A2:L2');
      worksheet.getCell('A2').value = `Periode: ${dayjs(
        params.start_date
      ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
        'DD-MM-YYYY'
      )}`;
      worksheet.getCell('A2').alignment = { horizontal: 'left' };

      worksheet.addRow([]);

      const header = Object.keys(dataToExport[0]);
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

      dataToExport.forEach((row) => {
        const values = header.map((key) => row[key as keyof typeof row] ?? '');
        const newRow = worksheet.addRow(values);
        newRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.alignment = { vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // 🔹 Auto fit column width (maksimal 40 karakter)
      worksheet.columns.forEach((col: any) => {
        let maxLength = 0;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';
          if (val.length > maxLength) maxLength = val.length;
        });
        col.width = Math.min(maxLength + 2, 40);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_disburst_wallet_${dayjs().format(
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
          value={[dayjs(params.start_date), dayjs(params.end_date)]}
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
          className="table-basic"
          rowKey="disburst_transaction_id"
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

export default WalletDisburstTable;
