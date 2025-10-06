'use client';

import { IAdminFee } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { notification } from 'antd';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';

const AdminFeePageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/admin/fee`;
  const [name, setName] = useState('');
  const [feeType, setFeeType] = useState('percentage');
  const [transactionType, setTransactionType] = useState('investment');
  const [value, setValue] = useState('0');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState<IAdminFee>({} as IAdminFee);
  const [api, contextHolder] = notification.useNotification();

  const onCancel = () => {
    if (paramsId == 'form') {
      setValue('0');
      setName('');
      setFeeType('');
      setDescription('');
      setTransactionType('');
    } else {
      fetchData();
    }
  };
  const onSave = async () => {
    const body = {
      name: name,
      fee_type: feeType,
      transaction_type: transactionType,
      value: value.toString().replace('.', '').replace(',', '.'),
      description: description,
    };

    setRequired({} as IAdminFee);
    try {
      let desc = '';
      if (paramsId == 'form') {
        desc = 'Data Admin Fee Disimpan';
        await axiosInstance.post(`${url}/create/`, body);
        setValue('0');
        setName('');
        setFeeType('');
        setDescription('');
        setTransactionType('');
      } else {
        desc = 'Data Admin Fee Diupdate';
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
      }
      api.info({
        message: 'Admin Fee',
        description: desc,
        placement: 'bottomRight',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IAdminFee = err.response.data;
        setRequired(data);
      }
    }
  };

  const fetchData = async () => {
    const resp = await axiosInstance.get(`${url}/${paramsId}`);
    const { data } = resp;
    setFeeType(data.fee_type);
    setTransactionType(data.transaction_type);
    setName(data.name);
    setValue(data.value);
    setDescription(data.description);
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
              Tipe <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                className="base"
              >
                <option value={`percentage`}>Persentase</option>
                <option value={`fixed`}>Fixed</option>
              </select>
              {required.name && (
                <span className="text-red-500 text-xs italic">
                  {required.fee_type?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              Tipe Transaksi <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="base"
              >
                <option value={`investment`}>Investment</option>
                <option value={`redeem`}>Redeem</option>
                <option value={`loan`}>Loan</option>
                <option value={`loan_transfer`}>Loan Transfer</option>
                <option value={`admin_commission`}>Admin Commission</option>
              </select>
              {required.name && (
                <span className="text-red-500 text-xs italic">
                  {required.fee_type?.toString()}
                </span>
              )}
            </div>
          </div>
          <div className="input-area">
            <label>
              Nilai <span className="text-xs text-gray-400">*</span>{' '}
            </label>
            <div className="flex flex-col">
              <CurrencyInput
                value={value}
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                onValueChange={(value) => setValue(value ? value : '0')}
                className={`base ${required.value ? 'error' : ''}`}
                placeholder="0"
              />
              {required.name && (
                <span className="text-red-500 text-xs italic">
                  {required.value?.toString()}
                </span>
              )}
            </div>
          </div>

          <div className="input-area">
            <label>
              Deskripsi <span className="text-xs text-gray-400">*</span>{' '}
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

export default AdminFeePageForm;
