import Modal from 'rsuite/Modal';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Select } from 'antd';
import axiosInstance from '@/@core/utils/axios';
import { IPenggunaAplikasi } from '@/@core/@types/interface';

const Modalstatus = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  userDetail: IPenggunaAplikasi;
  setRefresData: Dispatch<SetStateAction<boolean>>;
}) => {
  const { isModalOpen, setIsModalOpen, userDetail, setRefresData } = props;
  const [userActive, setUserActive] = useState(userDetail.is_active);

  const save = async () => {
    const body = {
      phone_number: userDetail.phone_number,
      email: userDetail.email,
      name: userDetail.name,
      is_active: userActive,
    };
    await axiosInstance.patch(`users/admin/${userDetail.id}`, body);
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
      <Modal.Header>
        <Modal.Title>Update Status Pengguna</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-[8px]">
          <div className="flex flex-col gap-[4px]">
            <label>Status</label>
            <Select
              value={userActive}
              showSearch
              size="small"
              className="w-full select-base"
              options={[
                { value: true, label: 'Aktif' },
                { value: false, label: 'Tidak Aktif' },
              ]}
              optionFilterProp="label"
              onChange={(e) => setUserActive(e)}
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
  );
};

export default Modalstatus;
