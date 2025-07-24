'use client';
import { IPenggunaAplikasi } from '@/@core/@types/interface';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Eye, FileDownload02, SearchSm } from '@untitled-ui/icons-react';
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
import axiosInstance from '@/@core/utils/axios';
import * as XLSX from 'xlsx';
import Link from 'next/link';
moment.locale('id');

const DataPenggunaPageTable = () => {
  const url = `/users/`;
  const [dataTable, setDataTable] = useState<Array<IPenggunaAplikasi>>([]);
  const [total, setTotal] = useState(0);
  // const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    name__icontains: '',
    email__icontains: '',
    username__icontains: '',
  });
  // const [api, contextHolder] = notification.useNotification();
  const columns: ColumnsType<IPenggunaAplikasi> = [
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
    { title: 'Username', dataIndex: 'user_name', key: 'username', width: 150 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 150 },
    {
      title: 'Alamat',
      dataIndex: 'alamat',
      key: 'alamat',
      width: 150,
      render: (_, record) =>
        (record.address != null && record.address.address) ?? '-',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      key: 'phone_number',
      width: 150,
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
      username__icontains: value,
      email__icontains: value,
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
    const dataToExport = rows.map((item: IPenggunaAplikasi, index: number) => ({
      No: index + 1,
      Nama: item.name,
      Username: item.user_name,
      Email: item.email,
      'Phone Number': item.phone_number,
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    const colA = 5;
    const colB = rows.reduce(
      (w: number, r: IPenggunaAplikasi) =>
        Math.max(w, r.name ? r.name.length : 10),
      10
    );
    const colC = rows.reduce(
      (w: number, r: IPenggunaAplikasi) =>
        Math.max(w, r.user_name ? r.user_name.length : 10),
      10
    );
    const colD = rows.reduce(
      (w: number, r: IPenggunaAplikasi) =>
        Math.max(w, r.email ? r.email.length : 10),
      10
    );
    const colE = rows.reduce(
      (w: number, r: IPenggunaAplikasi) =>
        Math.max(w, r.phone_number ? r.phone_number.length : 10),
      10
    );

    worksheet['!cols'] = [
      { wch: colA },
      { wch: colB },
      { wch: colC },
      { wch: colD },
      { wch: colE },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'user');
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `data_user.xlsx`);
    setIsModalLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <>
      {/* {contextHolder} */}
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
    </>
  );
};

export default DataPenggunaPageTable;
