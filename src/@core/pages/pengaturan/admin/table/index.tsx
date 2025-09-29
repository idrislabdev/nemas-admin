'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IMenu, IPenggunaAplikasi } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';

import { Pagination, Table, notification } from 'antd';
import { ColumnsType } from 'antd/es/table';

import React, { useCallback, useEffect, useState } from 'react';
import debounce from 'debounce';
import Link from 'next/link';

import {
  Dotpoints01,
  Eye,
  FileDownload02,
  Plus,
  SearchSm,
} from '@untitled-ui/icons-react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import moment from 'moment';
import 'moment/locale/id';
import ModalMenu from '../modal-menu';

moment.locale('id');

const AdminPageTable = () => {
  const url = `/users/admin`;

  const [dataTable, setDataTable] = useState<Array<IPenggunaAplikasi>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isModalMenu, setIsModalMenu] = useState(false);
  const [dataMenu, setDataMenu] = useState<IMenu[]>([] as IMenu[]);
  const [userId, setUserId] = useState('');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    role__name__icontains: 'Admin',
    name__icontains: '',
    email__icontains: '',
    username__icontains: '',
  });

  const [api, contextHolder] = notification.useNotification();

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
    { title: 'Nama', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'Username', dataIndex: 'user_name', key: 'username', width: 150 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
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
      width: 180,
      render: (val: string) =>
        val ? moment(val).format('DD MMM YYYY HH:mm') : '-',
    },
    {
      title: 'Update By',
      dataIndex: 'upd_user_name',
      key: 'upd_user_name',
      width: 150,
    },
    {
      title: 'Akses Menu',
      key: 'menu',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <a className="btn-action" onClick={() => showMenu(record.id)}>
            <Dotpoints01 />
          </a>
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link className="btn-action" href={`/data/pengguna/${record.id}`}>
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
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (err) {
      console.error(err);
      api.error({
        message: 'Load Data Gagal',
        description: 'Tidak dapat memuat data pengguna admin',
        placement: 'bottomRight',
      });
    }
  }, [params, url, api]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const handleFilter = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      name__icontains: value,
      username__icontains: value,
      email__icontains: value,
    });
  };

  // ========================
  // Export Excel
  // ========================
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const exportParams = {
        format: 'json',
        offset: 0,
        limit: 100,
        role__name__icontains: 'Admin',
      };

      const resp = await axiosInstance.get(url, { params: exportParams });
      const rows = resp.data.results;

      const dataToExport = rows.map(
        (item: IPenggunaAplikasi, index: number) => ({
          No: index + 1,
          Nama: item.name,
          Username: item.user_name,
          Email: item.email,
          'Create By': item.create_user_name,
          'Create Time': item.create_time
            ? moment(item.create_time).format('DD/MM/YYYY HH:mm')
            : '',
          'Update By': item.upd_user_name,
        })
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Admin');

      // Judul
      worksheet.mergeCells('A1:G1');
      worksheet.getCell('A1').value = 'DATA PENGGUNA ADMIN';
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      worksheet.addRow([]); // baris kosong

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

        newRow.eachCell((cell, colNumber) => {
          cell.alignment = { vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          if (header[colNumber - 1] === 'Create Time') {
            cell.numFmt = 'dd/mm/yyyy hh:mm';
          }
        });
      });

      // Auto column width
      worksheet.columns.forEach((col: any) => {
        if (col != undefined) {
          let maxLength = 0;
          col.eachCell({ includeEmpty: true }, (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength) maxLength = val.length;
          });
          col.width = maxLength + 2;
        }
      });

      // Save file
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `data_admin_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
      api.error({
        message: 'Export Gagal',
        description: 'Tidak dapat mengekspor data pengguna admin',
        placement: 'bottomRight',
      });
    } finally {
      setIsModalLoading(false);
    }
  };

  // ========================
  // Show Menu
  // ========================
  const showMenu = (id: string) => {
    axiosInstance.get(`users/menu/${id}`).then((resp) => {
      const data = resp.data;
      setUserId(id);
      setDataMenu(data);
      setIsModalMenu(true);
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {contextHolder}
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
              1000
            )}
          />
        </div>
        <div className="flex items-center gap-[4px]">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
          <Link
            href={`/pengaturan/admin/form`}
            className="btn btn-outline-neutral"
          >
            <Plus />
            Add data
          </Link>
        </div>
      </div>
      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
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
      <ModalMenu
        isModalOpen={isModalMenu}
        setIsModalOpen={setIsModalMenu}
        dataMenu={dataMenu}
        userId={userId}
      />
    </>
  );
};

export default AdminPageTable;
