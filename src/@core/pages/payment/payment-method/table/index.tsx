'use client';
import { IPaymentMethod } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  Edit05,
  FileDownload02,
  Plus,
  SearchSm,
  Trash01,
} from '@untitled-ui/icons-react';
import Link from 'next/link';
import { notification } from 'antd';
import * as XLSX from 'xlsx';
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
// import Image from 'next/image';
moment.locale('id');

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
  });
  const [api, contextHolder] = notification.useNotification();
  const columns: ColumnsType<IPaymentMethod> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'payment_id',
      key: 'payment_id',
      fixed: 'left',
      align: 'center',
      render: (_, record, index) => index + params.offset + 1,
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
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (_, record) => (record.is_active ? 'Aktif' : 'Tidak Aktif'),
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
      payment_method_name__icontains: value,
    });
  };

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
      limit: 10,
      payment_method_name__icontains: '',
    });
    api.info({
      message: 'Data Method',
      description: 'Data Method Berhasil Dihapus',
      placement: 'bottomRight',
    });
  };

  const exportData = async () => {
    setIsModalLoading(true);
    const param = {
      format: 'json',
      offset: 0,
      limit: 50,
      payment_method_name__icontains: '',
    };
    const resp = await axiosInstance.get(url, { params: param });
    const rows = resp.data.results;
    const dataToExport = rows.map((item: IPaymentMethod, index: number) => ({
      No: index + 1,
      Nama: item.payment_method_name,
      Deskripsi: item.payment_method_description,
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    const colA = 5;
    const colB = 10;
    const colC = rows.reduce(
      (w: number, r: IPaymentMethod) =>
        Math.max(w, r.payment_method_name ? r.payment_method_name.length : 10),
      10
    );
    const colD = rows.reduce(
      (w: number, r: IPaymentMethod) =>
        Math.max(
          w,
          r.payment_method_description
            ? r.payment_method_description.length
            : 10
        ),
      10
    );

    worksheet['!cols'] = [
      { wch: colA },
      { wch: colB },
      { wch: colC },
      { wch: colD },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'faq');
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `data_faq.xlsx`);
    setIsModalLoading(false);
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
            href={`/payment/payment-method/form`}
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
