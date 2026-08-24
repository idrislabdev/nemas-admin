'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

import dayjs from 'dayjs';
import moment from 'moment';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { FileDownload02 } from '@untitled-ui/icons-react';

import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';

interface IFailedAttempt {
  id: string;
  user: string;
  user_name: string;
  reason: string;
  create_time: string;
  create_user: string;
}

const FailedAttemptPageTable = () => {
  const url = '/users/admin/violation-history';

  const [dataTable, setDataTable] = useState<IFailedAttempt[]>([]);
  const [total, setTotal] = useState(0);

  const [searchText, setSearchText] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    offset: 0,
    limit: 10,
    search: '',
  });

  // ========================
  // Columns
  // ========================

  const columns = useMemo<ColumnsType<IFailedAttempt>>(
    () => [
      {
        title: 'No',
        key: 'no',
        width: 70,
        align: 'center',
        render: (_, __, index) => params.offset + index + 1,
      },
      {
        title: 'User',
        dataIndex: 'user_name',
        key: 'user',
        width: 280,
        render: (value) => value || '-',
      },
      {
        title: 'Alasan',
        dataIndex: 'reason',
        key: 'reason',
        render: (value) => value || '-',
      },
      {
        title: 'Waktu',
        dataIndex: 'create_time',
        key: 'create_time',
        width: 180,
        align: 'center',
        render: (value) =>
          value ? moment(value).format('DD-MM-YYYY HH:mm:ss') : '-',
      },
      {
        title: 'Create User',
        dataIndex: 'create_user',
        key: 'create_user',
        width: 180,
        render: (value) => value || '-',
      },
    ],
    [params.offset]
  );

  // ========================
  // Fetch Data
  // ========================

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, {
        params,
      });

      /*
       * Support:
       *
       * 1. Response langsung array
       * [
       *   {...}
       * ]
       *
       * 2. Response pagination
       * {
       *   results: [],
       *   count: 100
       * }
       */

      if (Array.isArray(resp.data)) {
        const results = resp.data;

        const filteredResults = params.search
          ? results.filter((item: IFailedAttempt) => {
              const keyword = params.search.toLowerCase();

              return (
                item.user_name?.toLowerCase().includes(keyword) ||
                item.reason?.toLowerCase().includes(keyword) ||
                item.create_user?.toLowerCase().includes(keyword)
              );
            })
          : results;

        const paginatedResults = filteredResults.slice(
          params.offset,
          params.offset + params.limit
        );

        setDataTable(paginatedResults);
        setTotal(filteredResults.length);

        return;
      }

      setDataTable(resp.data?.results ?? []);
      setTotal(resp.data?.count ?? 0);
    } catch (err) {
      console.error('Fetch failed:', err);

      setDataTable([]);
      setTotal(0);
    }
  }, [params]);

  // ========================
  // Initial / Params Change
  // ========================

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ========================
  // Search Debounce
  // ========================

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

  // ========================
  // Pagination
  // ========================

  const onChangePage = (page: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  };

  // ========================
  // Fetch All Data
  // ========================

  const fetchAllData = async () => {
    const resp = await axiosInstance.get(url);

    if (Array.isArray(resp.data)) {
      return resp.data as IFailedAttempt[];
    }

    return resp.data?.results ?? [];
  };

  // ========================
  // Get Exported By
  // ========================

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

  // ========================
  // Export Excel
  // ========================

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData();

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const filteredRows = params.search
        ? rows.filter((item: IFailedAttempt) => {
            const keyword = params.search.toLowerCase();

            return (
              item.user_name?.toLowerCase().includes(keyword) ||
              item.reason?.toLowerCase().includes(keyword) ||
              item.create_user?.toLowerCase().includes(keyword)
            );
          })
        : rows;

      if (filteredRows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const dataToExport = filteredRows.map(
        (item: IFailedAttempt, index: number) => ({
          No: index + 1,
          User: item.user_name || '-',
          Alasan: item.reason || '-',
          Waktu: item.create_time
            ? dayjs(item.create_time).format('DD-MM-YYYY HH:mm:ss')
            : '-',
          'Create User': item.create_user || '-',
        })
      );

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';
      workbook.company = 'NEMAS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Percobaan Login Gagal');

      const exportedBy = getExportedBy();
      const exportedAt = dayjs().format('DD MMMM YYYY HH:mm:ss');

      const totalColumns = Object.keys(dataToExport[0]).length;

      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // =============================
      // Title
      // =============================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN PERCOBAAN LOGIN GAGAL';

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
      worksheet.getCell('B5').value = `: ${filteredRows.length}`;

      worksheet.getCell('A3').font = {
        bold: true,
      };

      worksheet.getCell('A4').font = {
        bold: true,
      };

      worksheet.getCell('A5').font = {
        bold: true,
      };

      if (params.search) {
        worksheet.getCell('A6').value = 'Pencarian';
        worksheet.getCell('B6').value = `: ${params.search}`;

        worksheet.getCell('A6').font = {
          bold: true,
        };
      }

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
            case 1:
              horizontal = 'center';
              break;

            case 4:
              horizontal = 'center';
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

        column.eachCell(
          {
            includeEmpty: true,
          },
          (cell: any) => {
            const value = cell.value ? cell.value.toString() : '';

            maxLength = Math.max(maxLength, value.length);
          }
        );

        column.width = Math.min(maxLength + 3, 50);
      });

      // =============================
      // Export
      // =============================

      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `laporan_percobaan_login_gagal_${dayjs().format(
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
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Cari user, alasan..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm font-normal text-neutral-700 w-[280px] focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {/* Table */}
      <div className="flex flex-col rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{
            x: 'max-content',
            y: 550,
          }}
          pagination={false}
          className="table-basic"
          rowKey="id"
        />

        <div className="flex justify-end p-[12px]">
          <Pagination
            onChange={onChangePage}
            pageSize={params.limit}
            current={Math.floor(params.offset / params.limit) + 1}
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

export default FailedAttemptPageTable;
