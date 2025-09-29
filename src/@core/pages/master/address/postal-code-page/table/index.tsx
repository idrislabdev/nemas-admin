'use client';
import { IAddressPostalCode } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileDownload02, SearchSm } from '@untitled-ui/icons-react';
import * as XLSX from 'xlsx';
import ModalLoading from '@/@core/components/modal/modal-loading';

const AddressPostalCodePageTable = () => {
  const url = `/core/address/postal_code/`;
  const [dataTable, setDataTable] = useState<Array<IAddressPostalCode>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    search: '',
  });
  const columns: ColumnsType<IAddressPostalCode> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'district_id',
      key: 'district_id',
      align: 'center',
      fixed: 'left',
      render: (_, record, index) => index + params.offset + 1,
    },
    {
      title: 'Nama Provinsi',
      dataIndex: 'province_name',
      key: 'province_name',
    },
    {
      title: 'Nama Kabupaten / Kota',
      dataIndex: 'district_name',
      key: 'district_name',
    },
    {
      title: 'Nama Kecamatan',
      dataIndex: 'district_name',
      key: 'district_name',
    },
    {
      title: 'Nama Kelurahan / Desa',
      dataIndex: 'subdistrict_name',
      key: 'subdistrict_name',
    },
    {
      title: 'Kode Pos',
      dataIndex: 'post_code',
      key: 'post_code',
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
    const dataToExport = rows.map(
      (item: IAddressPostalCode, index: number) => ({
        No: index + 1,
        'Province Name': item.province_name,
        'City Name': item.city_name,
        'District Name': item.district_name,
        'Subdistrict Name': item.subdistrict_name,
        'Kode Pos': item.post_code,
      })
    );
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils?.json_to_sheet(dataToExport);

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kode Pos');
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `data_postal_code.xlsx`);
    setIsModalLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
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
          rowKey="city_id"
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

export default AddressPostalCodePageTable;
