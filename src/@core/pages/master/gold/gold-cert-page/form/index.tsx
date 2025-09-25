'use client';
import { IGoldCert } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import React, { useState } from 'react';
import { notification } from 'antd';
import CurrencyInput from 'react-currency-input-field';
import { AxiosError } from 'axios';

const GoldCertPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/gold/cert`;
  const [required, setRequired] = useState<IGoldCert>({} as IGoldCert);
  const [certCode, setCertCode] = useState('');
  const [certName, setCertName] = useState('');
  const [goldWeight, setGoldWeight] = useState('');
  const [certPrice, setCertPrice] = useState('');
  const [api, contextHolder] = notification.useNotification();

  const onCancel = () => {
    if (paramsId == 'form') {
      clearForm();
    } else {
      fetchData();
    }
  };

  const onSave = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // const axiosInstance = axios.create({
    //     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    //     timeout: 200000
    // })
    const body = {
      cert_code: certCode,
      cert_name: certName,
      gold_weight: parseInt(
        goldWeight.toString().replace('.', '').replace(',', '.')
      ),
      cert_price: parseFloat(
        certPrice.toString().replace('.', '').replace(',', '.')
      ),
      create_user: user.id,
    };
    setRequired({});
    try {
      let desc = '';
      if (paramsId == 'form') {
        await axiosInstance.post(`${url}/create`, body);
        desc = 'Data Gold Cert Price Telah Disimpan';
        clearForm();
      } else {
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
        desc = 'Data Gold Cert Price Telah Diupdate';
      }
      clearForm();
      api.info({
        message: 'Data Gold Cert Price',
        description: desc,
        placement: 'bottomRight',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IGoldCert = err.response.data;
        setRequired(data);
      }
    }
  };

  const fetchData = async () => {
    const resp = await axiosInstance.get(`${url}/${paramsId}/`);
    const { data } = resp;
    setCertCode(data.cert_code);
    setCertName(data.cert_name);
    setGoldWeight(data.gold_weight.toString());
    setCertPrice(data.cert_price.toString());
  };

  useState(() => {
    if (paramsId != 'form') fetchData();
  });

  const clearForm = () => {
    setCertCode('');
    setGoldWeight('');
    setCertPrice('');
    setCertName('');
  };
  return (
    <div className="form-input">
      {contextHolder}
      <div className="form-area">
        <div className="input-area">
          <label>
            Kode Sertifikat{' '}
            {required.cert_code && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.cert_code?.toString()})
              </span>
            )}
          </label>
          <input
            value={certCode}
            onChange={(e) => setCertCode(e.target.value)}
            className={`base ${required.cert_code ? 'error' : ''}`}
          />
        </div>
        <div className="input-area">
          <label>
            Nama Sertifikat{' '}
            {required.cert_code && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.cert_code?.toString()})
              </span>
            )}
          </label>
          <input
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            className={`base ${required.cert_name ? 'error' : ''}`}
          />
        </div>
        <div className="input-area">
          <label>
            Satuan (gr){' '}
            {required.gold_weight && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.gold_weight?.toString()})
              </span>
            )}
          </label>
          <div className="group-input prepend">
            <span className="prepend !top-[5px]">gr</span>
            <input
              value={goldWeight}
              onChange={(e) =>
                setGoldWeight(
                  e.target.value
                    .replace(/(?!\,)\D/g, '')
                    .replace(/(?<=\,,*)\,/g, '')
                    .replace(/(?<=\,\d\d).*/g, '')
                    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                )
              }
              className={`base ${required.gold_weight ? 'error' : ''}`}
            />
          </div>
        </div>
        <div className="input-area">
          <label>
            Harga Sertifikat{' '}
            {required.cert_price && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.cert_price?.toString()})
              </span>
            )}
          </label>
          <CurrencyInput
            value={certPrice}
            decimalsLimit={2}
            decimalSeparator=","
            groupSeparator="."
            onValueChange={(value) => setCertPrice(value ? value : '0')}
            className={`base ${required.cert_price ? 'error' : ''}`}
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

export default GoldCertPageForm;
