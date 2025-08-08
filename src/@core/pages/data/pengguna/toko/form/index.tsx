'use client';

import axiosInstance from '@/@core/utils/axios';
import { notification } from 'antd';
import { AxiosError } from 'axios';
import React, { useState } from 'react';

const PenggunaTokoPageForm = () => {
  interface IForm {
    name?: string;
    user_name?: string;
    email?: string;
    phone_number?: string;
    income_source?: string;
    referral_code?: string;
    investment_purpose?: string;
  }

  const url = `/users/admin`;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [investmentPurpose, setInvestmenPurpose] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [required, setRequired] = useState<IForm>({} as IForm);
  const [api, contextHolder] = notification.useNotification();
  const onSave = async () => {
    const body = {
      email: email,
      name: name,
      user_name: userName,
      password: `${email}12345`,
      role: 2,
    };

    setRequired({} as IForm);
    try {
      let desc = '';
      await axiosInstance.post(`${url}/create`, body);
      desc = 'Data Toko Telah Disimpan';
      api.info({
        message: 'Data Toko',
        description: desc,
        placement: 'bottomRight',
      });
      setEmail('');
      setName('');
      setUserName('');
      setReferralCode('');
      setIncomeSource('');
      setInvestmenPurpose('');
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
                className={`base ${required.user_name ? 'error' : ''}`}
                onChange={(e) => setUserName(e.target.value)}
              />
              {required.user_name && (
                <span className="text-red-500 text-xs italic">
                  {required.user_name?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              No. Handphone <span className="text-xs text-gray-400">*</span>{' '}
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
              Sumber Pendapatan <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <input
                value={incomeSource}
                className={`base ${required.income_source ? 'error' : ''}`}
                onChange={(e) => setIncomeSource(e.target.value)}
              />
              {required.income_source && (
                <span className="text-red-500 text-xs italic">
                  {required.income_source?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              Tujuan Investasi <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <input
                value={investmentPurpose}
                className={`base ${required.investment_purpose ? 'error' : ''}`}
                onChange={(e) => setInvestmenPurpose(e.target.value)}
              />
              {required.investment_purpose && (
                <span className="text-red-500 text-xs italic">
                  {required.investment_purpose?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              Kode Referral <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <input
                value={referralCode}
                className={`base ${required.referral_code ? 'error' : ''}`}
                onChange={(e) => setReferralCode(e.target.value)}
              />
              {required.referral_code && (
                <span className="text-red-500 text-xs italic">
                  {required.referral_code?.toString()}
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

export default PenggunaTokoPageForm;
