import Modal from 'rsuite/Modal';
import React, { Dispatch, SetStateAction } from 'react';
import axiosInstance from '@/@core/utils/axios';
import { IPenggunaAplikasi } from '@/@core/@types/interface';
import { AnnotationQuestion } from '@untitled-ui/icons-react';

const ModalstatusVerify = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  userDetail: IPenggunaAplikasi;
  setRefresData: Dispatch<SetStateAction<boolean>>;
}) => {
  const { isModalOpen, setIsModalOpen, userDetail, setRefresData } = props;

  const save = async () => {
    await axiosInstance.put(`users/admin/${userDetail.id}/verify`);
    setRefresData(true);
    setIsModalOpen(false);
  };

  return (
    <Modal
      size="xs"
      dialogClassName="my-modal"
      backdropClassName="my-modal-backdrop"
      backdrop="static"
      keyboard={false}
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    >
      <Modal.Body>
        <div className="flex flex-col justify-center items-center gap-[8px]">
          <span className="my-icon icon-72px">
            <AnnotationQuestion />
          </span>
          <h5>Verifikasi Akun Ini?</h5>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex gap-2 justify-center items-center w-full">
          <button
            className="btn btn-outline-primary w-1/2 items-center justify-center"
            onClick={() => setIsModalOpen(false)}
          >
            Tidak
          </button>
          <button
            className="btn btn-primary w-1/2 items-center justify-center"
            onClick={() => save()}
          >
            Ya, Lanjutkan
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalstatusVerify;
