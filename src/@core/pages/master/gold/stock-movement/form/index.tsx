'use client';

import { IGoldStockMovement } from '@/@core/@types/interface';
// import axiosInstance from '@/@core/utils/axios';
import React, { useState } from 'react';
import { notification } from 'antd';
import CurrencyInput from 'react-currency-input-field';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { FlipBackward } from '@untitled-ui/icons-react';
const GoldStockMovementPageForm = () => {
  const url = `/gold-transaction/gold-stock/movement`;
  const [weight, setWeight] = useState('0');
  const [transactionType, setTransactionType] = useState('IN');
  const [note, setNote] = useState('');
  const [required, setRequired] = useState<IGoldStockMovement>(
    {} as IGoldStockMovement
  );
  const [api, contextHolder] = notification.useNotification();
  const [isModalLoading, setIsModalLoading] = useState(false);

  const onSave = async () => {
    const body = {
      weight: parseFloat(weight.toString().replace('.', '').replace(',', '.')),
      movement_type: transactionType,
      note: note,
    };
    setIsModalLoading(true);
    setRequired({} as IGoldStockMovement);
    try {
      await axiosInstance.post(`${url}/create`, body);
      clearForm();
      const desc = 'Stock Movement Telah Diupdate';
      api.info({
        message: 'Stock Movement',
        description: desc,
        placement: 'bottomRight',
      });
      setIsModalLoading(false);
    } catch (error) {
      setIsModalLoading(false);
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IGoldStockMovement = err.response.data;
        setRequired(data);
      }
    }
  };

  const clearForm = () => {
    setWeight('');
    setTransactionType('');
    setNote('');
  };

  return (
    <>
      <div className="form-input">
        {contextHolder}
        <div className="flex gap-[4px] items-center justify-end">
          <button className="btn btn-primary" onClick={() => onSave()}>
            Simpan
          </button>
          <Link
            href={`/master/gold/stock-movement`}
            className="btn btn-outline-neutral"
          >
            <FlipBackward /> Kembali
          </Link>
        </div>
        <div className="form-area">
          <div className="input-area">
            <label>
              Berat Emas (gr){' '}
              {required.weight && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.weight?.toString()})
                </span>
              )}
            </label>
            <div className="group-input prepend">
              <span className="prepend !top-[5px]">gr</span>
              <CurrencyInput
                value={weight}
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                onValueChange={(value) => setWeight(value ? value : '0')}
                className={`base ${required.weight ? 'error' : ''}`}
              />
            </div>
          </div>
          <div className="input-area">
            <label>
              Tipe{' '}
              {required.transaction_type && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.transaction_type?.toString()})
                </span>
              )}
            </label>
            <select
              className={`base ${required.transaction_type ? 'error' : ''}`}
              defaultValue={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value={'IN'}>IN</option>
              <option value={'OUT'}>OUT</option>
            </select>
          </div>
          <div className="flex flex-col gap-[4px]">
            <label>
              Catatan{' '}
              {required.note && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.note?.toString()})
                </span>
              )}
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="base"
            />
          </div>
        </div>
      </div>
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diproses"
      />
    </>
  );
};

export default GoldStockMovementPageForm;
