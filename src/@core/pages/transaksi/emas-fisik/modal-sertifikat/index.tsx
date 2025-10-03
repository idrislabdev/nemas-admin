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
}) => {
  const { goldId, isModalOpen, setIsModalOpen, onSelect } = props;
  const url = `/core/gold/cert_price_detail/?gold_id=${goldId}`;
  const [dataTable, setDataTable] = useState<Array<IGoldCertPrice>>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    cert_code__icontains: '',
  });
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
        <a
          className="btn-action !flex-row gap-[4px]"
          onClick={() => selectVal(record)}
        >
          <CheckCircle /> Pilih
        </a>
      ),
    },
  ];

  const selectVal = (item: IGoldCertPriceDetail) => {
    if (item.id && item.gold_cert_code) {
      onSelect(item.id, item.gold_cert_code);
    }
  };

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  useEffect(() => {
    if (goldId != '0') fetchData();
  }, [fetchData]);

  return (
    <>
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
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ModalSertifikat;
