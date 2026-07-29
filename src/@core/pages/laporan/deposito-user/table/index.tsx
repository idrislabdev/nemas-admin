'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { IGoldInvestmentSummary, IUser } from '@/@core/@types/interface';
import { debounce } from 'lodash';

const { RangePicker } = DatePicker;

const GoldInvestmentUserTable: React.FC = () => {
  const url = `/reports/gold-investment/summary-user`;

  // 🔹 Default tanggal awal bulan hingga hari ini
  const defaultStart = useMemo(() => dayjs().startOf('month'), []);
  const defaultEnd = useMemo(() => dayjs(), []);

  const [dataTable, setDataTable] = useState<Array<IGoldInvestmentSummary>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '',
  });

  const [searchText, setSearchText] = useState('');

  // 🔹 Columns
  const columns: ColumnsType<IGoldInvestmentSummary> = [
    {
      title: 'Nomor Anggota',
      dataIndex: 'investor_member_number',
      key: 'investor_member_number',
      width: 160,
    },
    {
      title: 'Nama Investor',
      dataIndex: 'investor_name',
      key: 'investor_name',
      width: 180,
    },
    {
      title: 'Jumlah Transaksi',
      dataIndex: 'jumlah_transaksi',
      key: 'jumlah_transaksi',
      width: 150,
      align: 'right',
      render: (val) => formatDecimal(val),
    },
    {
      title: 'Total Berat Investasi (Gram)',
      dataIndex: 'total_invested_weight',
      key: 'total_invested_weight',
      width: 200,
      align: 'right',

      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Total Nominal Investasi (Rp)',
      dataIndex: 'total_invested_amount',
      key: 'total_invested_amount',
      width: 220,
      align: 'right',
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Total Berat Return (Gram)',
      dataIndex: 'total_return_weight',
      key: 'total_return_weight',
      width: 200,
      align: 'right',
      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Total Berat Aktif (Gram)',
      dataIndex: 'total_active_weight',
      key: 'total_active_weight',
      width: 200,
      align: 'right',
      render: (val) => `${formatDecimal(val)} Gram`,
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results || []);
      setTotal(resp.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch table data:', err);
    }
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams((prev) => ({ ...prev, offset: (val - 1) * prev.limit }));
  };

  const onRangeChange = (
    _dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      start_date: dateStrings[0] || '',
      end_date: dateStrings[1] || '',
    }));
  };

  // 🔹 Debounced search handler dengan useMemo
  const debouncedSetSearch = useMemo(
    () =>
      debounce((val: string) => {
        setParams((prev) => ({ ...prev, offset: 0, search: val }));
      }, 500),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchText);
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [searchText, debouncedSetSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchAllData = async (fetchUrl: string, currentParams: any) => {
    let allRows: IGoldInvestmentSummary[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(fetchUrl, {
      params: { ...currentParams, limit, offset: 0 },
    });

    allRows = allRows.concat(firstResp.data.results || []);
    const totalCount = firstResp.data.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;
      const resp = await axiosInstance.get(fetchUrl, {
        params: { ...currentParams, limit, offset },
      });
      allRows = allRows.concat(resp.data.results || []);
      await new Promise((r) => setTimeout(r, 100));
    }

    return allRows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');
      const rows = await fetchAllData(url, params);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = user?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Investasi Emas');
      const totalColumns = 7;

      // =============================
      // TITLE & METADATA
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN INVESTASI EMAS - PER INVESTOR';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF0057B7' } };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${user?.name || '-'}`;

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
        'Nomor Anggota',
        'Nama Investor',
        'Jumlah Transaksi',
        'Total Berat Investasi (Gram)',
        'Total Nominal Investasi (Rp)',
        'Total Berat Return (Gram)',
        'Total Berat Aktif (Gram)',
      ];

      const headerRow = worksheet.addRow(header);
      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' },
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
      const numberFormat = '#,##0';

      // =============================
      // DATA ROWS
      // =============================
      rows.forEach((item, index) => {
        const rowValues = [
          item.investor_member_number || '-',
          item.investor_name || '-',
          Number(item.jumlah_transaksi || 0),
          Number(item.total_invested_weight || 0),
          Number(item.total_invested_amount || 0),
          Number(item.total_return_weight || 0),
          Number(item.total_active_weight || 0),
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
            case 1: // Nomor Anggota
              horizontal = 'center';
              break;

            case 3: // Jumlah Transaksi
              horizontal = 'right';
              cell.numFmt = numberFormat;
              break;

            case 4: // Total Berat Investasi
            case 6: // Total Berat Return
            case 7: // Total Berat Aktif
              horizontal = 'right';
              cell.numFmt = weightFormat;
              break;

            case 5: // Total Nominal Investasi
              horizontal = 'right';
              cell.numFmt = currencyFormat;
              break;

            default: // Nama Investor
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
        { formula: `SUM(C${startRow}:C${endRow})` },
        { formula: `SUM(D${startRow}:D${endRow})` },
        { formula: `SUM(E${startRow}:E${endRow})` },
        { formula: `SUM(F${startRow}:F${endRow})` },
        { formula: `SUM(G${startRow}:G${endRow})` },
      ]);

      const totalRowNumber = totalRow.number;
      worksheet.mergeCells(`A${totalRowNumber}:B${totalRowNumber}`);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) {
          horizontal = 'center';
        } else if (colNumber >= 3 && colNumber <= 7) {
          horizontal = 'right';
        }

        // Format NumFmt pada Total
        if (colNumber === 3) cell.numFmt = numberFormat;
        if (colNumber === 4 || colNumber === 6 || colNumber === 7) {
          cell.numFmt = weightFormat;
        }
        if (colNumber === 5) cell.numFmt = currencyFormat;

        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF59D' },
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

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[defaultStart, defaultEnd]}
          />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 h-[40px] w-[250px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <button className="btn !h-[40px] btn-primary" onClick={exportData}>
          <FileDownload02 />
          Export Excel
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
          rowKey="investor_id"
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

export default GoldInvestmentUserTable;
