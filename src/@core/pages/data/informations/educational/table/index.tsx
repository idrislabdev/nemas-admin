'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IEducational } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';

import { Pagination, Table, notification } from 'antd';
import { ColumnsType } from 'antd/es/table';

import React, { useCallback, useEffect, useState } from 'react';
import debounce from 'debounce';
import Link from 'next/link';
import Image from 'next/image';

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

const InformationEducationalPageTable = () => {
  const url = `/core/information/educational/`;

  const [dataTable, setDataTable] = useState<Array<IEducational>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    information_background__icontains: '',
    information_name__icontains: '',
  });

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IEducational> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'information_educational_id',
      key: 'information_educational_id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Pertanyaan',
      dataIndex: 'information_name',
      key: 'information_name',
      width: 200,
    },
    {
      title: 'Jawaban',
      dataIndex: 'information_notes',
      key: 'information_notes',
      width: 400,
    },
    {
      title: 'Link / URL',
      dataIndex: 'information_url',
      key: 'information_url',
      width: 200,
      render: (_, record) =>
        record.information_url ? (
          <a
            href={record.information_url}
            target="_blank"
            className="block text-blue-500 underline"
          >
            {record.information_url}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: 'Gambar / Foto',
      dataIndex: 'information_background',
      key: 'information_background',
      width: 160,
      render: (_, record) =>
        record.information_background ? (
          <Image
            src={record.information_background}
            alt="image background"
            width={120}
            height={60}
            className="w-[120px] h-[60px] object-cover border border-gray-200 rounded-md"
          />
        ) : (
          '-'
        ),
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
            href={`/data/informations/educational/${record.information_educational_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>
          <a
            className="btn-action"
            onClick={() => deleteData(record.information_educational_id)}
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
      setLoading(true);
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (error) {
      console.log(error);
      api.error({
        message: 'Error',
        description: 'Gagal memuat data',
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const handleFilter = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      information_background__icontains: value,
      information_name__icontains: value,
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
      setParams({
        ...params,
        offset: 0,
        limit: 10,
        information_background__icontains: '',
        information_name__icontains: '',
      });
      api.success({
        message: 'Data Educational',
        description: 'Data Educational berhasil dihapus',
        placement: 'bottomRight',
      });
    } catch (error) {
      console.log(error);
      api.error({
        message: 'Error',
        description: 'Gagal menghapus data',
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
        information_background__icontains: '',
        information_name__icontains: '',
      };

      const resp = await axiosInstance.get(url, { params: exportParams });
      const rows = resp.data.results;

      const dataToExport = rows.map((item: IEducational, index: number) => ({
        No: index + 1,
        Pertanyaan: item.information_name,
        Jawaban: item.information_notes,
        URL: item.information_url,
        'Create By': item.create_user_name,
        'Update By': item.upd_user_name,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Educational');

      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').value = 'DATA EDUCATIONAL';
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
        if (col != undefined) {
          let maxLength = 0;
          col.eachCell({ includeEmpty: true }, (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength) maxLength = val.length;
          });
          col.width = maxLength + 2;
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `data_educational_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (error) {
      console.log(error);
      api.error({
        message: 'Error',
        description: 'Export data gagal',
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
            href={`/data/informations/educational/form`}
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
          rowKey="information_educational_id"
          loading={loading}
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

export default InformationEducationalPageTable;
