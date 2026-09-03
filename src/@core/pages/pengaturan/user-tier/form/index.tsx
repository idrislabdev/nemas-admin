'use client';

import { IUserTier } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';

import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { notification } from 'antd';

const UserTierPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;

  const url = `/core/user_level`;

  const [required, setRequired] = useState<IUserTier>({} as IUserTier);

  const [userLevelName, setUserLevelName] = useState('');
  const [userLevelMinPoint, setUserLevelMinPoint] = useState('');
  const [userLevelDescription, setUserLevelDescription] = useState('');
  const [percentageDiscount, setPercentageDiscount] = useState('');
  const [topupLimit, setTopupLimit] = useState('');
  const [disburstLimit, setDisburstLimit] = useState('');

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Cancel
  // ========================
  const onCancel = () => {
    if (paramsId === 'form') {
      clearForm();
    } else {
      fetchData();
    }
  };

  // ========================
  // Save / Update
  // ========================
  const onSave = async () => {
    const body = {
      user_level_name: userLevelName,

      user_level_min_point: parseInt(
        userLevelMinPoint.toString().replace(/\./g, ''),
        10
      ),

      user_level_description: userLevelDescription,

      percentage_discount: parseFloat(
        percentageDiscount.toString().replace(',', '.')
      ),

      topup_limit: parseInt(topupLimit.toString().replace(/\./g, ''), 10),

      disburst_limit: parseInt(disburstLimit.toString().replace(/\./g, ''), 10),
    };

    setRequired({});

    try {
      let desc = '';

      // ========================
      // CREATE
      // ========================
      if (paramsId === 'form') {
        await axiosInstance.post(`${url}/`, body);

        desc = 'Data User Tier Telah Disimpan';

        clearForm();
      }

      // ========================
      // UPDATE
      // ========================
      else {
        await axiosInstance.patch(`${url}/${paramsId}/`, body);

        desc = 'Data User Tier Telah Diupdate';

        // Refresh data setelah update
        await fetchData();
      }

      api.info({
        message: 'Data User Tier',
        description: desc,
        placement: 'bottomRight',
      });
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const data = err.response.data as IUserTier;

        setRequired(data);
      }
    }
  };

  // ========================
  // Fetch Data
  // ========================
  const fetchData = async () => {
    try {
      const resp = await axiosInstance.get(`${url}/${paramsId}/`);

      const { data } = resp;

      setUserLevelName(data.user_level_name ?? '');

      setUserLevelDescription(data.user_level_description ?? '');

      setUserLevelMinPoint(
        data.user_level_min_point !== undefined &&
          data.user_level_min_point !== null
          ? new Intl.NumberFormat('id-ID').format(data.user_level_min_point)
          : ''
      );

      setPercentageDiscount(
        data.percentage_discount !== undefined &&
          data.percentage_discount !== null
          ? data.percentage_discount.toString()
          : ''
      );

      setTopupLimit(
        data.topup_limit !== undefined && data.topup_limit !== null
          ? new Intl.NumberFormat('id-ID').format(data.topup_limit)
          : ''
      );

      setDisburstLimit(
        data.disburst_limit !== undefined && data.disburst_limit !== null
          ? new Intl.NumberFormat('id-ID').format(data.disburst_limit)
          : ''
      );
    } catch (error) {
      console.error('Failed to fetch user tier:', error);
    }
  };

  // ========================
  // Clear Form
  // ========================
  const clearForm = () => {
    setUserLevelName('');
    setUserLevelMinPoint('');
    setUserLevelDescription('');
    setPercentageDiscount('');
    setTopupLimit('');
    setDisburstLimit('');

    setRequired({});
  };

  // ========================
  // Number Format
  // ========================
  const handleNumberChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const numericValue = value.replace(/\D/g, '');

    setter(
      numericValue
        ? new Intl.NumberFormat('id-ID').format(Number(numericValue))
        : ''
    );
  };

  // ========================
  // Percentage Change
  // ========================
  const handlePercentageChange = (value: string) => {
    const sanitizedValue = value.replace(/[^0-9.,]/g, '');

    setPercentageDiscount(sanitizedValue);
  };

  // ========================
  // Load Data
  // ========================
  useEffect(() => {
    if (paramsId !== 'form') {
      fetchData();
    }
  }, [paramsId]);

  return (
    <div className="form-input">
      {contextHolder}

      <div className="flex items-start gap-[10px]">
        {/* ========================
            LEFT COLUMN
        ======================== */}
        <div className="form-area w-1/2">
          {/* Nama Tier */}
          <div className="input-area">
            <label>
              Nama Tier{' '}
              {required.user_level_name && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.user_level_name?.toString()})
                </span>
              )}
            </label>

            <input
              value={userLevelName}
              onChange={(e) => setUserLevelName(e.target.value)}
              className={`base ${required.user_level_name ? 'error' : ''}`}
            />
          </div>

          {/* Deskripsi */}
          <div className="input-area">
            <label>
              Deskripsi{' '}
              {required.user_level_description && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.user_level_description?.toString()})
                </span>
              )}
            </label>

            <input
              value={userLevelDescription}
              onChange={(e) => setUserLevelDescription(e.target.value)}
              className={`base ${
                required.user_level_description ? 'error' : ''
              }`}
            />
          </div>

          {/* Minimum Point */}
          <div className="input-area">
            <label>
              Minimum Point{' '}
              {required.user_level_min_point && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.user_level_min_point?.toString()})
                </span>
              )}
            </label>

            <input
              type="text"
              inputMode="numeric"
              value={userLevelMinPoint}
              onChange={(e) =>
                handleNumberChange(e.target.value, setUserLevelMinPoint)
              }
              className={`base ${required.user_level_min_point ? 'error' : ''}`}
            />
          </div>
        </div>

        {/* ========================
            RIGHT COLUMN
        ======================== */}
        <div className="form-area w-1/2">
          {/* Percentage Discount */}
          <div className="input-area">
            <label>
              Percentage Discount (%){' '}
              {required.percentage_discount && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.percentage_discount?.toString()})
                </span>
              )}
            </label>

            <input
              type="text"
              inputMode="decimal"
              value={percentageDiscount}
              onChange={(e) => handlePercentageChange(e.target.value)}
              className={`base ${required.percentage_discount ? 'error' : ''}`}
            />
          </div>

          {/* Topup Limit */}
          <div className="input-area">
            <label>
              Topup Limit{' '}
              {required.topup_limit && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.topup_limit?.toString()})
                </span>
              )}
            </label>

            <input
              type="text"
              inputMode="numeric"
              value={topupLimit}
              onChange={(e) =>
                handleNumberChange(e.target.value, setTopupLimit)
              }
              className={`base ${required.topup_limit ? 'error' : ''}`}
            />
          </div>

          {/* Disburst Limit */}
          <div className="input-area">
            <label>
              Disburst Limit{' '}
              {required.disburst_limit && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.disburst_limit?.toString()})
                </span>
              )}
            </label>

            <input
              type="text"
              inputMode="numeric"
              value={disburstLimit}
              onChange={(e) =>
                handleNumberChange(e.target.value, setDisburstLimit)
              }
              className={`base ${required.disburst_limit ? 'error' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* ========================
          BUTTON
      ======================== */}
      <div className="form-button">
        <button className="btn btn-outline-secondary" onClick={onCancel}>
          Batal
        </button>

        <button className="btn btn-primary" onClick={onSave}>
          Simpan
        </button>
      </div>
    </div>
  );
};

export default UserTierPageForm;
