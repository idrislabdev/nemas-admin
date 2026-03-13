/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import { IDeliveryPartner, IUser } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  Dotpoints01,
  Edit05,
  FileDownload02,
  Plus,
  SearchSm,
  Trash01,
} from '@untitled-ui/icons-react';
import Link from 'next/link';
import { notification } from 'antd';
import ExcelJS from 'exceljs';
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
import { saveAs } from 'file-saver';
moment.locale('id');

const DeliveryPartnerPageTable = () => {
  const url = `/core/delivery_partner/`;
  const [dataTable, setDataTable] = useState<Array<IDeliveryPartner>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    search: '',
  });
  const [api, contextHolder] = notification.useNotification();
  const columns: ColumnsType<IDeliveryPartner> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'delivery_partner_id',
      key: 'delivery_partner_id',
      fixed: 'left',
      align: 'center',
      render: (_, record, index) => index + params.offset + 1,
    },
    {
      title: 'Nama',
      dataIndex: 'delivery_partner_name',
      key: 'delivery_partner_name',
    },
    {
      title: 'Code',
      dataIndex: 'delivery_partner_code',
      key: 'delivery_partner_code',
    },
    {
      title: 'Deskripsi',
      dataIndex: 'delivery_partner_description',
      key: 'delivery_partner_description',
      width: 150,
    },
    {
      title: 'Service Partner',
      key: 'delivery_partner_service',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link
            href={`/delivery/partner/${record.delivery_partner_id}/service`}
            className="btn-action"
          >
            <Dotpoints01 />
          </Link>
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
          <Link
            href={`/delivery/partner/${record.delivery_partner_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>
          <a
            className="btn-action"
            onClick={() => deleteData(record.delivery_partner_id)}
          >
            <Trash01 />
          </a>
        </div>
      ),
    },
  ];

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
      search: value,
    });
  };

  const deleteData = (id: number | undefined) => {
    if (id) {
      setSelectedId(id);
      setOpenModalConfirm(true);
    }
  };

  const confirmDelete = async () => {
    await axiosInstance.delete(`${url}${selectedId}`);
    setOpenModalConfirm(false);
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      search: '',
    });
    api.info({
      message: 'Data Delivery Partner',
      description: 'Data Delivery Partner Berhasil Dihapus',
      placement: 'bottomRight',
    });
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const param = {
        format: 'json',
        offset: 0,
        limit: 1000,
        search: '',
      };

      const resp = await axiosInstance.get(url, { params: param });
      const rows: IDeliveryPartner[] = resp.data.results || [];

      if (!rows.length) return;

      // ===== MAP DATA =====
      const dataToExport = rows.map(
        (item: IDeliveryPartner, index: number) => ({
          No: index + 1,
          Nama: item.delivery_partner_name || '',
          Code: item.delivery_partner_code || '',
          Deskripsi: item.delivery_partner_description || '',
        })
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Delivery Partner');

      const header = Object.keys(dataToExport[0]);
      const lastColumn = String.fromCharCode(64 + header.length);

      // ===== TITLE =====
      worksheet.mergeCells(`A1:${lastColumn}1`);
      worksheet.getCell('A1').value = 'LAPORAN DELIVERY PARTNER';
      worksheet.getCell('A1').font = { size: 14, bold: true };

      // ===== CREATED BY =====
      worksheet.mergeCells(`A2:${lastColumn}2`);
      worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;

      // ===== EXPORT DATE =====
      worksheet.mergeCells(`A3:${lastColumn}3`);
      worksheet.getCell('A3').value = `Tanggal Export : ${moment().format(
        'DD-MM-YYYY HH:mm'
      )}`;

      // ===== TOTAL DATA =====
      worksheet.mergeCells(`A4:${lastColumn}4`);
      worksheet.getCell('A4').value = `Total Data : ${rows.length}`;

      worksheet.addRow([]);

      // ===== HEADER =====
      const headerRow = worksheet.addRow(header);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEFEFEF' },
        };

        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' },
        };
      });

      // ===== DATA =====
      dataToExport.forEach((row: any) => {
        const newRow = worksheet.addRow(header.map((h: any) => row[h]));

        newRow.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // ===== FREEZE HEADER =====
      worksheet.views = [{ state: 'frozen', ySplit: 6 }];

      // ===== AUTO WIDTH =====
      worksheet.columns.forEach((col: any) => {
        let maxLength = 10;

        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const val = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, val.length);
        });

        col.width = Math.min(maxLength + 2, 40);
      });

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `delivery_partner_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (error) {
      console.error(error);
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
            href={`/delivery/partner/form`}
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
          rowKey="delivery_partner_id"
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

export default DeliveryPartnerPageTable;
