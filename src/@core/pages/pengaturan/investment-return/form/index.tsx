'use client';

import { IInvesmentReturn } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { notification } from 'antd';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import CurrencyInput from 'react-currency-input-field';

const InvestmentReturnPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/investment/return`;
  const [name, setName] = useState('');
  const [rate, setRate] = useState('0');
  const [durationDays, setDurationDays] = useState('0');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState<IInvesmentReturn>(
    {} as IInvesmentReturn
  );
  const [api, contextHolder] = notification.useNotification();
  const onSave = async () => {
    const body = {
      name: name,
      rate: rate,
      duration_days: durationDays,
      description: description,
    };

    setRequired({} as IInvesmentReturn);
    try {
      let desc = '';
      if (paramsId == 'form') {
        desc = 'Data Investment Return Disimpan';
        await axiosInstance.post(`${url}/create`, body);
        setName('');
        setRate('0');
        setDescription('');
        setDurationDays('0');
      } else {
        desc = 'Data Investment Return Diupdate';
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
      }
      api.info({
        message: 'Investment Return',
        description: desc,
        placement: 'bottomRight',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IInvesmentReturn = err.response.data;
        setRequired(data);
      }
    }
  };

  const fetchData = async () => {
    const resp = await axiosInstance.get(`${url}/${paramsId}`);
    const { data } = resp;
    setRate(data.rate);
    setDurationDays(data.duration_days);
    setName(data.name);
    setDescription(data.description);
  };

  useState(() => {
    if (paramsId != 'form') fetchData();
  });
  return (
    <>
      {contextHolder}
      <div className="form-input">
        <div className="form-area">
          <div className="input-area">
            <label>
              Nama <span className="text-xs text-gray-400">*</span>{' '}
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
              Rate <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <CurrencyInput
                value={rate}
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                onValueChange={(value) => setRate(value ? value : '0')}
                className={`base ${required.rate ? 'error' : ''}`}
                placeholder="0"
              />
              {required.name && (
                <span className="text-red-500 text-xs italic">
                  {required.rate?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              Rate <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <CurrencyInput
                value={durationDays}
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                onValueChange={(value) => setDurationDays(value ? value : '0')}
                className={`base ${required.duration_days ? 'error' : ''}`}
                placeholder="0"
              />
              {required.name && (
                <span className="text-red-500 text-xs italic">
                  {required.duration_days?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              Durasi <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <input
                value={description}
                className={`base ${required.description ? 'error' : ''}`}
                onChange={(e) => setDescription(e.target.value)}
              />
              {required.name && (
                <span className="text-red-500 text-xs italic">
                  {required.description?.toString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="form-button">
          <button className="btn btn-outline-secondary">Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave()}>
            Simpan
          </button>
        </div>
      </div>
    </>
  );
};

export default InvestmentReturnPageForm;
