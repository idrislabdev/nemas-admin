import axiosInstance from '@/@core/utils/axios';
import { Input, Modal } from 'antd';
import { AxiosError } from 'axios';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { notification } from 'antd';
import { X, Eye, EyeOff } from '@untitled-ui/icons-react';
import { IUser } from '@/@core/@types/interface';

const ModalChangePassword = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { isModalOpen, setIsModalOpen } = props;
  const [password, setPassword] = useState('');
  const [passwrordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

  const onSave = async () => {
    const body = {
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      password: password,
    };

    try {
      await axiosInstance.put(`users/me/`, body);

      api.info({
        message: 'Password berhasil diganti',
        description: 'Abaikan',
        placement: 'bottomRight',
      });

      setIsModalOpen(false);
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const errData = err.response.data;
        const jsonError = JSON.parse(JSON.stringify(errData));
        console.log(jsonError);
      }
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      setPassword('');
      setPasswordConfirm('');
      setShowPassword(false);
      setShowPasswordConfirm(false);
    }
  }, [isModalOpen]);

  return (
    <>
      {contextHolder}

      <Modal
        className="modal-change-password"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={380}
        closeIcon={false}
      >
        <div className="relative flex flex-col justify-center items-center p-[10px] border-b border-b-gray-300">
          <h5 className="text-lg font-medium">Ganti Password</h5>

          <a
            onClick={() => setIsModalOpen(false)}
            className="absolute right-[10px] top-[13px] text-gray-700 cursor-pointer"
          >
            <X />
          </a>
        </div>

        <div className="flex flex-col gap-[20px] border-b border-b-gray-300">
          <div className="flex flex-col gap-[8px] p-[20px]">
            <div className="flex flex-col gap-[4px]">
              <label>Password Baru</label>

              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                size="small"
                suffix={
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer my-icon icon-sm"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </span>
                }
              />
            </div>

            <div className="flex flex-col gap-[4px]">
              <label>Ulangi Password</label>

              <Input
                value={passwrordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                type={showPasswordConfirm ? 'text' : 'password'}
                size="small"
                suffix={
                  <span
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="cursor-pointer my-icon icon-sm"
                  >
                    {showPasswordConfirm ? <EyeOff /> : <Eye />}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[10px] p-[20px]">
          <button
            className=" w-1/2 h-[40px] flex items-center justify-center rounded-md border"
            onClick={() => setIsModalOpen(false)}
          >
            Batal
          </button>

          <button
            className="bg-blue-600 text-white w-1/2 h-[40px] rounded-md flex items-center justify-center disabled:bg-blue-300"
            disabled={password != passwrordConfirm || password == ''}
            onClick={() => onSave()}
          >
            Simpan
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ModalChangePassword;
