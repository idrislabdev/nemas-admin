'use client';

import UploadCompressForm from '@/@core/components/forms/upload-compress-form';
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
  const [npwp, setNpwp] = useState('');
  const [kartuKeluarga, setKartuKeluarga] = useState('');
  const [namaToko, setNamaToko] = useState('');
  const [alamatToko, setAlamatToko] = useState('');
  const [siup, setSiup] = useState('');
  const [nib, setNib] = useState('');
  const [noTelp, setNoTelp] = useState('');
  const [fileData, setFileData] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [required, setRequired] = useState<IForm>({} as IForm);
  const [api, contextHolder] = notification.useNotification();

  const onCancel = () => {
    clearForm();
  };

  const onSave = async () => {
    const formData = new FormData();

    formData.append('seller_props.npwp', npwp);
    formData.append('seller_props.kartu_keluarga', kartuKeluarga);
    formData.append('seller_props.siup', siup);
    formData.append('seller_props.nama_toko', namaToko);
    formData.append('seller_props.alamat_toko', alamatToko);
    formData.append('seller_props.no_telp_toko', noTelp);

    if (fileData) {
      formData.append('seller_props.file_toko', fileData);
    }

    // kalau field lain (di luar seller_props) juga mau dikirim
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone_number', phoneNumber);
    formData.append('user_name', userName);
    formData.append('income_source', incomeSource);
    formData.append('investment_purpose', investmentPurpose);
    formData.append('referral_code', referralCode);
    formData.append('nib', nib);
    formData.append('password', `${email}12345`);
    formData.append('role', '2');

    setRequired({} as IForm);
    try {
      let desc = '';
      await axiosInstance.post(`${url}/create`, formData);
      desc = 'Data Toko Telah Disimpan';
      api.info({
        message: 'Data Toko',
        description: desc,
        placement: 'bottomRight',
      });
      clearForm();
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IForm = err.response.data;
        setRequired(data);
      }
    }
  };

  const clearForm = () => {
    setEmail('');
    setName('');
    setUserName('');
    setReferralCode('');
    setIncomeSource('');
    setInvestmenPurpose('');
    setNib('');
    setNpwp('');
    setNamaToko('');
    setPhoneNumber('');
    setKartuKeluarga('');
    setSiup('');
    setAlamatToko('');
    setNoTelp('');
    setFileData(null);
    setFileUrl('');
  };
  return (
    <>
      {contextHolder}
      <div className="form-input">
        <div className="flex gap-[20px]">
          <div className="w-1/2">
            <div className="form-area">
              <div className="flex flex-col">
                <h5 className="font-[500]">Data Utama</h5>
                <hr />
              </div>
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
                  Sumber Pendapatan{' '}
                  <span className="text-xs text-gray-400">*</span>{' '}
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
                  Tujuan Investasi{' '}
                  <span className="text-xs text-gray-400">*</span>{' '}
                </label>
                <div className="flex flex-col">
                  <input
                    value={investmentPurpose}
                    className={`base ${
                      required.investment_purpose ? 'error' : ''
                    }`}
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
          </div>
          <div className="w-1/2">
            <div className="form-area">
              <div className="flex flex-col">
                <h5 className="font-[500]">Data Toko</h5>
                <hr />
              </div>
              <div className="input-area">
                <label>
                  Nama Toko <span className="text-xs text-gray-400">*</span>{' '}
                </label>
                <div className="flex flex-col">
                  <input
                    value={namaToko}
                    className="base"
                    onChange={(e) => setNamaToko(e.target.value)}
                  />
                </div>
              </div>
              <div className="input-area">
                <label>
                  Alamat Toko <span className="text-xs text-gray-400">*</span>{' '}
                </label>
                <div className="flex flex-col">
                  <input
                    value={alamatToko}
                    className={`base`}
                    onChange={(e) => setAlamatToko(e.target.value)}
                  />
                </div>
              </div>
              <div className="input-area">
                <label>
                  No Telepon Toko{' '}
                  <span className="text-xs text-gray-400">*</span>{' '}
                </label>
                <div className="flex flex-col">
                  <input
                    value={noTelp}
                    className={`base`}
                    onChange={(e) => setNoTelp(e.target.value)}
                  />
                </div>
              </div>
              <div className="input-area">
                <label>
                  NIB <span className="text-xs text-gray-400">*</span>{' '}
                </label>
                <div className="flex flex-col">
                  <input
                    value={nib}
                    className={`base`}
                    onChange={(e) => setNib(e.target.value)}
                  />
                </div>
              </div>
              <div className="input-area">
                <label>
                  NPWP <span className="text-xs text-gray-400">*</span>{' '}
                </label>
                <div className="flex flex-col">
                  <input
                    value={npwp}
                    className={`base`}
                    onChange={(e) => setNpwp(e.target.value)}
                  />
                </div>
              </div>
              <div className="input-area">
                <label>
                  Kartu Keluarga{' '}
                  <span className="text-xs text-gray-400">*</span>{' '}
                </label>
                <div className="flex flex-col">
                  <input
                    value={kartuKeluarga}
                    className={`base`}
                    onChange={(e) => setKartuKeluarga(e.target.value)}
                  />
                </div>
              </div>
              <div className="input-area">
                <label>
                  SIUP <span className="text-xs text-gray-400">*</span>{' '}
                </label>
                <div className="flex flex-col">
                  <input
                    value={siup}
                    className={`base`}
                    onChange={(e) => setSiup(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="input-area">
          <label>File Pendukung (.zip / .rar)</label>
          <UploadCompressForm
            index={1}
            label=""
            isOptional={true}
            initFile={fileData}
            initUrl={fileUrl}
            onChange={(val) => setFileData(val)}
          />
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

export default PenggunaTokoPageForm;
