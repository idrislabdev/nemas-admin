import Modal from 'rsuite/Modal';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import axiosInstance from '@/@core/utils/axios';
import { IMenu } from '@/@core/@types/interface';
import { notification } from 'antd';

const ModalMenu = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  dataMenu: IMenu[];
  userId: string;
}) => {
  const { isModalOpen, setIsModalOpen, dataMenu, userId } = props;
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [api, contextHolder] = notification.useNotification();

  const handleChange = (id: number) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const save = async () => {
    const body = {
      menu_ids: checkedItems,
    };
    await axiosInstance.put(`users/menu/${userId}`, body);
    api.info({
      message: 'Data admin',
      description: 'User akses admin berhasil diupdate',
      placement: 'bottomRight',
    });
    setIsModalOpen(false);
  };

  useEffect(() => {
    const menus: number[] = [];
    dataMenu.forEach((item) => {
      if (item.accessible) menus.push(item.id);
    });
    setCheckedItems(menus);
  }, [dataMenu]);

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
          <Modal.Title>Assign Menu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-wrap items-center">
            {dataMenu.map((item: IMenu, index: number) => (
              <div className="w-1/3 pb-[10px]" key={index}>
                <label
                  key={item.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={checkedItems.includes(item.id)}
                    onChange={() => handleChange(item.id)}
                    className="w-4 h-4"
                  />
                  <span>{item.name}</span>
                </label>
              </div>
            ))}
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

export default ModalMenu;
