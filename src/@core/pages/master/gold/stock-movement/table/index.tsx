'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldStockMovement } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';
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
      render: (_, record) =>
        `${formatterNumber(parseFloat(record.weight?.toString() || '0'))} gr`,
    },
    {
      title: 'Stock Sebelum (gr)',
      dataIndex: 'stock_before',
      key: 'stock_before',
      width: 150,
      render: (_, record) =>
        `${formatterNumber(
          parseFloat(record.stock_before?.toString() || '0')
        )} gr`,
    },
    {
      title: 'Stok Sesudah (gr)',
      dataIndex: 'stock_after',
      key: 'stock_after',
      width: 150,
      render: (_, record) =>
        `${formatterNumber(
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

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const exportParams = {
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains: params.type__icontains,
      };

      const rows = await fetchAllData(url, exportParams);

      const dataToExport = rows.map(
        (item: IGoldStockMovement, index: number) => ({
          No: index + 1,
          Tipe: item.movement_type,
          'Berat Emas': `${formatterNumber(
            parseFloat(item.weight?.toString() || '0')
          )} gr`,
          'Stock Sebelum': `${formatterNumber(
            parseFloat(item.stock_before?.toString() || '0')
          )} gr`,
          'Stock Sesudah': `${formatterNumber(
            parseFloat(item.stock_after?.toString() || '0')
          )} gr`,
          Catatan: item.note,
          'Create By': item.user_name,
        })
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Gold Stock Movement');

      // Judul
      worksheet.mergeCells('A1:G1');
      worksheet.getCell('A1').value = 'LAPORAN PERGERAKAN STOK EMAS';
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

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
      dataToExport.forEach((row: any) => {
        const rowValues = header.map((key) => row[key as keyof typeof row]);
        const newRow = worksheet.addRow(rowValues);

        newRow.eachCell((cell) => {
          cell.alignment = { vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // Auto width
      worksheet.columns.forEach((col: any) => {
        if (col) {
          let maxLength = 0;
          col.eachCell({ includeEmpty: true }, (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength) maxLength = val.length;
          });
          col.width = maxLength + 2;
        }
      });

      // Simpan file
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
      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="gold_id"
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
