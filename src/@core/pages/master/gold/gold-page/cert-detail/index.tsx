'use client';
import { IGoldCertPrice, IGoldCertPriceDetail } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import axiosInstance from '@/@core/utils/axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Edit05, Plus, Trash01 } from '@untitled-ui/icons-react';
import { notification } from 'antd';
import { formatterNumber } from '@/@core/utils/general';
import ModalAddCertificate from './modal-add';

const GoldCertDetailTable = (props: {
  goldId: string;
  certificateId: string;
}) => {
  const { goldId, certificateId } = props;
  const url = `/core/gold/cert_price_detail/?gold_id=${goldId}`;
  const [dataTable, setDataTable] = useState<Array<IGoldCertPrice>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [paramsId, setParamsId] = useState('');
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    cert_code__icontains: '',
  });
  const [api, contextHolder] = notification.useNotification();
  const columns: ColumnsType<IGoldCertPriceDetail> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'cert_id',
      key: 'cert_id',
      fixed: 'left',
      align: 'center',
      render: (_, record, index) => index + params.offset + 1,
    },
    {
      title: 'Serial Number',
      dataIndex: 'gold_cert_code',
      key: 'gold_cert_code',
      width: 150,
    },
    {
      title: 'Satuan (gr)',
      dataIndex: 'gold_weight',
      key: 'gold_weight',
      width: 120,
      render: (_, record) =>
        `${formatterNumber(record.gold_weight ? record.gold_weight : 0)} gr`,
    },
    {
      title: 'Include Stock',
      dataIndex: 'include_stock',
      key: 'include_stock',
      width: 150,
      render: (_, record) => `${record.include_stock ? 'Ya' : 'Tidak'}`,
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <a
            className="btn-action"
            onClick={() => editData(record.id ? record.id.toString() : '')}
          >
            <Edit05 />
          </a>
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

  const deleteData = (id: string | undefined) => {
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
      cert_code__icontains: '',
    });
    api.info({
      message: 'Data Stock Sertifikat Emas',
      description: 'Data Stock Sertifikat Emas Berhasil Dihapus',
      placement: 'bottomRight',
    });
  };

  const editData = (id: string) => {
    setParamsId(id);
    setIsModalOpen(true);
  };

  const addNewData = () => {
    setParamsId('');
    setIsModalOpen(true);
  };

  const onConfirmUpdateCert = () => {
    api.info({
      message: 'Data Stock Sertifikat Emas',
      description: 'Data Stock Sertifikat Emas Telah Diupdate',
      placement: 'bottomRight',
    });
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      cert_code__icontains: '',
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-end">
        <a
          className="btn btn-outline-neutral cursor-pointer"
          onClick={() => addNewData()}
        >
          <Plus />
          Tambah Sertifikat
        </a>
      </div>
      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="cert_id"
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
      {isModalOpen == true && (
        <ModalAddCertificate
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          paramsId={paramsId}
          goldId={goldId}
          certificateId={certificateId}
          onConfirm={() => onConfirmUpdateCert()}
        />
      )}
    </>
  );
};

export default GoldCertDetailTable;
