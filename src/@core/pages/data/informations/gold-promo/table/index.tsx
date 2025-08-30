'use client';
import { IGoldPromo } from '@/@core/@types/interface';
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
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');

const GoldPromoPageTable = () => {
  const url = `/core/gold/gold_promo/`;
  const [dataTable, setDataTable] = useState<Array<IGoldPromo>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    gold_promo_code__icontains: '',
    gold_promo_description__icontains: '',
  });
  const [api, contextHolder] = notification.useNotification();
  const columns: ColumnsType<IGoldPromo> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'customer_service_id',
      key: 'customer_service_id',
      fixed: 'left',
      align: 'center',
      render: (_, record, index) => index + params.offset + 1,
    },
    {
      title: 'Kode Promo',
      dataIndex: 'gold_promo_code',
      key: 'gold_promo_code',
      width: 150,
    },
    {
      title: 'Deskripsi',
      dataIndex: 'gold_promo_description',
      key: 'gold_promo_description',
      width: 150,
    },
    {
      title: 'Berat Promo',
      dataIndex: 'gold_promo_weight',
      key: 'gold_promo_weight',
      width: 150,
      render: (_, record) => `${record.gold_promo_weight} gr`,
    },
    {
      title: 'Amount PCT',
      dataIndex: 'gold_promo_amt_pct',
      key: 'gold_promo_amt_pct',
      width: 150,
    },
    {
      title: 'Minimal Berat',
      dataIndex: 'gold_promo_min_weight',
      key: 'gold_promo_min_weight',
      width: 150,
    },
    {
      title: 'Maksimal Berat',
      dataIndex: 'gold_promo_max_weight',
      key: 'gold_promo_max_weight',
      width: 150,
    },
    {
      title: 'Minimal Amount',
      dataIndex: 'gold_promo_min_amt',
      key: 'gold_promo_min_amt',
      width: 150,
    },
    {
      title: 'Maksimal Amount',
      dataIndex: 'gold_promo_max_amt',
      key: 'gold_promo_max_amt',
      width: 150,
    },
    {
      title: 'Tanggal Mulai',
      dataIndex: 'gold_promo_start_date',
      key: 'gold_promo_start_date',
      width: 150,
      render: (_, record) =>
        moment(record.gold_promo_start_date).format('DD-MM-YYYY'),
    },
    {
      title: 'Tanggal Berakhir',
      dataIndex: 'gold_promo_end_date',
      key: 'gold_promo_end_date',
      width: 150,
      render: (_, record) =>
        moment(record.gold_promo_end_date).format('DD-MM-YYYY'),
    },

    {
      title: 'Dibuat oleh',
      dataIndex: 'create_user',
      key: 'create_user',
      width: 150,
    },
    {
      title: 'Diupdate oleh',
      dataIndex: 'upd_user',
      key: 'upd_user',
      width: 150,
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record, index) => (
        <div className="flex items-center gap-[5px] justify-center" key={index}>
          <Link
            href={`/data/informations/gold-promo/${record.gold_promo_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>
          <a
            className="btn-action"
            onClick={() => deleteData(record.gold_promo_id)}
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
      gold_promo_code__icontains: value,
      gold_promo_description__icontains: value,
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
      gold_promo_code__icontains: '',
      gold_promo_description__icontains: '',
    });
    api.info({
      message: 'Data Pelayanan Pelanggan',
      description: 'Data Pelayanan Pelanggan Berhasil Dihapus',
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
          <button className="btn btn-primary">
            <FileDownload02 />
            Export Excel
          </button>
          <Link
            href={`/data/informations/gold-promo/form`}
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
    </>
  );
};

export default GoldPromoPageTable;
