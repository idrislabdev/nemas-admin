'use client';

import axiosInstance from '@/@core/utils/axios';
import { notification } from 'antd';
import { AxiosError } from 'axios';
import React, { useState } from 'react';

const AdminPageForm = () => {
  interface IForm {
    name?: string;
    username?: string;
    email?: string;
    phone_number?: string;
  }

  const url = `/users/admin`;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [required, setRequired] = useState<IForm>({} as IForm);
  const [api, contextHolder] = notification.useNotification();

  const onCancel = () => {
    setEmail('');
    setName('');
    setUserName('');
    setPhoneNumber('');
  };
  const onSave = async () => {
    const body = {
      email: email,
      name: name,
      user_name: userName,
      password: 'admin12345',
      phone_number: phoneNumber,
      role: 3,
    };

    setRequired({ name: '', email: '', username: '' });
    try {
      let desc = '';
      await axiosInstance.post(`${url}/create`, body);
      desc = 'Data Admin Telah Disimpan';
      api.info({
        message: 'Data Admin',
        description: desc,
        placement: 'bottomRight',
      });
      setEmail('');
      setName('');
      setUserName('');
      setPhoneNumber('');
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IForm = err.response.data;
        setRequired(data);
      }
    }
  };
  return (
    <>
      {contextHolder}
      <div className="form-input">
        <div className="form-area">
          <div className="input-area">
            <label>
              Name <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <input
                value={name}
                className={`base ${required.name ? 'error' : ''}`}
                onChange={(e) => setName(e.target.value)}
              />
              {required.name && (
                <span className="text-red-500 text-xs italic">
                  {required.name?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              Username <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <input
                value={userName}
                className={`base ${required.username ? 'error' : ''}`}
                onChange={(e) => setUserName(e.target.value)}
              />
              {required.username && (
                <span className="text-red-500 text-xs italic">
                  {required.username?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              Email <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <input
                value={email}
                className={`base ${required.email ? 'error' : ''}`}
                onChange={(e) => setEmail(e.target.value)}
              />
              {required.email && (
                <span className="text-red-500 text-xs italic">
                  {required.email?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              No. Telepon <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <input
                value={phoneNumber}
                className={`base ${required.phone_number ? 'error' : ''}`}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {required.phone_number && (
                <span className="text-red-500 text-xs italic">
                  {required.phone_number?.toString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="form-button">
          <button
            className="btn btn-outline-secondary"
            onClick={() => onCancel()}
          >
            Batal
          </button>
          <button className="btn btn-primary" onClick={() => onSave()}>
            Simpan
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminPageForm;
