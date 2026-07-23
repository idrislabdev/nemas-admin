'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldStockMovement } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber2 } from '@/@core/utils/general';
import { FileDownload02, Plus, SearchSm } from '@untitled-ui/icons-react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import debounce from 'debounce';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';

moment.locale('id');

const GoldStockMovementPageTable = () => {
  const url = `/gold-transaction/gold-stock/movement/`;

  const [dataTable, setDataTable] = useState<Array<IGoldStockMovement>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    type__icontains: '',
    search: '',
  });

  const columns: ColumnsType<IGoldStockMovement> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'gold_id',
      key: 'gold_id',
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Tipe',
      dataIndex: 'movement_type',
      key: 'movement_type',
      width: 120,
    },
    {
      title: 'Berat Emas (gr)',
      dataIndex: 'weight',
      key: 'weight',
      width: 150,
      align: 'right',
      render: (_, record) =>
        `${formatterNumber2(parseFloat(record.weight?.toString() || '0'))} gr`,
    },
    {
      title: 'Stock Sebelum (gr)',
      dataIndex: 'stock_before',
      key: 'stock_before',
      width: 150,
      align: 'right',
      render: (_, record) =>
        `${formatterNumber2(
          parseFloat(record.stock_before?.toString() || '0')
        )} gr`,
    },
    {
      title: 'Stok Sesudah (gr)',
      dataIndex: 'stock_after',
      key: 'stock_after',
      width: 150,
      align: 'right',
      render: (_, record) =>
        `${formatterNumber2(
          parseFloat(record.stock_after?.toString() || '0')
        )} gr`,
    },
    {
      title: 'Catatan',
      dataIndex: 'note',
      key: 'note',
      width: 120,
    },
    {
      title: 'Create Time',
      dataIndex: 'date',
      key: 'date',
      width: 170,
      render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: 'Create By',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120,
    },
  ];

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = (page: number) => {
    setParams({ ...params, offset: (page - 1) * params.limit });
  };

  const handleFilter = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      type__icontains: value,
      search: value,
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

      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  const getExportedBy = () => {
    if (typeof window === 'undefined') return '-';

    try {
      // Sesuaikan key localStorage sesuai project kamu
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

      const exportParams = {
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains: params.type__icontains,
        search: params.search,
      };

      const rows = await fetchAllData(url, exportParams);

      const dataToExport = rows.map(
        (item: IGoldStockMovement, index: number) => ({
          No: index + 1,
          Tipe: item.movement_type,
          'Berat Emas': `${formatterNumber2(
            parseFloat(item.weight?.toString() || '0')
          )} gr`,
          'Stock Sebelum': `${formatterNumber2(
            parseFloat(item.stock_before?.toString() || '0')
          )} gr`,
          'Stock Sesudah': `${formatterNumber2(
            parseFloat(item.stock_after?.toString() || '0')
          )} gr`,
          'Create Time': item.date
            ? moment(item.date).format('DD MMM YYYY HH:mm')
            : '-',
          Catatan: item.note || '-',
          'Create By': item.user_name || '-',
        })
      );

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';
      workbook.company = 'NEMAS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Gold Stock Movement');

      const exportedBy = getExportedBy();
      const exportedAt = moment().format('DD MMMM YYYY HH:mm:ss');

      const totalColumns =
        dataToExport.length > 0 ? Object.keys(dataToExport[0]).length : 8;

      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // =============================
      // Title
      // =============================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN PERGERAKAN STOK EMAS';

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

      worksheet.getCell('A3').font = { bold: true };
      worksheet.getCell('A4').font = { bold: true };

      worksheet.addRow([]);

      // =============================
      // Header
      // =============================

      const header = dataToExport.length
        ? Object.keys(dataToExport[0])
        : [
            'No',
            'Tipe',
            'Berat Emas',
            'Stock Sebelum',
            'Stock Sesudah',
            'Create Time',
            'Catatan',
            'Create By',
          ];

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
          ySplit: 6,
        },
      ];

      worksheet.autoFilter = {
        from: 'A6',
        to: `${lastColumnLetter}6`,
      };

      // =============================
      // Data
      // =============================

      dataToExport.forEach((row: any) => {
        const values = header.map((key) => row[key]);

        const newRow = worksheet.addRow(values);

        // Zebra row
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

            case 3:
            case 4:
            case 5:
              horizontal = 'right';
              break;

            case 6:
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

      const fileName = `laporan_pergerakan_stok_emas_${moment().format(
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
        {/* Search Input */}
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
              1000
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-[4px]">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
          <Link
            href={`/master/gold/stock-movement/update`}
            className="btn btn-outline-neutral"
          >
            <Plus />
            Add data
          </Link>
        </div>
      </div>

      {/* Table */}
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

      {/* Loading Modal */}
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default GoldStockMovementPageTable;
