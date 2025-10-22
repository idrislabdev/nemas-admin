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
import { IReportWalletTopupSummary } from '@/@core/@types/interface';
moment.locale('id');

const { RangePicker } = DatePicker;

const WalletTopupSummaryTable = () => {
  const url = `/reports/wallet-topup/summary`;

  // 🗓️ Default tanggal awal = tanggal 1 bulan aktif, akhir = hari ini
  const firstDay = dayjs().startOf('month');
  const today = dayjs();

  const [dataTable, setDataTable] = useState<IReportWalletTopupSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: firstDay.format('YYYY-MM-DD'),
    end_date: today.format('YYYY-MM-DD'),
  });

  // 🧱 Kolom tabel
  const columns: ColumnsType<IReportWalletTopupSummary> = [
    {
      title: 'Nama User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 250,
    },
    {
      title: 'Jumlah Transaksi',
      dataIndex: 'jumlah_transaksi',
      key: 'jumlah_transaksi',
      width: 180,
      render: (val) => val?.toLocaleString('id-ID'),
    },
    {
      title: 'Total Topup',
      dataIndex: 'total_topup',
      key: 'total_topup',
      width: 180,
      render: (val) =>
        val ? `Rp${formatDecimal(parseFloat(val.toString()))}` : '-',
    },
    {
      title: 'Total Diterima',
      dataIndex: 'total_diterima',
      key: 'total_diterima',
      width: 180,
      render: (val) =>
        val ? `Rp${formatDecimal(parseFloat(val.toString()))}` : '-',
    },
  ];

  // 🧭 Ambil data dari API
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
      limit: 10,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  // 🧾 Ambil semua data untuk ekspor
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

  // 📦 Ekspor ke Excel
  const exportData = async () => {
    try {
      setIsModalLoading(true);
      const param = { ...params, offset: 0, limit: 10 };
      const rows = await fetchAllData(url, param);

      if (rows.length === 0) {
        setIsModalLoading(false);
        return;
      }

      const dataToExport = rows.map((item: IReportWalletTopupSummary) => ({
        'Nama User': item.user_name,
        'Jumlah Transaksi': item.jumlah_transaksi,
        'Total Topup': `Rp${formatDecimal(
          parseFloat(item.total_topup.toString())
        )}`,
        'Total Diterima': `Rp${formatDecimal(
          parseFloat(item.total_diterima.toString())
        )}`,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Summary Topup Wallet');

      // 🧾 Judul rata kiri
      worksheet.mergeCells('A1:D1');
      worksheet.getCell('A1').value = 'LAPORAN RINGKASAN TOPUP WALLET';
      worksheet.getCell('A1').alignment = { horizontal: 'left' };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      // 📅 Periode rata kiri
      worksheet.mergeCells('A2:D2');
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

      // 🔧 Border + auto-fit width
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

      // 🧩 Auto-fit column width
      worksheet.columns.forEach((col: any) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';
          if (val.length > maxLength) maxLength = val.length;
        });
        col.width = Math.min(maxLength + 2, 50); // batasi lebar max
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_ringkasan_topup_wallet_${dayjs().format(
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
          size={'small'}
          className="w-[300px] h-[40px]"
          onChange={onRangeChange}
          defaultValue={[firstDay, today]}
        />
        <button className="btn btn-primary" onClick={exportData}>
          <FileDownload02 />
          Export Excel
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
          rowKey="user_id"
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

export default WalletTopupSummaryTable;
