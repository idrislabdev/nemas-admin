'use client';

import { IPromo } from '@/@core/@types/interface';
import UploadForm from '@/@core/components/forms/upload-form';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useState, useEffect } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { notification } from 'antd';
import moment from 'moment';

const levelOptions: Record<number, string> = {
  6: 'Opulence King',
  5: 'Gold Sovereign',
  4: 'Treasure Voyager',
  3: 'Fortune Rider',
  2: 'Coin Digger',
  1: 'Novice Saver',
};

const InformationPromoPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/information/promo`;

  const [promoCode, setPromoCode] = useState('');
  const [levelingUser, setLevelingUser] = useState('');
  const [promoName, setPromoName] = useState('');
  const [promoUrl, setPromoUrl] = useState('');
  const [promoStartDate, setPromoStartDate] = useState('');
  const [promoEndDate, setPromoEndDate] = useState('');
  const [promoTag, setPromoTag] = useState('');
  const [promoUrlBackground, setPromoUrlBackground] = useState('');
  const [promoDiskon, setPromoDiskon] = useState('');
  const [promoCashback, setPromoCashback] = useState('');
  const [promoCashbackTipeUser, setPromoCashbackTipeUser] = useState('');
  const [merchantCashback, setMerchantCasbhack] = useState('');
  const [fileData, setFileData] = useState<File | null>(null);
  const [required, setRequired] = useState<IPromo>({} as IPromo);
  const [api, contextHolder] = notification.useNotification();
  const [isModalLoading, setIsModalLoading] = useState(false);

  const onCancel = () => {
    if (paramsId === 'form') {
      clearForm();
    } else {
      fetchData();
    }
  };

  const onSave = async () => {
    const body = {
      promo_code: promoCode,
      leveling_user: levelingUser,
      promo_name: promoName,
      promo_url: promoUrl,
      promo_start_date: promoStartDate,
      promo_end_date: promoEndDate,
      promo_tag: promoTag,
      promo_url_background: promoUrlBackground,
      promo_diskon: promoDiskon
        ? parseFloat(promoDiskon.replace(/\./g, '').replace(',', '.'))
        : 0,
      promo_cashback: promoCashback
        ? parseFloat(promoCashback.replace(/\./g, '').replace(',', '.'))
        : 0,
      promo_cashback_tipe_user: promoCashbackTipeUser,
      merchant_cashback: merchantCashback
        ? parseFloat(merchantCashback.replace(/\./g, '').replace(',', '.'))
        : 0,
      // create_user: username,
      // upd_user: username,
    };

    setRequired({});
    setIsModalLoading(true);
    try {
      let desc = '';
      if (paramsId === 'form') {
        const resp = await axiosInstance.post(`${url}/create/`, body);
        const { data } = resp;
        if (fileData != null) await uploadFile(data.promo_id);

        desc = 'Data Promo Telah Disimpan';
        clearForm();
      } else {
        desc = 'Data Promo Telah Diupdate';
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
        if (fileData != null) await uploadFile(paramsId);
      }
      setIsModalLoading(false);
      api.info({
        message: 'Data Promo',
        description: desc,
        placement: 'bottomRight',
      });
    } catch (error) {
      setIsModalLoading(false);
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IPromo = err.response.data;
        setRequired(data);
      }
    }
  };

  const uploadFile = async (id: string) => {
    if (fileData != null) {
      const body = new FormData();
      body.append('file', fileData);
      await axiosInstance.post(`${url}/upload/${id}/`, body);
    }
  };

  const fetchData = async () => {
    setIsModalLoading(true);
    const resp = await axiosInstance.get(`${url}/${paramsId}/`);
    const { data } = resp;
    setPromoCode(data.promo_code);
    setLevelingUser(data.leveling_user?.toString() || '');
    setPromoName(data.promo_name);
    setPromoUrl(data.promo_url);
    setPromoStartDate(moment(data.promo_start_date).format('YYYY-MM-DD'));
    setPromoEndDate(moment(data.promo_end_date).format('YYYY-MM-DD'));
    setPromoTag(data.promo_tag);
    setPromoDiskon(data.promo_diskon?.toString() || '');
    setPromoCashback(data.promo_cashback?.toString() || '');
    setMerchantCasbhack(data.merchant_cashback?.toString() || '');
    setPromoUrlBackground(data.promo_url_background);
    setIsModalLoading(false);
  };

  const changeFile = (val: File | null) => {
    if (val != null) {
      setPromoUrlBackground(URL.createObjectURL(val));
    } else {
      setPromoUrlBackground('');
    }
    setFileData(val);
  };

  const clearForm = () => {
    setPromoCode('');
    setLevelingUser('');
    setPromoName('');
    setPromoUrl('');
    setPromoStartDate('');
    setPromoEndDate('');
    setPromoTag('');
    setPromoDiskon('');
    setPromoCashback('');
    setMerchantCasbhack('');
    setFileData(null);
    setPromoUrlBackground('');
  };

  useEffect(() => {
    if (paramsId !== 'form') fetchData();
  }, [paramsId]);

  return (
    <>
      {contextHolder}
      {isModalLoading === false && (
        <div className="form-input">
          <div className="flex items-start gap-[10px]">
            <div className="form-area w-1/2">
              <div className="input-area">
                <label>
                  Gambar / Background{' '}
                  {required.promo_url_background && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_url_background?.toString()})
                    </span>
                  )}
                </label>
                <UploadForm
                  index={1}
                  withFile={false}
                  label=""
                  isOptional={true}
                  initFile={fileData}
                  initUrl={promoUrlBackground}
                  height={170}
                  onChange={(val) => changeFile(val)}
                />
              </div>
              <div className="input-area">
                <label>
                  Kode Promo{' '}
                  {required.promo_code && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_code?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="base"
                />
              </div>
              <div className="input-area">
                <label>
                  Level User{' '}
                  {required.leveling_user && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.leveling_user?.toString()})
                    </span>
                  )}
                </label>
                <select
                  value={levelingUser}
                  onChange={(e) => setLevelingUser(e.target.value)}
                  className="base"
                >
                  <option value="">-- Pilih Level User --</option>
                  {Object.entries(levelOptions).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-area">
                <label>
                  Nama Promo{' '}
                  {required.promo_name && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_name?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                  className="base"
                />
              </div>
              <div className="input-area">
                <label>
                  Promo URL{' '}
                  {required.promo_url && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_url?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={promoUrl}
                  onChange={(e) => setPromoUrl(e.target.value)}
                  className="base"
                />
              </div>
            </div>

            <div className="form-area w-1/2">
              <div className="input-area">
                <label>
                  Tanggal Mulai Promo{' '}
                  {required.promo_start_date && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_start_date?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={promoStartDate}
                  onChange={(e) => setPromoStartDate(e.target.value)}
                  type="date"
                  className="base"
                />
              </div>
              <div className="input-area">
                <label>
                  Tanggal Berakhir Promo{' '}
                  {required.promo_end_date && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_end_date?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={promoEndDate}
                  onChange={(e) => setPromoEndDate(e.target.value)}
                  type="date"
                  className="base"
                />
              </div>
              <div className="input-area">
                <label>
                  Promo Tag{' '}
                  {required.promo_tag && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_tag?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={promoTag}
                  onChange={(e) => setPromoTag(e.target.value)}
                  type="text"
                  className="base"
                />
              </div>
              <div className="input-area">
                <label>
                  Diskon{' '}
                  {required.promo_diskon && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_diskon?.toString()})
                    </span>
                  )}
                </label>
                <CurrencyInput
                  value={promoDiskon}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) => setPromoDiskon(value ? value : '0')}
                  className="base"
                  placeholder="0"
                />
              </div>
              <div className="input-area">
                <label>
                  Promo Cashback{' '}
                  {required.promo_cashback && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_cashback?.toString()})
                    </span>
                  )}
                </label>
                <CurrencyInput
                  value={promoCashback}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) =>
                    setPromoCashback(value ? value : '0')
                  }
                  className="base"
                  placeholder="0"
                />
              </div>
              <div className="input-area">
                <label>Tipe User Promo Cashback</label>
                <input
                  value={promoCashbackTipeUser}
                  onChange={(e) => setPromoCashbackTipeUser(e.target.value)}
                  type="text"
                  className="base"
                />
              </div>
              <div className="input-area">
                <label>
                  Merchant Cashback{' '}
                  {required.merchant_cashback && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.merchant_cashback?.toString()})
                    </span>
                  )}
                </label>
                <CurrencyInput
                  value={merchantCashback}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) =>
                    setMerchantCasbhack(value ? value : '0')
                  }
                  className="base"
                  placeholder="0"
                />
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
      )}
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diproses"
      />
    </>
  );
};

export default InformationPromoPageForm;
