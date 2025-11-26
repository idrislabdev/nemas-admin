'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGold } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';

import { Pagination, Table, notification } from 'antd';
import { ColumnsType } from 'antd/es/table';

import React, { useCallback, useEffect, useState } from 'react';
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
import dayjs from 'dayjs';
import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

const GoldPageTable = () => {
  const url = `/core/gold/list/product-show`;

  const [dataTable, setDataTable] = useState<Array<IGold>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    type__icontains: '',
    brand__icontains: '',
  });

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IGold> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'gold_id',
      key: 'gold_id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Berat Emas (gr)',
      dataIndex: 'gold_weight',
      key: 'gold_weight',
      width: 150,
      render: (_, record) =>
        `${parseFloat(
          record.gold_weight ? record.gold_weight.toString() : '0'
        )} gr`,
    },
    // {
    //   title: 'Berat Sertifikat (gr)',
    //   dataIndex: 'certificate_weight',
    //   key: 'certificate_weight',
    //   width: 170,
    //   render: (_, record) =>
    //     `${parseFloat(
    //       record.certificate_weight ? record.certificate_weight.toString() : '0'
    //     )} gr`,
    // },
    { title: 'Tipe Emas', dataIndex: 'type', key: 'type', width: 120 },
    { title: 'Merek', dataIndex: 'brand', key: 'brand', width: 120 },
    {
      title: 'Harga',
      dataIndex: 'gold_price_summary_roundup',
      key: 'gold_price_summary_roundup',
      width: 150,
      render: (_, record) =>
        `Rp${formatterNumber(
          record.gold_price_summary_roundup
            ? parseInt(record.gold_price_summary_roundup)
            : 0
        )}`,
    },
    { title: 'Stok', dataIndex: 'stock', key: 'stock', width: 100 },
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
      render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: 'Update By',
      dataIndex: 'upd_user_name',
      key: 'upd_user_name',
      width: 150,
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link href={`/master/gold/${record.gold_id}`} className="btn-action">
            <Edit05 />
          </Link>
          <a className="btn-action" onClick={() => deleteData(record.gold_id)}>
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
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const handleFilter = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      type__icontains: value,
      brand__icontains: value,
    });
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
    await axiosInstance.delete(`/core/gold/${selectedId}`);
    setOpenModalConfirm(false);
    setParams({ ...params, offset: 0, limit: 10, type__icontains: '' });
    api.info({
      message: 'Data Gold',
      description: 'Data Gold Berhasil Dihapus',
      placement: 'bottomRight',
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
        type__icontains: '',
        brand__icontains: '',
      };

      const resp = await axiosInstance.get(url, { params: exportParams });
      const rows = resp.data.results;

      const dataToExport = rows.map((item: IGold, index: number) => ({
        No: index + 1,
        'Berat Emas': item.gold_weight,
        'Berat Sertifikat': item.certificate_weight,
        Type: item.type,
        Brand: item.brand,
        Harga: item.gold_price_summary_roundup
          ? parseInt(item.gold_price_summary_roundup)
          : 0,
        Stok: item.stock,
        'Create By': item.create_user_name,
        'Create Time': item.create_time
          ? moment(item.create_time).format('DD MMM YYYY, HH:mm')
          : '-',
        'Update By': item.upd_user_name,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Gold');

      // Judul
      worksheet.mergeCells('A1:J1');
      worksheet.getCell('A1').value = 'DATA MASTER GOLD';
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

          if (header[colNumber - 1] === 'Harga') {
            cell.numFmt = '"Rp"#,##0';
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
      const fileName = `data_gold_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
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
          <Link href={`/master/gold/form`} className="btn btn-outline-neutral">
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

export default GoldPageTable;
