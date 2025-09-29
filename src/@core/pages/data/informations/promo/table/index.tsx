'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IPromo } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';

import { Pagination, Table, notification } from 'antd';
import { ColumnsType } from 'antd/es/table';

import React, { useCallback, useEffect, useState } from 'react';
import debounce from 'debounce';
import Link from 'next/link';
// import Image from 'next/image';

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

const InformationPromoPageTable = () => {
  const url = `/core/information/promo/`;

  const [dataTable, setDataTable] = useState<Array<IPromo>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    promo_code__icontains: '',
    promo_name__icontains: '',
  });

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IPromo> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'promo_id',
      key: 'promo_id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Kode Promo',
      dataIndex: 'promo_code',
      key: 'promo_code',
      width: 150,
    },
    {
      title: 'Level User',
      dataIndex: 'leveling_user',
      key: 'leveling_user',
      width: 150,
    },
    {
      title: 'Nama Promo',
      dataIndex: 'promo_name',
      key: 'promo_name',
      width: 150,
    },
    {
      title: 'URL Promo',
      dataIndex: 'promo_url',
      key: 'promo_url',
      width: 150,
    },
    {
      title: 'Tanggal Mulai',
      dataIndex: 'promo_start_date',
      key: 'promo_start_date',
      width: 150,
      render: (_, record) =>
        moment(record.promo_start_date).format('DD-MM-YYYY'),
    },
    {
      title: 'Tanggal Berakhir',
      dataIndex: 'promo_end_date',
      key: 'promo_end_date',
      width: 150,
      render: (_, record) => moment(record.promo_end_date).format('DD-MM-YYYY'),
    },
    {
      title: 'Tag Promo',
      dataIndex: 'promo_tag',
      key: 'promo_tag',
      width: 150,
    },
    // {
    //   title: 'Promo Background',
    //   dataIndex: 'promo_url_background',
    //   key: 'promo_url_background',
    //   width: 200,
    //   render: (_, record) =>
    //     record.promo_url_background ? (
    //       <Image
    //         src={record.promo_url_background}
    //         alt="image background"
    //         width={120}
    //         height={60}
    //         className="object-cover border border-gray-200 rounded-md"
    //       />
    //     ) : (
    //       ''
    //     ),
    // },
    {
      title: 'Promo Diskon',
      dataIndex: 'promo_diskon',
      key: 'promo_diskon',
      width: 150,
    },
    {
      title: 'Promo Cashback',
      dataIndex: 'promo_cashback',
      key: 'promo_cashback',
      width: 150,
    },
    {
      title: 'Merchant Cashback',
      dataIndex: 'merchant_cashback',
      key: 'merchant_cashback',
      width: 200,
    },
    {
      title: 'Create By',
      dataIndex: 'create_user_name',
      key: 'create_user_name',
      width: 150,
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
          <Link
            href={`/data/informations/promo/${record.promo_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>
          <a className="btn-action" onClick={() => deleteData(record.promo_id)}>
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
    } catch (error) {
      console.log(error);
      api.error({
        message: 'Fetch Failed',
        description: 'Terjadi kesalahan saat mengambil data promo',
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
      promo_code__icontains: value,
      promo_name__icontains: value,
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
    try {
      await axiosInstance.delete(`${url}${selectedId}/`);
      setOpenModalConfirm(false);
      setParams({ ...params, offset: 0 });
      api.info({
        message: 'Data Promo',
        description: 'Data Promo Berhasil Dihapus',
        placement: 'bottomRight',
      });
    } catch (error) {
      console.log(error);
      api.error({
        message: 'Delete Failed',
        description: 'Terjadi kesalahan saat menghapus data promo',
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
        promo_code__icontains: '',
        promo_name__icontains: '',
      };

      const resp = await axiosInstance.get(url, { params: exportParams });
      const rows = resp.data.results;

      const dataToExport = rows.map((item: IPromo, index: number) => ({
        No: index + 1,
        'Kode Promo': item.promo_code,
        'Level User': item.leveling_user,
        'Nama Promo': item.promo_name,
        'URL Promo': item.promo_url,
        'Tanggal Mulai': moment(item.promo_start_date).format('DD-MM-YYYY'),
        'Tanggal Berakhir': moment(item.promo_end_date).format('DD-MM-YYYY'),
        'Tag Promo': item.promo_tag,
        Diskon: item.promo_diskon,
        'Promo Cashback': item.promo_cashback,
        'Merchant Cashback': item.merchant_cashback,
        'Create By': item.create_user_name,
        'Update By': item.upd_user_name,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Promo');

      worksheet.mergeCells('A1:L1');
      worksheet.getCell('A1').value = 'DATA PROMO';
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
      const fileName = `data_promo_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
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
          <Link
            href={`/data/informations/promo/form`}
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
          rowKey="promo_id"
          locale={{ emptyText: 'Tidak ada data promo ditemukan' }}
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

export default InformationPromoPageTable;
