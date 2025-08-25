'use client';
import { IAdminFee } from '@/@core/@types/interface';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { notification, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  Edit05,
  FileDownload02,
  Plus,
  SearchSm,
  Trash01,
} from '@untitled-ui/icons-react';
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
import axiosInstance from '@/@core/utils/axios';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { formatterNumber } from '@/@core/utils/general';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
moment.locale('id');

const AdminFeePageTable = () => {
  const url = `/core/admin/fee/`;
  const [dataTable, setDataTable] = useState<Array<IAdminFee>>([]);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    name__icontains: '',
  });
  // const [api, contextHolder] = notification.useNotification();
  const columns: ColumnsType<IAdminFee> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'customer_service_id',
      key: 'customer_service_id',
      fixed: 'left',
      align: 'center',
      render: (_, record, index) => index + params.offset + 1,
    },
    { title: 'Nama', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'Tipe', dataIndex: 'fee_type', key: 'fee_type', width: 150 },
    {
      title: 'Tipe Transaksi',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      width: 150,
    },
    {
      title: 'Nilai',
      dataIndex: 'value',
      key: 'value',
      width: 150,
      render: (_, record) =>
        `${formatterNumber(
          parseFloat(record.value ? record.value.toString() : '')
        )}`,
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
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
            className="btn-action"
            href={`/pengaturan/admin-fee/${record.id}`}
          >
            <Edit05 />
          </Link>
          <a className="btn-action" onClick={() => deleteData(record.id)}>
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
      name__icontains: value,
    });
  };

  const exportData = async () => {
    setIsModalLoading(true);
    const param = {
      format: 'json',
      offset: 0,
      limit: 50,
      search: '',
    };
    const resp = await axiosInstance.get(url, { params: param });
    const rows = resp.data.results;
    const dataToExport = rows.map((item: IAdminFee, index: number) => ({
      No: index + 1,
      Nama: item.name,
      Tipe: item.fee_type,
      'Tipe Transaksi': item.transaction_type,
      Nilai: item.value,
      Deskripsi: item.description,
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    const colA = 5;
    const colB = rows.reduce(
      (w: number, r: IAdminFee) => Math.max(w, r.name ? r.name.length : 10),
      10
    );
    const colC = rows.reduce(
      (w: number, r: IAdminFee) =>
        Math.max(w, r.fee_type ? r.fee_type.toString().length : 10),
      10
    );
    const colD = rows.reduce(
      (w: number, r: IAdminFee) =>
        Math.max(w, r.transaction_type ? r.transaction_type.length : 10),
      10
    );
    const colE = rows.reduce(
      (w: number, r: IAdminFee) =>
        Math.max(w, r.value ? r.value.toString().length : 10),
      10
    );
    const colF = rows.reduce(
      (w: number, r: IAdminFee) =>
        Math.max(w, r.description ? r.description.length : 10),
      10
    );
    worksheet['!cols'] = [
      { wch: colA },
      { wch: colB },
      { wch: colC },
      { wch: colD },
      { wch: colE },
      { wch: colF },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'user');
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `data_user.xlsx`);
    setIsModalLoading(false);
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
      name__icontains: '',
    });
    api.info({
      message: 'Data Gold',
      description: 'Data Gold Berhasil Dihapus',
      placement: 'bottomRight',
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
            href={`/pengaturan/admin-fee/form`}
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
      <ModalConfirm
        isModalOpen={openModalConfirm}
        setIsModalOpen={setOpenModalConfirm}
        content="Hapus Data Ini?"
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default AdminFeePageTable;
