'use client';

import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { notification } from 'antd';
import { AxiosError } from 'axios';
import React, { useRef, useState } from 'react';

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
  const [incomeSource, setIncomeSource] = useState('-');
  const [investmentPurpose, setInvestmenPurpose] = useState('-');
  const [referralCode, setReferralCode] = useState('-');
  const [npwp, setNpwp] = useState('');
  const [kartuKeluarga, setKartuKeluarga] = useState('-');
  const [namaToko, setNamaToko] = useState('');
  const [alamatToko, setAlamatToko] = useState('');
  const [siup, setSiup] = useState('');
  const [nib, setNib] = useState('');
  const [noTelp, setNoTelp] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [required, setRequired] = useState<IForm>({} as IForm);
  const [api, contextHolder] = notification.useNotification();

  const [fileNpwp, setFileNpwp] = useState<File | null>(null);
  const [fileNib, setFileNib] = useState<File | null>(null);
  const [fileContactPerson, setFileContactPerson] = useState<File | null>(null);
  const [photoKtp, setPhotoKtp] = useState<File | null>(null);

  const fileNibRef = useRef<HTMLInputElement>(null);
  const fileNpwpRef = useRef<HTMLInputElement>(null);
  const fileContactPersonRef = useRef<HTMLInputElement>(null);
  const photoKtpRef = useRef<HTMLInputElement>(null);

  const onCancel = () => {
    clearForm();
  };

  const uploadFile = async (file: File | null): Promise<string> => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);

    const res = await axiosInstance.post(
      `/users/user/seller/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return res.data.file_url || res.data;
  };

  const onSave = async () => {
    setIsModalLoading(true);
    const formData = new FormData();

    formData.append('seller_props.npwp', npwp);
    formData.append('seller_props.kartu_keluarga', kartuKeluarga);
    formData.append('seller_props.siup', siup);
    formData.append('seller_props.nama_toko', namaToko);
    formData.append('seller_props.alamat_toko', alamatToko);
    formData.append('seller_props.no_telp_toko', noTelp);

    if (fileNib) {
      formData.append('seller_props.file_nib', await uploadFile(fileNib));
    }

    if (fileNpwp) {
      formData.append('seller_props.file_npwp', await uploadFile(fileNpwp));
    }

    if (fileContactPerson) {
      formData.append(
        'seller_props.file_contact_person',
        await uploadFile(fileContactPerson)
      );
    }

    if (photoKtp) {
      formData.append('seller_props.photo_ktp_url', await uploadFile(photoKtp));
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
      setIsModalLoading(false);
      clearForm();
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IForm = err.response.data;
        setRequired(data);
      }
      setIsModalLoading(false);
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
    setFileNib(null);
    setFileNpwp(null);
    setFileContactPerson(null);
    setPhotoKtp(null);

    if (fileNibRef.current) fileNibRef.current.value = '';
    if (fileNpwpRef.current) fileNpwpRef.current.value = '';
    if (fileContactPersonRef.current) fileContactPersonRef.current.value = '';
    if (photoKtpRef.current) photoKtpRef.current.value = '';
  };
  return (
    <>
      {contextHolder}
      <div className="form-input">
        <div className="flex gap-[20px]">
          <div className="w-1/2">
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
            </div>
          </div>
          <div className="w-1/2">
            <div className="form-area">
              <div className="input-area">
                <label>
                  Alamat Toko <span className="text-xs text-gray-400">*</span>{' '}
                </label>
                <div className="flex flex-col">
                  <textarea
                    value={alamatToko}
                    className={`base`}
                    onChange={(e) => setAlamatToko(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="input-area w-1/2">
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
                <div className="input-area w-1/2">
                  <label>
                    File NPWP <span className="text-xs text-gray-400">*</span>{' '}
                  </label>
                  <input
                    ref={fileNpwpRef}
                    type="file"
                    className={`base`}
                    accept=".png, .jpg,.jpeg,.pdf"
                    onChange={(e) => setFileNpwp(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="input-area w-1/2">
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
                <div className="input-area w-1/2">
                  <label>
                    File NIB <span className="text-xs text-gray-400">*</span>{' '}
                  </label>
                  <input
                    ref={fileNibRef}
                    type="file"
                    className={`base`}
                    accept=".png, .jpg,.jpeg,.pdf"
                    onChange={(e) => setFileNib(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="input-area w-1/2">
                  <label>
                    File Contact Person
                    <span className="text-xs text-gray-400">*</span>{' '}
                  </label>
                  <input
                    ref={fileContactPersonRef}
                    type="file"
                    className={`base`}
                    accept=".png, .jpg,.jpeg,.pdf"
                    onChange={(e) =>
                      setFileContactPerson(e.target.files?.[0] || null)
                    }
                  />
                </div>
                <div className="input-area w-1/2">
                  <label>
                    Foto KTP
                    <span className="text-xs text-gray-400">*</span>{' '}
                  </label>
                  <input
                    ref={photoKtpRef}
                    type="file"
                    className={`base`}
                    accept=".png, .jpg,.jpeg,.pdf"
                    onChange={(e) => setPhotoKtp(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
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
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diproses"
      />
    </>
  );
};

export default PenggunaTokoPageForm;
