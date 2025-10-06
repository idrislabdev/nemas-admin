'use client';

import { IRating } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import React, { useEffect, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { notification } from 'antd';
import { AxiosError } from 'axios';

const InformationRatingPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/information/rating`;
  const [informationRateName, setInformationRateName] = useState('');
  const [rate, setRate] = useState('');
  const [message, setMessage] = useState('');
  const [publish, setPublish] = useState(true);
  const [required, setRequired] = useState<IRating>({} as IRating);
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
      information_rate_name: informationRateName,
      rate: parseFloat(rate.toString().replace('.', '').replace(',', '.')),
      message: message,
      publish: publish,
    };

    setRequired({});
    try {
      let desc = '';
      if (paramsId == 'form') {
        await axiosInstance.post(`${url}/create/`, body);
        desc = 'Data Rating Telah Disimpan';
        clearForm();
      } else {
        desc = 'Data Rating Telah Diupdate';
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
      }
      api.info({
        message: 'Data Rating',
        description: desc,
        placement: 'bottomRight',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IRating = err.response.data;
        setRequired(data);
      }
    }
  };

  const fetchData = async () => {
    const resp = await axiosInstance.get(`${url}/${paramsId}/`);
    const { data } = resp;
    setInformationRateName(data.information_rate_name);
    setRate(data.rate.toString());
    setMessage(data.message);
  };

  const clearForm = () => {
    setInformationRateName('');
    setRate('');
    setMessage('');
  };

  useEffect(() => {
    if (paramsId != 'form') fetchData();
  }, []);
  return (
    <>
      {contextHolder}
      <div className="form-input">
        <div className="form-area">
          <div className="input-area">
            <label>
              Nama Informasi{' '}
              {required.information_rate_name && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.information_rate_name?.toString()})
                </span>
              )}
            </label>
            <input
              value={informationRateName}
              onChange={(e) => setInformationRateName(e.target.value)}
              className="base"
            />
          </div>
          <div className="input-area">
            <label>
              Rate{' '}
              {required.rate && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.rate?.toString()})
                </span>
              )}
            </label>
            <CurrencyInput
              value={rate}
              decimalsLimit={2}
              decimalSeparator=","
              groupSeparator="."
              onValueChange={(value) => setRate(value ? value : '0')}
            />
          </div>
          <div className="input-area">
            <label>
              Message / Pesan{' '}
              {required.message && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.message?.toString()})
                </span>
              )}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="base"
            />
          </div>
          <div className="input-area">
            <label>
              Publish{' '}
              {required.publish && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.publish?.toString()})
                </span>
              )}
            </label>
            <select
              defaultValue={publish ? 'publish' : 'not_publish'}
              onChange={(e) =>
                setPublish(e.target.value == 'publish' ? true : false)
              }
            >
              <option value={'publish'}>Publish</option>
              <option value={'not_publish'}>Not Publish</option>
            </select>
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

export default InformationRatingPageForm;
