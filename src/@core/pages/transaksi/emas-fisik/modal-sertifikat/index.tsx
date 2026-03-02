'use client';

import Modal from 'rsuite/Modal';
import { IGoldCertPrice, IGoldCertPriceDetail } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { CheckCircle } from '@untitled-ui/icons-react';
import { formatterNumber } from '@/@core/utils/general';

const ModalSertifikat = (props: {
  goldId: string;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onSelect: (id: string, value: string) => void;
  selectedCertIds: string[]; // ✅ tambahan prop
}) => {
  const { goldId, isModalOpen, setIsModalOpen, onSelect, selectedCertIds } =
    props;

  const url = `/core/gold/cert_price_detail/?include_stock=true&gold_id=${goldId}`;

  const [dataTable, setDataTable] = useState<Array<IGoldCertPrice>>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    cert_code__icontains: '',
  });

  const selectVal = (item: IGoldCertPriceDetail) => {
    if (item.id && item.gold_cert_code) {
      onSelect(String(item.id), item.gold_cert_code);
    }
  };

  const columns: ColumnsType<IGoldCertPriceDetail> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'cert_id',
      key: 'cert_id',
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
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
      render: (_, record) => `${formatterNumber(record.gold_weight ?? 0)} gr`,
    },
    {
      title: 'Include Stock',
      dataIndex: 'include_stock',
      key: 'include_stock',
      width: 150,
      render: (_, record) => (record.include_stock ? 'Ya' : 'Tidak'),
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (_, record) => {
        const isSelected = selectedCertIds.includes(String(record.id));

        return (
          <button
            type="button"
            disabled={isSelected}
            className={`btn-action flex !flex-row gap-[4px] ${
              isSelected ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => selectVal(record)}
          >
            <CheckCircle />
            {isSelected ? 'Sudah Dipilih' : 'Pilih'}
          </button>
        );
      },
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (error) {
      console.error(error);
    }
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (val - 1) * prev.limit,
    }));
  };

  useEffect(() => {
    if (goldId !== '0' && isModalOpen) {
      fetchData();
    }
  }, [fetchData, goldId, isModalOpen]);

  return (
    <Modal
      size="lg"
      dialogClassName="my-modal"
      backdropClassName="my-modal-backdrop"
      backdrop="static"
      keyboard={false}
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    >
      <Modal.Header>
        <Modal.Title>Pilih Serial Number</Modal.Title>
      </Modal.Header>

      <Modal.Body>
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
              current={params.offset / params.limit + 1}
              onChange={onChangePage}
              pageSize={params.limit}
              total={total}
              showSizeChanger={false}
            />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalSertifikat;
