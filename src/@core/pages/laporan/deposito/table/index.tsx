/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldInvestmentReport } from '@/@core/@types/interface';
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

const GoldInvestmentTable = () => {
  const url = `/reports/gold-investment/list`;

  // 🔹 default tanggal: awal bulan hingga hari ini
  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();

  const [dataTable, setDataTable] = useState<Array<IGoldInvestmentReport>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '', // 🔹 Tambahkan parameter pencarian
  });

  const [searchText, setSearchText] = useState(''); // 🔹 State input pencarian

  const columns: ColumnsType<IGoldInvestmentReport> = [
    {
      title: 'Nomor Transaksi',
      dataIndex: 'transaction_number',
      key: 'transaction_number',
      width: 150,
    },
    {
      title: 'Tanggal',
      dataIndex: 'date_invested',
      key: 'date_invested',
      width: 150,
      render: (_, record) =>
        moment(record.date_invested).format('DD MMMM YYYY'),
    },
    {
      title: 'Tanggal Return',
      dataIndex: 'date_returned',
      key: 'date_returned',
      width: 150,
      render: (_, record) =>
        moment(record.date_returned).format('DD MMMM YYYY'),
    },
    {
      title: 'Return Investasi',
      dataIndex: 'investment_return',
      key: 'investment_return',
      width: 150,
      render: (_, record) => record.investment_return?.name,
    },
    {
      title: 'Nama Investor',
      dataIndex: 'investor_name',
      key: 'investor_name',
      width: 150,
    },
    {
      title: 'Nominal Investasi',
      dataIndex: 'amount_invested',
      key: 'amount_invested',
      width: 170,
      render: (_, record) =>
        record.amount_invested
          ? `Rp${formatDecimal(parseFloat(record.amount_invested.toString()))}`
          : '-',
    },
    {
      title: 'Berat Investasi',
      dataIndex: 'weight_invested',
      key: 'weight_invested',
      width: 150,
      render: (_, record) =>
        record.weight_invested
          ? `${formatDecimal(
              parseFloat(record.weight_invested.toString())
            )} Gram`
          : '-',
    },
    {
      title: 'Nominal Return',
      dataIndex: 'return_amount',
      key: 'return_amount',
      width: 150,
      render: (_, record) =>
        record.return_amount
          ? `Rp${formatDecimal(parseFloat(record.return_amount.toString()))}`
          : '-',
    },
    {
      title: 'Berat Return',
      dataIndex: 'return_weight',
      key: 'return_weight',
      width: 150,
      render: (_, record) =>
        record.return_weight
          ? `${formatDecimal(parseFloat(record.return_weight.toString()))} Gram`
          : '-',
    },
    {
      title: 'Status Return',
      dataIndex: 'is_returned',
      key: 'is_returned',
      width: 120,
      fixed: 'right',
      render: (_, record) => (record.is_returned ? 'Sudah' : 'Belum'),
    },
    {
      title: 'Status Transaksi',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      fixed: 'right',
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

  // 🔹 Debounce untuk search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        offset: 0,
        search: searchText.trim(),
      }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

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

      const rows = await fetchAllData(url, params);

      const dataToExport = rows.map((item: IGoldInvestmentReport) => ({
        'Nomor Transaksi': item.transaction_number,
        'Tanggal Transaksi': moment(item.date_invested).format('DD MMMM YYYY'),
        'Tanggal Return': moment(item.date_returned).format('DD MMMM YYYY'),
        'Return Investasi': item.investment_return?.name || '-',
        'Nama Investor': item.investor_name,
        'Nominal Investasi': parseFloat(
          item.amount_invested?.toString() || '0'
        ),
        'Berat Investasi': parseFloat(item.weight_invested?.toString() || '0'),
        'Nominal Return': parseFloat(item.return_amount?.toString() || '0'),
        'Berat Return': parseFloat(item.return_weight?.toString() || '0'),
        'Status Return': item.is_returned ? 'Sudah' : 'Belum',
        'Status Transaksi': item.status,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Investasi Emas');

      // Judul laporan
      worksheet.mergeCells('A1:K1');
      worksheet.getCell('A1').value = 'LAPORAN INVESTASI EMAS';
      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      // Periode
      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A2:K2');
        worksheet.getCell('A2').value = `Periode: ${dayjs(
          params.start_date
        ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
          'DD-MM-YYYY'
        )}`;
        worksheet.getCell('A2').alignment = { horizontal: 'left' };
      }

      worksheet.addRow([]);

      // Header
      const header = Object.keys(dataToExport[0]);
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
          fgColor: { argb: 'FFE5E5E5' },
        };
      });

      // Data rows
      dataToExport.forEach((row) => {
        const rowValues = header.map((key) => {
          const val = row[key as keyof typeof row];
          // Format nominal dan berat dengan Rp/Gram di tampilan Excel
          if (typeof val === 'number') {
            if (key.toLowerCase().includes('nominal'))
              return `Rp${formatDecimal(val)}`;
            if (key.toLowerCase().includes('berat'))
              return `${formatDecimal(val)} Gram`;
          }
          return val ?? '-';
        });
        const newRow = worksheet.addRow(rowValues);
        newRow.eachCell((cell, colNumber) => {
          const headerName = header[colNumber - 1];
          // Nominal rata kanan
          if (
            headerName.toLowerCase().includes('nominal') ||
            headerName.toLowerCase().includes('berat')
          ) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else {
            cell.alignment = { vertical: 'middle' };
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // === 🔹 Hitung total untuk kolom nominal ===
      const totalNominalInvestasi = rows.reduce(
        (acc, cur) => acc + parseFloat(cur.amount_invested?.toString() || '0'),
        0
      );
      const totalBeratInvestasi = rows.reduce(
        (acc, cur) => acc + parseFloat(cur.weight_invested?.toString() || '0'),
        0
      );
      const totalNominalReturn = rows.reduce(
        (acc, cur) => acc + parseFloat(cur.return_amount?.toString() || '0'),
        0
      );
      const totalBeratReturn = rows.reduce(
        (acc, cur) => acc + parseFloat(cur.return_weight?.toString() || '0'),
        0
      );

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        '',
        '',
        '',
        `Rp${formatDecimal(totalNominalInvestasi)}`,
        `${formatDecimal(totalBeratInvestasi)} Gram`,
        `Rp${formatDecimal(totalNominalReturn)}`,
        `${formatDecimal(totalBeratReturn)} Gram`,
        '',
        '',
      ]);

      totalRow.eachCell((cell, colNumber) => {
        const headerName = header[colNumber - 1];
        cell.font = { bold: true };
        if (
          headerName?.toLowerCase().includes('nominal') ||
          headerName?.toLowerCase().includes('berat')
        ) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Auto width
      worksheet.columns.forEach((col) => {
        if (!col) return; // pastikan col tidak undefined
        let maxLength = 0;

        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, val.length);
        });

        col.width = Math.min(maxLength + 2, 40);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_investasi_emas_${dayjs().format(
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
      {/* 🔹 Bagian filter dan search */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[defaultStart, defaultEnd]}
          />

          {/* 🔍 Input search */}
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm font-normal text-neutral-700 w-[220px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          className="btn btn-primary !h-[40px] flex items-center gap-2"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />
          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
        </button>
      </div>

      {/* 🔹 Tabel dan pagination */}
      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="transaction_id"
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

export default GoldInvestmentTable;
