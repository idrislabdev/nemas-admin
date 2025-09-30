import Modal from 'rsuite/Modal';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import axiosInstance from '@/@core/utils/axios';
import UploadForm from '@/@core/components/forms/upload-form';
import { IOrderGold } from '@/@core/@types/interface';
import { notification } from 'antd';

const ModalProsesPengiriman = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setRefresData: Dispatch<SetStateAction<boolean>>;
  orderId: string;
}) => {
  const { isModalOpen, setIsModalOpen, setRefresData, orderId } = props;
  const [fileData, setFileData] = useState<File | null>(null);
  const [detail, setDetail] = useState<IOrderGold>({} as IOrderGold);
  const [note, setNote] = useState('');
  const [api, contextHolder] = notification.useNotification();

  const save = async () => {
    const body = new FormData();
    body.append('order', detail.order_gold_id);
    body.append('delivery_type', detail.tracking_courier_service_name);
    body.append('user', detail.user.id);

    if (detail.order_shipping.length > 0) {
      body.append('order_shipping', detail.order_shipping[0].order_delivery_id);
      body.append(
        'delivery_pickup_request_datetime',
        detail.order_shipping[0].delivery_pickup_date
      );
    }

    body.append('delivery_tracking_number', '');
    body.append('delivery_notes', note);

    // if (fileData) body.append('upload_file', fileData);

    try {
      axiosInstance
        .post(`delivery/create`, body)
        .then(() => {
          api.success({
            message: 'Proses Sukses',
            description: 'Data order pengiriman berhasil disimpan',
            placement: 'bottomRight',
          });
          setRefresData(true);
          setIsModalOpen(false);
          setFileData(null);
          setNote('');
        })
        .catch(() => {
          api.error({
            message: 'Proses Gagal',
            description: 'Data order gagal disimpan',
            placement: 'bottomRight',
          });
        });
    } catch (ex) {
      console.log(ex);
    }
  };

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(
      `/reports/gold-sales-order/${orderId}`
    );
    setDetail(resp.data);
  }, [setDetail, orderId]);

  useEffect(() => {
    if (isModalOpen) {
      setFileData(null);
      setNote('');
      fetchData();
    }
  }, [fetchData, isModalOpen]);

  return (
    <>
      {contextHolder}
      <Modal
        size="xs"
        dialogClassName="my-modal"
        backdropClassName="my-modal-backdrop"
        backdrop="static"
        keyboard={false}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <Modal.Header>
          <Modal.Title>Proses Pengiriman</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <label>Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="base text-sm font-normal"
              />
            </div>
            <div className="flex flex-col gap-[4px]">
              <label>Evidence</label>
              <UploadForm
                index={1}
                withFile={false}
                label=""
                isOptional={true}
                initFile={fileData}
                initUrl={''}
                onChange={(val) => setFileData(val)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </button>
            <button className="btn btn-primary" onClick={() => save()}>
              Simpan
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalProsesPengiriman;
