/* eslint-disable @typescript-eslint/no-explicit-any */

import { IReportGoldPhysic } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const { RangePicker } = DatePicker;

const StockEmasFisikTable = () => {
  const url = `/reports/gold-stock/physical`;
  const [dataTable, setDataTable] = useState<Array<IReportGoldPhysic>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // 🗓️ Default tanggal awal = tanggal 1 bulan aktif, akhir = hari ini
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  // 🧩 Params utama
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    search: '', // 🔹 Tambahan param pencarian
  });

  const [searchText, setSearchText] = useState(''); // nilai input pencarian

  const columns = useMemo<ColumnsType<IReportGoldPhysic>>(
    () => [
      {
        title: 'Tanggal',
        dataIndex: 'date',
        key: 'date',
        render: (_, record) => moment(record.date).format('DD-MM-YYYY'),
      },
      {
        title: 'Tipe',
        dataIndex: 'movement_type',
        key: 'movement_type',
      },
      {
        title: 'Note',
        dataIndex: 'note',
        key: 'note',
      },
      {
        title: 'Update User',
        dataIndex: 'user_name',
        key: 'user_name',
      },
      {
        title: 'Update Time',
        dataIndex: 'date',
        key: 'date',
        render: (_, record) => moment(record.date).format('HH:mm'),
      },
      {
        title: 'Debet',
        dataIndex: 'debet',
        key: 'debet',
        render: (_, record) => (
          <>
            {record.weight_debet !== null
              ? `${formatDecimal(parseFloat(record.weight_debet))} Gram`
              : '-'}
          </>
        ),
      },
      {
        title: 'Credit',
        dataIndex: 'credit',
        key: 'credit',
        render: (_, record) => (
          <>
            {record.weight_credit !== null
              ? `${formatDecimal(parseFloat(record.weight_credit))} Gram`
              : '-'}
          </>
        ),
      },
      {
        title: 'Saldo Akhir',
        dataIndex: 'stock_after',
        key: 'stock_after',
        render: (_, record) =>
          record.stock_after != null
            ? `${formatDecimal(record.stock_after)} Gram`
            : '-',
      },
    ],
    []
  );

  // 🔹 Fetch data dari API
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (err) {
      console.error('Fetch failed:', err);
      setDataTable([]);
      setTotal(0);
    }
  }, [params, url]);

  // 🔹 Pagination handler
  const onChangePage = (val: number) => {
    setParams((prev) => ({ ...prev, offset: (val - 1) * prev.limit }));
  };

  // 🔹 Range tanggal handler
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

  // 🔹 Debounce pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        offset: 0,
        search: searchText.trim(),
      }));
    }, 500); // delay 500ms

    return () => clearTimeout(handler);
  }, [searchText]);

  // 🔹 Fetch data setiap kali params berubah
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🔹 Export Excel
  const fetchAllData = async (url: string, params: any) => {
    const limit = 100;
    const firstResp = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    const totalCount = firstResp.data.count;
    const totalPages = Math.ceil(totalCount / limit);
    const allRows = [...firstResp.data.results];

    const requests = [];
    for (let i = 1; i < totalPages; i++) {
      requests.push(
        axiosInstance.get(url, {
          params: { ...params, limit, offset: i * limit },
        })
      );
    }

    const responses = await Promise.all(requests);
    responses.forEach((r) => allRows.push(...r.data.results));

    return allRows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData(url, params);

      const dataToExport = rows.map((item: IReportGoldPhysic) => ({
        Tanggal: dayjs(item.date).format('DD-MM-YYYY'),
        Note: item.note,
        Tipe: item.movement_type,
        'Update User': item.user_name,
        'Update Time': dayjs(item.date).format('HH:mm'),
        Debit:
          item.weight_debet !== null
            ? `${formatDecimal(parseFloat(item.weight_debet))} Gram`
            : '-',
        Credit:
          item.weight_credit !== null
            ? `${formatDecimal(parseFloat(item.weight_credit))} Gram`
            : '-',
        'Saldo Akhir': `${formatDecimal(item.stock_after)} Gram`,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Stock Emas Fisik');

      worksheet.mergeCells('A1:H1');
      worksheet.getCell('A1').value = 'LAPORAN EMAS STOCK FISIK';
      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A2:H2');
        worksheet.getCell('A2').value = `Periode: ${dayjs(
          params.start_date
        ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
          'DD-MM-YYYY'
        )}`;
      }

      worksheet.addRow([]);
      const header = Object.keys(dataToExport[0]);
      const headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      dataToExport.forEach((row: any) => {
        const rowValues = header.map((key) => row[key as keyof typeof row]);
        worksheet.addRow(rowValues);
      });

      worksheet.columns.forEach((col: any) => {
        if (col) {
          let maxLength = 0;
          col.eachCell({ includeEmpty: true }, (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength) maxLength = val.length;
          });
          col.width = Math.min(Math.max(maxLength + 2, 10), 30);
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_stock_emas_fisik_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
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

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="id"
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

export default StockEmasFisikTable;
