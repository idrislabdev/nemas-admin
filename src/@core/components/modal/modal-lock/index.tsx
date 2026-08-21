import Modal from 'rsuite/Modal';
import React, { Dispatch, SetStateAction, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import { IPenggunaAplikasi } from '@/@core/@types/interface';

const ModalLock = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  userDetail: IPenggunaAplikasi;
  setRefresData: Dispatch<SetStateAction<boolean>>;
}) => {
  const { isModalOpen, setIsModalOpen, userDetail, setRefresData } = props;

  const [loading, setLoading] = useState(false);

  const isLocked = userDetail.is_locked;

  const save = async () => {
    try {
      setLoading(true);

      const endpoint = isLocked
        ? `/users/admin/${userDetail.id}/unlock`
        : `/users/admin/${userDetail.id}/lock`;

      await axiosInstance.post(endpoint);

      setRefresData(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed update lock status', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      size="xs"
      dialogClassName="my-modal"
      backdropClassName="my-modal-backdrop"
      backdrop="static"
      keyboard={false}
      open={isModalOpen}
      onClose={() => {
        if (!loading) {
          setIsModalOpen(false);
        }
      }}
    >
      <Modal.Header>
        <Modal.Title>{isLocked ? 'Buka Kunci Akun' : 'Kunci Akun'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-[8px]">
          <p className="text-[14px] text-neutral-600">
            Apakah Anda yakin ingin{' '}
            <span className="font-semibold text-neutral-700">
              {isLocked ? 'membuka kunci' : 'mengunci'}
            </span>{' '}
            akun pengguna ini?
          </p>

          <div className="rounded-md bg-gray-50 px-3 py-2">
            <div className="text-[13px] text-neutral-500">Pengguna</div>
            <div className="text-[14px] font-medium text-neutral-700">
              {userDetail.name ?? '-'}
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            disabled={loading}
            onClick={() => setIsModalOpen(false)}
          >
            Batal
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={save}
          >
            {loading ? 'Memproses...' : isLocked ? 'Buka Kunci' : 'Kunci Akun'}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalLock;
