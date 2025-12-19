import Modal from 'rsuite/Modal';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import axiosInstance from '@/@core/utils/axios';
import { IOrderGoldItem } from '@/@core/@types/interface';
import { Pagination, Empty, Spin } from 'antd';
import debounce from 'debounce';

const ModalOrderItem = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm: (item: IOrderGoldItem) => void;
}) => {
  const { isModalOpen, setIsModalOpen, onConfirm } = props;

  const [dataTable, setDataTable] = useState<IOrderGoldItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    order_gold_number: '',
    is_returned: false,
    is_delivered: true,
  });

  /* =====================
     Handlers
  ====================== */

  const handleSearch = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      order_gold_number: value,
    }));
  };

  const onChangePage = (page: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  };

  /* =====================
     Fetch Data
  ====================== */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axiosInstance.get(`orders/fix/order/item`, {
        params,
      });

      setDataTable(resp.data.results || []);
      setTotal(resp.data.count || 0);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (isModalOpen) {
      setParams((prev) => ({
        ...prev,
        offset: 0,
        order_gold_number: '',
      }));
    }
  }, [isModalOpen]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Modal
      dialogClassName="my-modal"
      backdropClassName="my-modal-backdrop"
      backdrop="static"
      keyboard={false}
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      size="lg"
    >
      <Modal.Header>
        <Modal.Title>List Order Item</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Search */}
        <div className="mb-3">
          <input
            className="border rounded-md px-3 py-1.5 text-sm w-full"
            placeholder="Cari..."
            onChange={debounce(
              (event) => handleSearch(event.target.value),
              1000
            )}
          />
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-[8px] overflow-y-auto h-[439px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Order Number</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Brand</th>
                <th className="p-2 text-right">Berat</th>
                <th className="p-2 text-right">Harga</th>
                <th className="p-2 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    <Spin />
                  </td>
                </tr>
              ) : dataTable.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6">
                    <Empty />
                  </td>
                </tr>
              ) : (
                dataTable.map((item) => (
                  <tr
                    key={item.order_gold_detail_id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-2">{item.order_number}</td>
                    <td className="p-2">{item.gold_type}</td>
                    <td className="p-2">{item.gold_brand}</td>
                    <td className="p-2 text-right">
                      {item.weight.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {item.order_price.toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => onConfirm(item)}
                        className="text-blue-600 hover:underline"
                      >
                        Pilih
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end mt-4">
          <Pagination
            current={params.offset / params.limit + 1}
            onChange={onChangePage}
            pageSize={params.limit}
            total={total}
            showSizeChanger={false}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalOrderItem;
