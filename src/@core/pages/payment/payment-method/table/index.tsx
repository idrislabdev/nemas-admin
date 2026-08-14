'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IPaymentMethod, IUser } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';

import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table, Select, notification } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';

import {
  Edit05,
  FileDownload02,
  Plus,
  SearchSm,
  Trash01,
} from '@untitled-ui/icons-react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');

/* ================= HELPER EXCEL ================= */
const getExcelColumnLabel = (colIndex: number): string => {
  let label = '';
  let index = colIndex;
  while (index > 0) {
    const remainder = (index - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    index = Math.floor((index - 1) / 26);
  }
  return label;
};

const PaymentMethodPageTable = () => {
  const url = `/core/payment/method/`;

  const [dataTable, setDataTable] = useState<Array<IPaymentMethod>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    payment_method_name__icontains: '',
    is_active: '',
  });

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IPaymentMethod> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'payment_method_id',
      key: 'payment_method_id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Nama',
      dataIndex: 'payment_method_name',
      key: 'payment_method_name',
    },
    {
      title: 'Deskripsi',
      dataIndex: 'payment_method_description',
      key: 'payment_method_description',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      render: (_, record) => (record.is_active ? 'Aktif' : 'Tidak Aktif'),
    },
    {
      title: 'Create By',
      dataIndex: 'create_user_name',
      key: 'create_user_name',
      width: 150,
    },
    {
      title: 'Create Time',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 170,
      render: (_, record) =>
        record.create_time
          ? moment(record.create_time).format('DD MMM YYYY, HH:mm')
          : '-',
    },
    {
      title: 'Update By',
      dataIndex: 'upd_user_name',
      key: 'upd_user_name',
      width: 150,
    },
    {
      title: 'Update Time',
      dataIndex: 'upd_time',
      key: 'upd_time',
      width: 170,
      render: (_, record) =>
        record.upd_time
          ? moment(record.upd_time).format('DD MMM YYYY, HH:mm')
          : '-',
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link
            href={`/payment/payment-method/${record.payment_method_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>
          <a
            className="btn-action"
            onClick={() => deleteData(record.payment_method_id)}
          >
            <Trash01 />
          </a>
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
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const handleFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      payment_method_name__icontains: value,
    }));
  };

  const handleStatusFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      is_active: value,
    }));
  };

  // ========================
  // Delete Data
  // ========================
  const deleteData = (id: number | undefined) => {
    if (id) {
      setSelectedId(id);
      setOpenModalConfirm(true);
    }
  };

  const confirmDelete = async () => {
    await axiosInstance.delete(`${url}${selectedId}/`);
    setOpenModalConfirm(false);
    setParams({
      ...params,
      offset: 0,
      payment_method_name__icontains: '',
    });
    api.info({
      message: 'Data Method',
      description: 'Data Method Berhasil Dihapus',
      placement: 'bottomRight',
    });
  };

  // ========================
  // Export Excel
  // ========================
  const fetchAllData = async (urlPath: string, currentParams: any) => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(urlPath, {
      params: { ...currentParams, limit, offset: 0 },
    });

    allRows = allRows.concat(firstResp.data.results);
    const totalCount = firstResp.data.count;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;
      const resp = await axiosInstance.get(urlPath, {
        params: { ...currentParams, limit, offset },
      });
      allRows = allRows.concat(resp.data.results);
      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      let user: IUser | null = null;
      try {
        const storedUser = localStorage.getItem('user');
        user = storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        console.warn('Failed to parse user from localStorage', e);
      }

      const exportParams = {
        format: 'json',
        offset: 0,
        limit: 100,
        payment_method_name__icontains: params.payment_method_name__icontains,
        is_active: params.is_active,
      };

      const rows = await fetchAllData(url, exportParams);
      if (!rows.length) {
        api.warning({
          message: 'Export Excel',
          description: 'Tidak ada data untuk diexport',
          placement: 'bottomRight',
        });
        return;
      }

      const dataToExport = rows.map((item: IPaymentMethod, index: number) => ({
        No: index + 1,
        Nama: item.payment_method_name || '-',
        Deskripsi: item.payment_method_description || '-',
        Status: item.is_active ? 'Aktif' : 'Tidak Aktif',
        'Create By': item.create_user_name || '-',
        'Create Time': item.create_time
          ? moment(item.create_time).format('DD MMM YYYY, HH:mm')
          : '-',
        'Update By': item.upd_user_name || '-',
        'Update Time': item.upd_time
          ? moment(item.upd_time).format('DD MMM YYYY, HH:mm')
          : '-',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Payment Method');

      const totalColumns = Object.keys(dataToExport[0]).length;
      const lastColumnLetter = getExcelColumnLabel(totalColumns);

      // ======================
      // TITLE & METADATA
      // ======================
      const metadata = [
        { cell: 'A1', val: 'DATA MASTER PAYMENT METHOD', bold: true, size: 14 },
        { cell: 'A2', val: `Dibuat oleh : ${user?.name || '-'}` },
        {
          cell: 'A3',
          val: `Tanggal Export : ${moment().format('DD MMM YYYY, HH:mm')}`,
        },
        { cell: 'A4', val: `Total Data : ${rows.length}` },
      ];

      metadata.forEach((m, idx) => {
        const rowNum = idx + 1;
        worksheet.mergeCells(`A${rowNum}:${lastColumnLetter}${rowNum}`);
        const c = worksheet.getCell(m.cell);
        c.value = m.val;
        c.font = {
          name: 'Calibri',
          bold: !!m.bold,
          size: m.size || 11,
          color: { argb: 'FF1E293B' },
        };
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      });

      worksheet.addRow([]); // Row 5 blank

      // ======================
      // HEADER TABLE
      // ======================
      const headerKeys = Object.keys(dataToExport[0]);
      const headerRow = worksheet.addRow(headerKeys);
      const headerRowIndex = 6;
      headerRow.height = 26;

      headerRow.eachCell((cell) => {
        cell.font = {
          name: 'Calibri',
          bold: true,
          color: { argb: 'FFFFFFFF' },
          size: 11,
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'medium', color: { argb: 'FF004397' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' },
        };
      });

      // ======================
      // DATA ROWS
      // ======================
      dataToExport.forEach((row: any, idx: number) => {
        const rowValues = headerKeys.map((key) => row[key] ?? '-');
        const newRow = worksheet.addRow(rowValues);
        newRow.height = 20;

        const isEven = idx % 2 === 1;
        const rowBgColor = isEven ? 'FFF8FBFF' : 'FFFFFFFF';

        for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
          const cell = newRow.getCell(colIndex);
          const header = headerKeys[colIndex - 1];
          const isCenter = header === 'No' || header === 'Status';

          cell.font = {
            name: 'Calibri',
            size: 10,
            color: { argb: 'FF334155' },
          };
          cell.alignment = {
            horizontal: isCenter ? 'center' : 'left',
            vertical: 'middle',
          };

          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowBgColor },
          };

          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          };
        }
      });

      const dataEndRow = headerRowIndex + dataToExport.length;

      // ======================
      // AUTOFILTER & FREEZE
      // ======================
      worksheet.autoFilter = `A${headerRowIndex}:${lastColumnLetter}${dataEndRow}`;
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: headerRowIndex },
      ];

      // ======================
      // AUTO WIDTH
      // ======================
      worksheet.columns.forEach((col) => {
        let maxLen = 0;
        col.eachCell?.({ includeEmpty: true }, (cell, rowNumber) => {
          if (rowNumber < headerRowIndex) return;
          const strVal = cell.value != null ? cell.value.toString() : '';
          maxLen = Math.max(maxLen, strVal.length);
        });
        col.width = Math.max(maxLen + 4, 15);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `data_payment_method_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  // ========================
  // UseEffect
  // ========================
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {contextHolder}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="group-input prepend-append">
            <span className="append">
              <SearchSm />
            </span>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 h-[40px] w-[250px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Cari nama metode..."
              onChange={debounce(
                (event) => handleFilter(event.target.value),
                500
              )}
            />
          </div>
          <Select
            placeholder="Filter Status"
            className="w-[150px] h-[40px]"
            allowClear
            onChange={handleStatusFilter}
            options={[
              { value: 'true', label: 'Aktif' },
              { value: 'false', label: 'Tidak Aktif' },
            ]}
          />
        </div>
        <div className="flex items-center gap-[4px]">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
          <Link
            href={`/payment/payment-method/form`}
            className="btn btn-outline-neutral"
          >
            <Plus />
            Add data
          </Link>
        </div>
      </div>
      <div className="flex flex-col  rounded-tr-[8px] rounded-tl-[8px] mt-4">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="payment_method_id"
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
      <ModalConfirm
        isModalOpen={openModalConfirm}
        setIsModalOpen={setOpenModalConfirm}
        content="Hapus Data Ini?"
        onConfirm={confirmDelete}
      />
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default PaymentMethodPageTable;
