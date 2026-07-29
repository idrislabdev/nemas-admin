'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useState } from 'react';
import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
import { IUser } from '@/@core/@types/interface';

moment.locale('id');

const { RangePicker } = DatePicker;

interface ISellerCommission {
  id: string;
  member_number: string;
  nama_toko: string;
  user_name: string;
  user_email: string;
  unique_code: string;
  transaction_number: string;
  total_price: string;
  transaction_datetime: string;
  weight: string;
  commission_amount: number;
}

const SellerCommissionListPage = () => {
  const url = '/reports/seller-commission/list';

  // 📅 default 1 bulan berjalan
  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<ISellerCommission[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart,
    end_date: defaultEnd,
    search: '',
  });

  // 🔎 debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

  const columns: ColumnsType<ISellerCommission> = [
    {
      title: 'No Transaksi',
      dataIndex: 'transaction_number',
      width: 160,
      align: 'left',
    },
    {
      title: 'Tanggal Transaksi',
      dataIndex: 'transaction_datetime',
      width: 180,
      align: 'center',
      render: (v) => (v ? dayjs(v).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: 'Member No',
      dataIndex: 'member_number',
      width: 130,
      align: 'left',
    },
    {
      title: 'Nama Toko',
      dataIndex: 'nama_toko',
      width: 180,
      align: 'left',
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      width: 150,
      align: 'left',
    },
    {
      title: 'Email',
      dataIndex: 'user_email',
      width: 200,
      align: 'left',
    },
    {
      title: 'Kode Unik',
      dataIndex: 'unique_code',
      width: 120,
      align: 'center',
    },
    {
      title: 'Berat (Gram)',
      dataIndex: 'weight',
      width: 140,
      align: 'right',
      render: (v) => `${formatDecimal(Number(v || 0))} Gram`,
    },
    {
      title: 'Total Harga',
      dataIndex: 'total_price',
      width: 160,
      align: 'right',
      render: (v) => `Rp${formatDecimal(Number(v || 0))}`,
    },
    {
      title: 'Fee Toko',
      dataIndex: 'commission_amount',
      width: 160,
      align: 'right',
      fixed: 'right',
      render: (v) => `Rp${formatDecimal(Number(v || 0))}`,
    },
  ];

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onChangePage = (page: number) => {
    setParams({ ...params, offset: (page - 1) * params.limit });
  };

  const onRangeChange = (_: null | (Dayjs | null)[], dateStrings: string[]) => {
    setParams({
      ...params,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  // ================= EXPORT =================

  const fetchAllData = async () => {
    let rows: any[] = [];
    const limit = 100;

    const first = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    rows = rows.concat(first.data.results);
    const totalPages = Math.ceil(first.data.count / limit);

    for (let i = 1; i < totalPages; i++) {
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset: i * limit },
      });
      rows = rows.concat(resp.data.results);
    }

    return rows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      let user: IUser | Record<string, any> = {};
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        user = {};
      }

      const rows = await fetchAllData();
      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = (user as IUser)?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Detail Fee Toko');
      const totalColumns = 10;

      // =============================
      // TITLE & METADATA (Row 1 - 6)
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN DETAIL FEE TOKO';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF0057B7' } };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${(user as IUser)?.name || '-'}`;

      worksheet.getCell('A4').value = 'Tanggal Export';
      worksheet.getCell('B4').value =
        `: ${dayjs().format('DD MMMM YYYY HH:mm:ss')}`;

      worksheet.getCell('A5').value = 'Total Data';
      worksheet.getCell('B5').value = `: ${rows.length}`;

      const periodeText =
        params?.start_date && params?.end_date
          ? `${dayjs(params.start_date).format('DD MMMM YYYY')} s/d ${dayjs(
              params.end_date
            ).format('DD MMMM YYYY')}`
          : '-';

      worksheet.getCell('A6').value = 'Periode';
      worksheet.getCell('B6').value = `: ${periodeText}`;

      ['A3', 'A4', 'A5', 'A6'].forEach((cell) => {
        worksheet.getCell(cell).font = { bold: true };
      });

      worksheet.addRow([]); // Baris kosong (Row 7)

      // =============================
      // HEADER TABEL (Row 8)
      // =============================
      const header = [
        'No Transaksi',
        'Tanggal Transaksi',
        'Member No',
        'Nama Toko',
        'User',
        'Email',
        'Kode Unik',
        'Berat (Gram)',
        'Total Harga',
        'Fee Toko',
      ];

      const headerRow = worksheet.addRow(header);
      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' }, // Biru Utama
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Native Excel Formats
      const currencyFormat = '"Rp"#,##0;("Rp"#,##0);"-"';
      const weightFormat = '#,##0.00" Gram"';

      // =============================
      // DATA ROWS (Row 9+)
      // =============================
      rows.forEach((item: ISellerCommission, index: number) => {
        const rowValues = [
          item.transaction_number || '-',
          item.transaction_datetime
            ? dayjs(item.transaction_datetime).format('DD MMM YYYY HH:mm')
            : '-',
          item.member_number || '-',
          item.nama_toko || '-',
          item.user_name || '-',
          item.user_email || '-',
          item.unique_code || '-',
          Number(item.weight || 0),
          Number(item.total_price || 0),
          Number(item.commission_amount || 0),
        ];

        const newRow = worksheet.addRow(rowValues);

        // Zebra Striping
        if (index % 2 === 1) {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FBFF' },
            };
          });
        }

        newRow.eachCell((cell, colNumber) => {
          let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

          switch (colNumber) {
            case 2: // Tanggal Transaksi
            case 7: // Kode Unik
              horizontal = 'center';
              break;

            case 8: // Berat
              horizontal = 'right';
              cell.numFmt = weightFormat;
              break;

            case 9: // Total Harga
            case 10: // Fee Toko
              horizontal = 'right';
              cell.numFmt = currencyFormat;
              break;

            default:
              horizontal = 'left';
          }

          cell.alignment = { horizontal, vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // =============================
      // TOTAL ROW
      // =============================
      const startRow = 9;
      const endRow = 8 + rows.length;

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        '',
        '',
        '',
        '',
        '',
        { formula: `SUM(H${startRow}:H${endRow})` }, // Total Berat
        { formula: `SUM(I${startRow}:I${endRow})` }, // Total Harga
        { formula: `SUM(J${startRow}:J${endRow})` }, // Total Fee Toko
      ]);

      const totalRowNumber = totalRow.number;
      worksheet.mergeCells(`A${totalRowNumber}:G${totalRowNumber}`);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) horizontal = 'center';
        else if (colNumber >= 8 && colNumber <= 10) {
          horizontal = 'right';
        }

        // Format NumFmt pada Total
        if (colNumber === 8) cell.numFmt = weightFormat;
        if (colNumber === 9 || colNumber === 10) cell.numFmt = currencyFormat;

        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF59D' }, // Kuning Highlight
        };
        cell.alignment = { horizontal, vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // =============================
      // FREEZE, FILTER & AUTO WIDTH
      // =============================
      worksheet.views = [{ state: 'frozen', ySplit: 8 }];
      worksheet.autoFilter = {
        from: { row: 8, column: 1 },
        to: { row: 8, column: totalColumns },
      };

      worksheet.columns.forEach((column: any, colIdx: number) => {
        let maxLength = header[colIdx]?.length || 10;

        // Kalkulasi lebar hanya berdasarkan isi data & header tabel (Baris 8 ke bawah)
        column.eachCell({ includeEmpty: true }, (cell: any, rowNum: number) => {
          if (rowNum >= 8) {
            const val = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, val.length);
          }
        });

        column.width = Math.min(maxLength + 4, 35);
      });

      // =============================
      // SAVE FILE
      // =============================
      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `laporan_fee_toko_detail_${dayjs().format(
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
            onChange={onRangeChange}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari..."
            className="pl-8 pr-2 py-1.5 text-sm border rounded-md w-[200px]"
          />
        </div>

        <button className="btn btn-primary !h-[40px]" onClick={exportData}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="mt-3 border rounded">
        <Table
          columns={columns}
          dataSource={dataTable}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
        />
        <div className="flex justify-end p-3">
          <Pagination
            total={total}
            pageSize={params.limit}
            onChange={onChangePage}
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

export default SellerCommissionListPage;
