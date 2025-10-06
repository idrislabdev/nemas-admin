'use client';

import { ICustomerService } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { AxiosError } from 'axios';

const InformationCustomerServicePageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/information/customer_service`;
  const [informationName, setInformationName] = useState('');
  const [informationPhone, setInformationPhone] = useState('');
  const [required, setRequired] = useState<ICustomerService>(
    {} as ICustomerService
  );
  const [api, contextHolder] = notification.useNotification();

  const onCancel = () => {
    if (paramsId == 'form') {
      clearForm();
    } else {
      fetchData();
    }
  };

  const onSave = async () => {
    const body = {
      information_name: informationName,
      information_phone: informationPhone,
    };

    setRequired({});
    try {
      let desc = '';
      if (paramsId == 'form') {
        await axiosInstance.post(`${url}/create`, body);
        desc = 'Data Pelayanan Pelanggan Telah Disimpan';
        clearForm();
      } else {
        desc = 'Data Pelayanan Pelanggan Telah Diupdate';
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
      }
      api.info({
        message: 'Data Pelayanan Pelanggan',
        description: desc,
        placement: 'bottomRight',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: ICustomerService = err.response.data;
        setRequired(data);
      }
    }
  };

  const fetchData = async () => {
    const resp = await axiosInstance.get(`${url}/${paramsId}`);
    const { data } = resp;
    setInformationName(data.information_name);
    setInformationPhone(data.information_phone);
  };

  const clearForm = () => {
    setInformationName('');
    setInformationPhone('');
  };

  useEffect(() => {
    if (paramsId != 'form') fetchData();
  }, []);

  return (
    <div className="form-input">
      {contextHolder}
      <div className="form-area">
        <div className="input-area">
          <label>
            Nama Informasi{' '}
            {required.information_name && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.information_name?.toString()})
              </span>
            )}
          </label>
          <input
            value={informationName}
            onChange={(e) => setInformationName(e.target.value)}
            className={`base ${required.information_name ? 'error' : ''}`}
          />
        </div>
        <div className="input-area">
          <label>
            No. Telepon Informasi{' '}
            {required.information_phone && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.information_phone?.toString()})
              </span>
            )}
          </label>
          <input
            value={informationPhone}
            onChange={(e) => setInformationPhone(e.target.value)}
            className={`base ${required.information_phone ? 'error' : ''}`}
          />
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
  );
};

export default InformationCustomerServicePageForm;
