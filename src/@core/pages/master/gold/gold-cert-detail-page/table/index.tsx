'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldCertPriceDetail } from '@/@core/@types/interface';
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

const GoldCertDetailPageTable = () => {
  const url = `/core/gold/cert_price_detail/`;

  const [dataTable, setDataTable] = useState<Array<IGoldCertPriceDetail>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    search: '',
  });

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IGoldCertPriceDetail> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    { title: 'Emas', dataIndex: 'gold', key: 'gold' },
    { title: 'Sertifikat', dataIndex: 'gold_cert', key: 'gold_cert' },
    {
      title: 'Kode Sertifikat',
      dataIndex: 'gold_cert_code',
      key: 'gold_cert_code',
    },
    {
      title: 'Satuan (gr)',
      dataIndex: 'gold_weight',
      key: 'gold_weight',
      render: (_, record) =>
        `${formatterNumber(record.gold_weight ? record.gold_weight : 0)} gr`,
    },
    {
      title: 'Include Stock',
      dataIndex: 'include_stock',
      key: 'include_stock',
      render: (_, record) => (record.include_stock ? 'Ya' : 'Tidak'),
    },
    {
      title: 'Create By',
      dataIndex: 'create_user_name',
      key: 'create_user_name',
    },
    {
      title: 'Create Time',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 170,
      render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
    },
    { title: 'Update By', dataIndex: 'upd_user_name', key: 'upd_user_name' },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link
            href={`/master/gold/cert-price-detail/${record.id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>
          <button className="btn-action" onClick={() => deleteData(record.id)}>
            <Trash01 />
          </button>
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
    } catch {
      api.error({
        message: 'Error',
        description: 'Gagal memuat data detail sertifikat emas',
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
      search: value,
    });
  };

  // ========================
  // Delete Data
  // ========================
  const deleteData = (id: string | undefined) => {
    if (id) {
      setSelectedId(id);
      setOpenModalConfirm(true);
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`${url}${selectedId}/`);
      setOpenModalConfirm(false);
      setParams({ ...params, offset: 0, limit: 10 });
      api.success({
        message: 'Data Sertifikat',
        description: 'Data detail sertifikat berhasil dihapus',
        placement: 'bottomRight',
      });
    } catch {
      api.error({
        message: 'Error',
        description: 'Gagal menghapus data detail sertifikat',
        placement: 'bottomRight',
      });
    }
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
        search: '',
      };

      const resp = await axiosInstance.get(url, { params: exportParams });
      const rows = resp.data.results;

      const dataToExport = rows.map(
        (item: IGoldCertPriceDetail, index: number) => ({
          No: index + 1,
          Emas: item.gold,
          Sertifikat: item.gold_cert,
          'Kode Sertifikat': item.gold_cert_code,
          'Satuan (gr)': item.gold_weight,
          'Include Stock': item.include_stock ? 'Ya' : 'Tidak',
          'Create By': item.create_user_name,
          'Create Time': item.create_time
            ? moment(item.create_time).format('DD MMM YYYY, HH:mm')
            : '-',
          'Update By': item.upd_user_name,
        })
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Detail Sertifikat');

      worksheet.mergeCells('A1:H1');
      worksheet.getCell('A1').value = 'DATA DETAIL SERTIFIKAT';
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      worksheet.addRow([]);

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

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `data_cert_detail_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;
      saveAs(new Blob([buffer]), fileName);

      api.success({
        message: 'Export Sukses',
        description: 'File detail sertifikat berhasil diunduh',
        placement: 'bottomRight',
      });
    } catch {
      api.error({
        message: 'Export Gagal',
        description: 'Terjadi kesalahan saat export data',
        placement: 'bottomRight',
      });
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
          <Link
            href={`/master/gold/cert-price-detail/form`}
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

export default GoldCertDetailPageTable;
