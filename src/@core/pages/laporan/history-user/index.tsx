'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IPenggunaAplikasi, IUser } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';

import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

import React, { useCallback, useEffect, useState } from 'react';
import debounce from 'debounce';
import Link from 'next/link';

import {
  Dotpoints01,
  FileDownload02,
  SearchSm,
} from '@untitled-ui/icons-react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

const HistoryUserTable = () => {
  const url = `/users/admin`;

  const [dataTable, setDataTable] = useState<Array<IPenggunaAplikasi>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 15,
    search: '',
  });

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IPenggunaAplikasi> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      align: 'left',
      render: (v) => v || '-',
    },
    {
      title: 'Username',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 150,
      align: 'left',
      render: (v) => v || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      align: 'left',
      render: (v) => v || '-',
    },
    {
      title: 'Alamat',
      dataIndex: 'address',
      key: 'address',
      width: 220,
      align: 'left',
      render: (_, record) => record.address?.address || '-',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      key: 'phone_number',
      width: 150,
      align: 'left',
      render: (v) => v || '-',
    },
    {
      title: 'Create By',
      dataIndex: 'create_user_name',
      key: 'create_user_name',
      width: 150,
      align: 'left',
      render: (v) => v || '-',
    },
    {
      title: 'Create Time',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
      align: 'center',
      render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: 'Update By',
      dataIndex: 'upd_user_name',
      key: 'upd_user_name',
      width: 150,
      align: 'left',
      render: (v) => v || '-',
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link
            className="btn-action"
            href={`/laporan/history-user/${record.id}`}
          >
            <Dotpoints01 />
          </Link>
        </div>
      ),
    },
  ];

  // ========================
  // Fetch Data
  // ========================
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results || []);
      setTotal(resp.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams((prev) => ({ ...prev, offset: (val - 1) * prev.limit }));
  };

  const handleFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      limit: 15,
      search: value,
    }));
  };

  // ======================
  // Fetch All Data (Export)
  // ======================
  const fetchAllData = async (url: string, params: any) => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    allRows = allRows.concat(firstResp.data.results || []);

    const totalCount = firstResp.data.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;

      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset },
      });

      allRows = allRows.concat(resp.data.results || []);

      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  // ========================
  // Export Excel
  // ========================
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      let user: IUser | Record<string, any> = {};
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        user = {};
      }

      const exportParams = {
        ...params,
        offset: 0,
        limit: 100,
      };

      const rows = await fetchAllData(url, exportParams);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = (user as IUser)?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Data Pengguna Toko');

      // Helper Border Standar
      const applyStandardBorder = (cell: ExcelJS.Cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      };

      // Configuration Header
      const headersConfig = [
        { key: 'no', label: 'No', align: 'center' },
        { key: 'name', label: 'Nama', align: 'left' },
        { key: 'user_name', label: 'Username', align: 'left' },
        { key: 'email', label: 'Email', align: 'left' },
        { key: 'address', label: 'Alamat', align: 'left' },
        { key: 'phone_number', label: 'Phone Number', align: 'left' },
        { key: 'create_user_name', label: 'Create By', align: 'left' },
        { key: 'create_time', label: 'Create Time', align: 'center' },
        { key: 'upd_user_name', label: 'Update By', align: 'left' },
      ];

      const totalColumns = headersConfig.length;

      // =============================
      // TITLE & METADATA (Row 1 - 5)
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'DATA PENGGUNA TOKO';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF0057B7' } };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${(user as IUser)?.name || '-'}`;

      worksheet.getCell('A4').value = 'Tanggal Export';
      worksheet.getCell('B4').value =
        `: ${dayjs().format('DD MMMM YYYY HH:mm:ss')}`;

      worksheet.getCell('A5').value = 'Total Data';
      worksheet.getCell('B5').value = `: ${rows.length}`;

      ['A3', 'A4', 'A5'].forEach((key) => {
        worksheet.getCell(key).font = { bold: true };
      });

      worksheet.addRow([]); // Blank Row (Row 6)

      // =============================
      // HEADER TABEL (Row 7)
      // =============================
      const headerRow = worksheet.addRow(headersConfig.map((h) => h.label));
      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' }, // Biru Utama
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        applyStandardBorder(cell);
      });

      // =============================
      // DATA ROWS (Row 8+)
      // =============================
      rows.forEach((item: IPenggunaAplikasi, index: number) => {
        const rowValues = [
          index + 1,
          item.name || '-',
          item.user_name || '-',
          item.email || '-',
          item.address?.address || '-',
          item.phone_number || '-',
          item.create_user_name || '-',
          item.create_time
            ? moment(item.create_time).format('DD MMM YYYY HH:mm')
            : '-',
          item.upd_user_name || '-',
        ];

        const newRow = worksheet.addRow(rowValues);

        // Zebra Striping
        if (index % 2 === 1) {
          newRow.eachCell((c) => {
            c.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FBFF' },
            };
          });
        }

        newRow.eachCell((cell, colIdx) => {
          const config = headersConfig[colIdx - 1];

          cell.alignment = {
            horizontal: (config.align as any) || 'left',
            vertical: 'middle',
          };

          applyStandardBorder(cell);
        });
      });

      // =============================
      // AUTO COLUMN WIDTH
      // =============================
      // =============================
      // AUTO COLUMN WIDTH
      // =============================
      worksheet.columns.forEach((col: any, colIdx: number) => {
        let maxLength = headersConfig[colIdx]?.label?.length || 10;

        col.eachCell({ includeEmpty: true }, (cell: any, rowNum: number) => {
          if (rowNum >= 7) {
            const val = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, val.length);
          }
        });

        // Pengecekan khusus untuk Kolom A agar tidak bentrok dengan label metadata
        if (colIdx === 0) {
          // Ambil panjang maksimum antara teks data tabel, header tabel, atau minimal 22 (untuk teks "Tanggal Export")
          col.width = Math.max(maxLength + 4, 22);
        } else {
          col.width = Math.min(maxLength + 4, 35);
        }
      });

      // =============================
      // FREEZE HEADER & AUTO FILTER
      // =============================
      worksheet.views = [{ state: 'frozen', ySplit: 7 }];
      worksheet.autoFilter = {
        from: { row: 7, column: 1 },
        to: { row: 7, column: totalColumns },
      };

      // =============================
      // SAVE FILE
      // =============================
      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `data_pengguna_toko_${dayjs().format(
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
      <div className="flex items-center justify-between">
        <div className="group-input prepend-append">
          <span className="append">
            <SearchSm />
          </span>
          <input
            type="text"
            className="color-1 base"
            placeholder="cari data"
            onChange={debounce(
              (event) => handleFilter(event.target.value),
              800
            )}
          />
        </div>
        <div className="flex items-center gap-[4px]">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col  rounded-tr-[8px] rounded-tl-[8px] mt-3">
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

export default HistoryUserTable;
