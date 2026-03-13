'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IBank, IUser } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';

import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table, notification, Select } from 'antd';
import { ColumnsType } from 'antd/es/table';
import debounce from 'debounce';
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

const PaymentBankPageTable = () => {
  const url = `/core/payment/bank/`;

  const [dataTable, setDataTable] = useState<Array<IBank>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [statusActive, setStatusActive] = useState<boolean | null>(null);

  const [params, setParams] = useState<any>({
    format: 'json',
    offset: 0,
    limit: 10,
    bank_merchant_code__icontains: '',
    bank_name__icontains: '',
    bank_active: null,
  });

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IBank> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'bank_id',
      key: 'bank_id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    { title: 'Nama Bank', dataIndex: 'bank_name', key: 'bank_name' },
    {
      title: 'Kode Bank',
      dataIndex: 'bank_code',
      key: 'bank_code',
      width: 150,
    },
    {
      title: 'Kode Merchant',
      dataIndex: 'bank_merchant_code',
      key: 'bank_merchant_code',
    },
    {
      title: 'Status',
      dataIndex: 'bank_active',
      key: 'bank_active',
      render: (_, record) => (record.bank_active ? 'Aktif' : 'Tidak Aktif'),
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
          <Link href={`/payment/bank/${record.bank_id}`} className="btn-action">
            <Edit05 />
          </Link>
          <a className="btn-action" onClick={() => deleteData(record.bank_id)}>
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
    const filteredParams = { ...params };

    if (filteredParams.bank_active === null) {
      delete filteredParams.bank_active;
    }

    const resp = await axiosInstance.get(url, { params: filteredParams });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams((prev: any) => ({
      ...prev,
      offset: (val - 1) * prev.limit,
    }));
  };

  const handleFilter = (value: string) => {
    setParams((prev: any) => ({
      ...prev,
      offset: 0,
      bank_merchant_code__icontains: value,
      bank_name__icontains: value,
    }));
  };

  // ========================
  // Sync Status Filter
  // ========================
  useEffect(() => {
    setParams((prev: any) => ({
      ...prev,
      offset: 0,
      bank_active: statusActive,
    }));
  }, [statusActive]);

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
    fetchData();
    api.info({
      message: 'Data Bank',
      description: 'Data Bank Berhasil Dihapus',
      placement: 'bottomRight',
    });
  };

  // ========================
  // Fetch All Data
  // ========================
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

  // ========================
  // Export Excel
  // ========================
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const rows = await fetchAllData(url, params);

      const dataToExport = rows.map((item: IBank, index: number) => ({
        No: index + 1,
        'Nama Bank': item.bank_name,
        'Kode Bank': item.bank_code,
        'Kode Merchant': item.bank_merchant_code,
        Status: item.bank_active ? 'Aktif' : 'Tidak Aktif',
        'Create By': item.create_user_name,
        'Create Time': item.create_time
          ? moment(item.create_time).format('DD MMM YYYY, HH:mm')
          : '-',
        'Update By': item.upd_user_name,
        'Update Time': item.upd_time
          ? moment(item.upd_time).format('DD MMM YYYY, HH:mm')
          : '-',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Bank');

      // ======================
      // JUDUL
      // ======================
      worksheet.mergeCells('A1:I1');
      worksheet.getCell('A1').value = 'DATA MASTER BANK';
      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      let statusText = 'Semua';
      if (params.bank_active === true) statusText = 'Aktif';
      if (params.bank_active === false) statusText = 'Tidak Aktif';

      // ======================
      // HEADER INFO
      // ======================
      worksheet.mergeCells('A2:I2');
      worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;
      worksheet.getCell('A2').alignment = { horizontal: 'left' };

      worksheet.mergeCells('A3:I3');
      worksheet.getCell('A3').value = `Tanggal Export : ${moment().format(
        'DD MMM YYYY, HH:mm'
      )}`;
      worksheet.getCell('A3').alignment = { horizontal: 'left' };

      worksheet.mergeCells('A4:I4');
      worksheet.getCell('A4').value = `Status : ${statusText}`;
      worksheet.getCell('A4').alignment = { horizontal: 'left' };

      worksheet.addRow([]);

      // ======================
      // HEADER TABLE
      // ======================
      const header = Object.keys(dataToExport[0] || {});
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

      // ======================
      // DATA ROW
      // ======================
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

      // ======================
      // AUTO WIDTH
      // ======================
      worksheet.columns.forEach((col: any) => {
        if (col != undefined) {
          let maxLength = 0;

          col.eachCell({ includeEmpty: true }, (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength) {
              maxLength = val.length;
            }
          });

          col.width = maxLength + 2;
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `data_bank_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
      );
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
      {contextHolder}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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

          <Select
            allowClear
            placeholder="Status"
            className="w-[160px] h-[38px]"
            value={statusActive}
            onChange={(val) => {
              if (val === undefined) setStatusActive(null);
              else setStatusActive(val);
            }}
            options={[
              { value: null, label: 'All' },
              { value: true, label: 'Aktif' },
              { value: false, label: 'Tidak Aktif' },
            ]}
          />
        </div>

        <div className="flex items-center gap-[4px]">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
          <Link href={`/payment/bank/form`} className="btn btn-outline-neutral">
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
          rowKey="bank_id"
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

export default PaymentBankPageTable;
