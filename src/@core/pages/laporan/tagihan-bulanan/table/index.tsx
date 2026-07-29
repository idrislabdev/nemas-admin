'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Select, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';

import { ITagihanBulanan, IUser } from '@/@core/@types/interface';

moment.locale('id');

const { RangePicker } = DatePicker;

const TagihanBulananTablePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const url = `/reports/gold-monthly-cost/list`;

  // ============================
  // Ambil Query URL
  // ============================

  const queryStart = searchParams.get('start_date');
  const queryEnd = searchParams.get('end_date');
  const queryStatus = searchParams.get('is_paid');
  const queryPage = Number(searchParams.get('page') || 1);

  // const defaultStart = queryStart ? dayjs(queryStart) : null;
  // const defaultEnd = queryEnd ? dayjs(queryEnd) : null;

  const [statusPaid, setStatusPaid] = useState<any>(
    queryStatus === null ? null : queryStatus === 'true'
  );

  const [params, setParams] = useState<any>({
    offset: (queryPage - 1) * 10,
    limit: 10,
    start_date: queryStart || null,
    end_date: queryEnd || null,
    is_paid: queryStatus === null ? null : queryStatus === 'true',
    search: '',
  });

  const [dataTable, setDataTable] = useState<Array<ITagihanBulanan>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // ============================
  // Helper update query string
  // ============================

  const updateQueryString = (obj: Record<string, any>) => {
    const q = new URLSearchParams(searchParams.toString());

    Object.entries(obj).forEach(([key, val]) => {
      if (val === '' || val === null || val === undefined) {
        q.delete(key);
      } else {
        q.set(key, String(val));
      }
    });

    router.replace(`?${q.toString()}`);
  };

  // ============================
  // Fetch Data
  // ============================

  const fetchData = useCallback(async () => {
    const filteredParams = { ...params };

    if (filteredParams.is_paid === null) delete filteredParams.is_paid;
    if (!filteredParams.start_date) delete filteredParams.start_date;
    if (!filteredParams.end_date) delete filteredParams.end_date;

    const resp = await axiosInstance.get(url, {
      params: filteredParams,
    });

    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================
  // Pagination
  // ============================

  const onChangePage = (page: number) => {
    setParams((prev: any) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));

    updateQueryString({ page });
  };

  // ============================
  // Filter Date
  // ============================

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    const [start, end] = dateStrings;

    setParams((prev: any) => ({
      ...prev,
      start_date: start,
      end_date: end,
      offset: 0,
    }));

    updateQueryString({
      start_date: start,
      end_date: end,
      page: 1,
    });
  };

  // ============================
  // Filter Status
  // ============================

  const handleStatusChange = (val: any) => {
    setStatusPaid(val);

    setParams((prev: any) => ({
      ...prev,
      is_paid: val,
      offset: 0,
    }));

    updateQueryString({
      is_paid: val,
      page: 1,
    });
  };

  // ============================
  // Table Columns
  // ============================

  const columns: ColumnsType<ITagihanBulanan> = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      width: 160,
      align: 'left',
    },
    {
      title: 'Nama User',
      dataIndex: 'user_name',
      width: 180,
      align: 'left',
    },
    {
      title: 'Nomor HP',
      dataIndex: 'user_phone_number',
      width: 160,
      align: 'left',
    },
    {
      title: 'Tanggal Tagihan',
      dataIndex: 'monthly_cost_issue_date',
      width: 160,
      align: 'center',
      render: (val) => (val ? dayjs(val).format('DD MMM YYYY') : '-'),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      width: 100,
      align: 'center',
      render: (val) => formatDecimal(val),
    },
    {
      title: 'Biaya Bulanan',
      dataIndex: 'monthly_cost',
      width: 150,
      align: 'right',
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Berat Emas',
      dataIndex: 'gold_weight',
      width: 150,
      align: 'right',
      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Total Tagihan',
      dataIndex: 'total_cost',
      width: 180,
      align: 'right',
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Diskon',
      dataIndex: 'discount',
      width: 150,
      align: 'right',
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Status',
      dataIndex: 'is_paid',
      width: 130,
      align: 'center',
      render: (val) => (val ? 'Lunas' : 'Belum Lunas'),
    },
    {
      title: 'Periode',
      dataIndex: 'current_period',
      width: 150,
      align: 'center',
    },
  ];

  // ======================
  // Fetch All Data (Export)
  // ======================

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

  // ======================
  // Export Excel
  // ======================

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      let user: IUser | Record<string, any> = {};
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        user = {};
      }

      const exportParams: any = { ...params, offset: 0, limit: 1000 };

      if (exportParams.is_paid === null) delete exportParams.is_paid;
      if (!exportParams.start_date) delete exportParams.start_date;
      if (!exportParams.end_date) delete exportParams.end_date;

      const rows = await fetchAllData(url, exportParams);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = user?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Tagihan Bulanan');
      const totalColumns = 11;

      // =============================
      // TITLE & METADATA (Row 1 - 6)
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN TAGIHAN BULANAN';
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
        'Order Number',
        'Nama User',
        'Nomor HP',
        'Tanggal Tagihan',
        'Level',
        'Biaya Bulanan',
        'Berat Emas (gr)',
        'Total Tagihan',
        'Diskon',
        'Status',
        'Periode',
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

      // Format Asli Excel (Native Number Format)
      const currencyFormat = '"Rp"#,##0;("Rp"#,##0);"-"';
      const weightFormat = '#,##0.00" Gram"';

      // =============================
      // DATA ROWS (Row 9+)
      // =============================
      rows.forEach((item: ITagihanBulanan, index: number) => {
        const rowValues = [
          item.order_number || '-',
          item.user_name || '-',
          item.user_phone_number || '-',
          item.monthly_cost_issue_date
            ? dayjs(item.monthly_cost_issue_date).format('DD MMM YYYY')
            : '-',
          Number(item.level || 0),
          Number(item.monthly_cost || 0),
          Number(item.gold_weight || 0),
          Number(item.total_cost || 0),
          Number(item.discount || 0),
          item.is_paid ? 'Lunas' : 'Belum Lunas',
          item.current_period || '-',
        ];

        const newRow = worksheet.addRow(rowValues);

        // Zebra Striping (Selang-seling warna soft)
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
            case 4: // Tanggal Tagihan
            case 5: // Level
            case 10: // Status
            case 11: // Periode
              horizontal = 'center';
              break;

            case 7: // Berat Emas (gr)
              horizontal = 'right';
              cell.numFmt = weightFormat;
              break;

            case 6: // Biaya Bulanan
            case 8: // Total Tagihan
            case 9: // Diskon
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
        { formula: `SUM(F${startRow}:F${endRow})` }, // Biaya Bulanan
        { formula: `SUM(G${startRow}:G${endRow})` }, // Berat Emas
        { formula: `SUM(H${startRow}:H${endRow})` }, // Total Tagihan
        { formula: `SUM(I${startRow}:I${endRow})` }, // Diskon
        '',
        '',
      ]);

      const totalRowNumber = totalRow.number;
      worksheet.mergeCells(`A${totalRowNumber}:E${totalRowNumber}`);

      totalRow.eachCell((cell, colNumber) => {
        let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

        if (colNumber === 1) horizontal = 'center';
        else if (colNumber >= 6 && colNumber <= 9) {
          horizontal = 'right';
        }

        // Apply Format Angka pada Baris Total
        if (colNumber === 7) cell.numFmt = weightFormat;
        if (colNumber === 6 || colNumber === 8 || colNumber === 9) {
          cell.numFmt = currencyFormat;
        }

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

      const fileName = `laporan_tagihan_bulanan_${dayjs().format(
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
          {/* DATE FILTER */}
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            onChange={onRangeChange}
            value={
              params.start_date && params.end_date
                ? [dayjs(params.start_date), dayjs(params.end_date)]
                : null
            }
          />

          {/* STATUS FILTER */}
          <Select
            allowClear
            size="large"
            className="w-[180px]"
            placeholder="Status"
            value={statusPaid ?? undefined}
            onChange={handleStatusChange}
            options={[
              { value: true, label: 'Lunas' },
              { value: false, label: 'Belum Lunas' },
            ]}
          />
        </div>

        <button className="btn !h-[40px] btn-primary" onClick={exportData}>
          <FileDownload02 /> Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-lg mt-3">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          rowKey="id"
        />

        <div className="flex justify-end p-[12px]">
          <Pagination
            current={params.offset / params.limit + 1}
            pageSize={params.limit}
            total={total}
            onChange={onChangePage}
            showSizeChanger={false}
          />
        </div>
      </div>

      <ModalLoading isModalOpen={isModalLoading} textInfo="Harap tunggu..." />
    </>
  );
};

export default TagihanBulananTablePage;
