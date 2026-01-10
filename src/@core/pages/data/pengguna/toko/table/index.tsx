'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IPenggunaAplikasi } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';

import { Pagination, Table, Select } from 'antd';
import { ColumnsType } from 'antd/es/table';

import React, { useCallback, useEffect, useState } from 'react';
import debounce from 'debounce';
import Link from 'next/link';

import { Eye, FileDownload02, Plus, SearchSm } from '@untitled-ui/icons-react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

const DataPenggunaTokoPageTable = () => {
  const url = `/users/admin`;

  const [dataTable, setDataTable] = useState<Array<IPenggunaAplikasi>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    search: '',
    role__name__icontains: 'Toko',
    is_active: '', // ← FILTER STATUS
    is_verified: '', // ← FILTER STATUS verifikasi
  });

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IPenggunaAplikasi> = [
    {
      title: 'No',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    { title: 'Nama', dataIndex: 'name', width: 150 },
    { title: 'Username', dataIndex: 'user_name', width: 150 },
    { title: 'Email', dataIndex: 'email', width: 150 },
    {
      title: 'Alamat',
      width: 200,
      render: (_, record) =>
        record.address?.address ? record.address.address : '-',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      width: 120,
      align: 'center',
      render: (val) => (
        <span className={val ? 'text-green-600' : 'text-red-600'}>
          {val ? 'Aktif' : 'Tidak Aktif'}
        </span>
      ),
    },
    {
      title: 'Status Verifikasi',
      dataIndex: 'is_verified',
      width: 150,
      align: 'center',
      render: (val) => (
        <span className={val ? 'text-green-600' : 'text-red-600'}>
          {val ? 'Sudah Verifikasi' : 'Belum Verifikasi'}
        </span>
      ),
    },
    {
      title: 'Create By',
      dataIndex: 'create_user_name',
      width: 150,
    },
    {
      title: 'Create Time',
      dataIndex: 'create_time',
      width: 180,
      render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: 'Update By',
      dataIndex: 'upd_user_name',
      width: 150,
    },
    {
      title: '',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-[5px]">
          <Link
            className="btn-action"
            href={`/data/pengguna/toko/${record.id}`}
          >
            <Eye />
          </Link>
        </div>
      ),
    },
  ];

  // ========================
  // Fetch Data
  // ========================
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams({
      ...params,
      offset: (val - 1) * params.limit,
    });
  };

  const handleFilter = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      search: value,
    });
  };

  const handleFilterStatus = (value: any) => {
    setParams({
      ...params,
      offset: 0,
      is_active: value ?? '',
    });
  };

  const handleFilterStatusVerified = (value: any) => {
    setParams({
      ...params,
      offset: 0,
      is_verified: value ?? '',
    });
  };

  // ========================
  // Export Excel
  // ========================
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const resp = await axiosInstance.get(url, {
        params: { ...params, offset: 0, limit: 100 },
      });

      const rows = resp.data.results;

      const dataToExport = rows.map(
        (item: IPenggunaAplikasi, index: number) => ({
          No: index + 1,
          Nama: item.name,
          Username: item.user_name,
          Email: item.email,
          Alamat: item.address?.address ?? '-',
          'Phone Number': item.phone_number,
          Status: item.is_active ? 'Aktif' : 'Tidak Aktif',
          'Create By': item.create_user_name,
          'Create Time': item.create_time
            ? moment(item.create_time).format('DD MMM YYYY HH:mm')
            : '-',
          'Update By': item.upd_user_name,
        })
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Pengguna Toko');

      worksheet.mergeCells('A1:J1');
      worksheet.getCell('A1').value = 'DATA PENGGUNA TOKO';
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { bold: true, size: 14 };

      worksheet.addRow([]);

      const header = Object.keys(dataToExport[0]);
      const headerRow = worksheet.addRow(header);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
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

      dataToExport.forEach((row: any) => {
        const newRow = worksheet.addRow(Object.values(row));
        newRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      worksheet.columns.forEach((col: any) => {
        let max = 0;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value?.toString() ?? '';
          max = Math.max(max, val.length);
        });
        col.width = max + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `data_pengguna_toko_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="group-input prepend-append">
            <span className="append">
              <SearchSm />
            </span>
            <input
              type="text"
              className="color-1 base"
              placeholder="cari data"
              onChange={debounce((e) => handleFilter(e.target.value), 1000)}
            />
          </div>

          <Select
            placeholder="Status"
            allowClear
            className="min-w-[140px] h-9"
            onChange={handleFilterStatus}
            options={[
              { label: 'Aktif', value: true },
              { label: 'Tidak Aktif', value: false },
            ]}
          />
          <Select
            placeholder="Status Verifikasi"
            allowClear
            className="min-w-[150px] h-9"
            onChange={handleFilterStatusVerified}
            options={[
              { label: 'Sudah Verifikasi', value: true },
              { label: 'Belum Verifikasi', value: false },
            ]}
          />
        </div>

        <div className="flex items-center gap-[4px]">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
          <Link
            href={`/data/pengguna/toko/form`}
            className="btn btn-outline-neutral"
          >
            <Plus />
            Add data
          </Link>
        </div>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-t-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          rowKey="id"
          className="table-basic"
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

export default DataPenggunaTokoPageTable;
