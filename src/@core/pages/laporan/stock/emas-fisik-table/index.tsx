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
        align: 'right',
        render: (_, record) =>
          record.weight_debet !== null
            ? `${formatDecimal(parseFloat(record.weight_debet))} Gram`
            : '-',
      },
      {
        title: 'Credit',
        dataIndex: 'credit',
        key: 'credit',
        align: 'right',
        render: (_, record) =>
          record.weight_credit !== null
            ? `${formatDecimal(parseFloat(record.weight_credit))} Gram`
            : '-',
      },
      {
        title: 'Saldo Akhir',
        dataIndex: 'stock_after',
        key: 'stock_after',
        align: 'right',
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

      const dataToExport = rows.map(
        (item: IReportGoldPhysic, index: number) => ({
          No: index + 1,
          Tanggal: dayjs(item.date).format('DD-MM-YYYY'),
          Tipe: item.movement_type,
          Note: item.note || '-',
          'Update User': item.user_name || '-',
          'Update Time': dayjs(item.date).format('HH:mm'),
          Debit:
            item.weight_debet !== null
              ? `${formatDecimal(parseFloat(item.weight_debet))} Gram`
              : '-',
          Credit:
            item.weight_credit !== null
              ? `${formatDecimal(parseFloat(item.weight_credit))} Gram`
              : '-',
          'Saldo Akhir':
            item.stock_after != null
              ? `${formatDecimal(item.stock_after)} Gram`
              : '-',
        })
      );

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';
      workbook.company = 'NEMAS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Stock Emas Fisik');

      const exportedBy = getExportedBy();
      const exportedAt = dayjs().format('DD MMMM YYYY HH:mm:ss');

      const totalColumns = Object.keys(dataToExport[0]).length;
      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // =============================
      // Title
      // =============================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN STOK EMAS FISIK';

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
      worksheet.getCell('B3').value = `: ${exportedBy}`;

      worksheet.getCell('A4').value = 'Diexport Pada';
      worksheet.getCell('B4').value = `: ${exportedAt}`;

      worksheet.getCell('A5').value = 'Total Data';
      worksheet.getCell('B5').value = `: ${rows.length}`;

      if (params.start_date && params.end_date) {
        worksheet.getCell('A6').value = 'Periode';
        worksheet.getCell('B6').value = `: ${dayjs(params.start_date).format(
          'DD-MM-YYYY'
        )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;
      }

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

        // Zebra Row
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

            case 2: // Tanggal
              horizontal = 'center';
              break;

            case 6: // Update Time
              horizontal = 'center';
              break;

            case 7: // Debit
            case 8: // Credit
            case 9: // Saldo Akhir
              horizontal = 'right';
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
            className="w-[320px] h-[40px]"
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

      <div className="flex flex-col  rounded-tr-[8px] rounded-tl-[8px]">
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
