import Modal from 'rsuite/Modal';
import React, { Dispatch, SetStateAction, useState } from 'react';
import TextArea from 'antd/es/input/TextArea';
import axiosInstance from '@/@core/utils/axios';
import { notification } from 'antd';

const ModalReject = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedId: string;
  setRefresData: () => void;
}) => {
  const { isModalOpen, setIsModalOpen, selectedId, setRefresData } = props;

  const [returnNotes, setReturnNotes] = useState('');
  const [api, contextHolder] = notification.useNotification();

  const rejectData = async () => {
    const body = {
      status: 'REJECTED',
      return_notes: returnNotes,
    };
    await axiosInstance.put(
      `orders/fix/order/return/${selectedId}/action/`,
      body
    );
    setIsModalOpen(false);
    api.info({
      message: 'Data Return',
      description: 'Data Return Telah Berhasil Diapprove',
      placement: 'bottomRight',
    });
    setRefresData();
  };

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
          <Modal.Title>Tolak Return Emas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <label>Alasan Ditolak</label>
              <TextArea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className={`rounded-[4px]`}
                autoSize={{ minRows: 3, maxRows: 3 }}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex gap-2 justify-center">
            <a
              className="bg-red-500 text-white flex items-center text-center justify-center w-1/2 !h-[40px] cursor-pointer rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Batalkan
            </a>
            <a
              className="bg-primary text-white flex items-center text-center justify-center w-1/2 !h-[40px] cursor-pointer rounded"
              onClick={() => rejectData()}
            >
              Ya, Tolak
            </a>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalReject;
