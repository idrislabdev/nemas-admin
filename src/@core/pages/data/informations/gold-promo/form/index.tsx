'use client';

import { IGoldPromo } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { notification } from 'antd';

const GoldPromoPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/gold/gold_promo`;
  const [goldPromoCode, setGoldPromoCode] = useState('');
  const [goldPromoDescription, setGoldPromoDescription] = useState('');
  const [goldPromoWeight, setGoldPromoWeight] = useState('0');
  const [goldPromoAmt, setGoldPromoAmt] = useState('0');
  const [goldPromoAmtPct, setGoldPromoAmtPct] = useState('0');
  const [goldPromoMinWeight, setGoldPromoMinWeight] = useState('0');
  const [goldPromoMaxWeight, setGoldPromoMaxWeight] = useState('0');
  const [goldPromoMinAmt, setGoldPromoMinAmt] = useState('0');
  const [goldPromoMaxAmt, setGoldPromoMaxAmt] = useState('0');
  const [goldPromoStartDate, setGoldPromoStartDate] = useState('');
  const [goldPromoEndDate, setGoldPromoEndDate] = useState('');
  const [goldPromoActive, setGoldPromoActive] = useState(true);

  const [required, setRequired] = useState<IGoldPromo>({} as IGoldPromo);
  const [api, contextHolder] = notification.useNotification();
  const [isModalLoading, setIsModalLoading] = useState(false);

  const onCancel = () => {
    if (paramsId == 'form') {
      clearForm();
    } else {
      fetchData();
    }
  };

  const onSave = async () => {
    const body = {
      gold_promo_code: goldPromoCode,
      gold_promo_description: goldPromoDescription,
      gold_promo_weight: parseFloat(
        goldPromoWeight.toString().replace('.', '').replace(',', '.')
      ),
      gold_promo_amt_pct: parseFloat(
        goldPromoAmtPct.toString().replace('.', '').replace(',', '.')
      ),
      gold_promo_amt: parseFloat(
        goldPromoAmt.toString().replace('.', '').replace(',', '.')
      ),
      gold_promo_min_weight: parseFloat(
        goldPromoMinWeight.toString().replace('.', '').replace(',', '.')
      ),
      gold_promo_max_weight: parseFloat(
        goldPromoMaxWeight.toString().replace('.', '').replace(',', '.')
      ),
      gold_promo_min_amt: parseFloat(
        goldPromoMinAmt.toString().replace('.', '').replace(',', '.')
      ),
      gold_promo_max_amt: parseFloat(
        goldPromoMaxAmt.toString().replace('.', '').replace(',', '.')
      ),
      gold_promo_start_date: goldPromoStartDate,
      gold_promo_end_date: goldPromoEndDate,
      gold_promo_active: goldPromoActive,
      // "create_user": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      // "upd_user": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    };

    setRequired({});
    setIsModalLoading(true);
    try {
      let desc = '';
      if (paramsId == 'form') {
        await axiosInstance.post(`${url}/create`, body);
        desc = 'Data Promo Telah Disimpan';
        clearForm();
      } else {
        desc = 'Data Promo Telah Diupdate';
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
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
        const data: IGoldPromo = err.response.data;
        setRequired(data);
      }
    }
  };

  const fetchData = async () => {
    setIsModalLoading(true);
    const resp = await axiosInstance.get(`${url}/${paramsId}/`);
    const { data } = resp;
    setGoldPromoCode(data.gold_promo_code);
    setGoldPromoDescription(data.gold_promo_description);
    setGoldPromoWeight(data.gold_promo_weight);
    setGoldPromoAmt(data.gold_promo_amt);
    setGoldPromoAmtPct(data.gold_promo_amt_pct);
    setGoldPromoMinWeight(data.gold_promo_min_weight);
    setGoldPromoMaxWeight(data.gold_promo_max_weight);
    setGoldPromoMinAmt(data.gold_promo_min_amt);
    setGoldPromoMaxAmt(data.gold_promo_max_amt);
    setGoldPromoStartDate(data.gold_promo_start_date);
    setGoldPromoEndDate(data.gold_promo_end_date);
    setGoldPromoActive(true);
  };

  const clearForm = () => {
    setGoldPromoCode('');
    setGoldPromoDescription('');
    setGoldPromoWeight('0');
    setGoldPromoAmt('0');
    setGoldPromoAmtPct('0');
    setGoldPromoMinWeight('0');
    setGoldPromoMaxWeight('0');
    setGoldPromoMinAmt('0');
    setGoldPromoMaxAmt('0');
    setGoldPromoStartDate('');
    setGoldPromoEndDate('');
    setGoldPromoActive(true);
  };

  useEffect(() => {
    if (paramsId != 'form') fetchData();
  });
  return (
    <>
      {contextHolder}
      {isModalLoading == false && (
        <div className="form-input">
          <div className="flex items-start gap-[10px]">
            <div className="form-area w-1/2">
              <div className="input-area">
                <label>
                  Kode Promo{' '}
                  {required.gold_promo_code && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_code?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={goldPromoCode}
                  onChange={(e) => setGoldPromoCode(e.target.value)}
                  className="base"
                />
              </div>
              <div className="input-area">
                <label>
                  Deskripsi Promo{' '}
                  {required.gold_promo_description && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_description?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={goldPromoDescription}
                  onChange={(e) => setGoldPromoDescription(e.target.value)}
                  className="base"
                />
              </div>
              <div className="input-area">
                <label>
                  Berat{' '}
                  {required.gold_promo_weight && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_weight?.toString()})
                    </span>
                  )}
                </label>
                <div className="group-input prepend">
                  <span className="prepend !top-[5px]">gr</span>
                  <CurrencyInput
                    value={goldPromoWeight}
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    onValueChange={(value) =>
                      setGoldPromoWeight(value ? value : '0')
                    }
                    className={`base ${
                      required.gold_promo_weight ? 'error' : ''
                    }`}
                  />
                </div>
              </div>
              <div className="input-area">
                <label>
                  Jumlah{' '}
                  {required.gold_promo_amt && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_amt?.toString()})
                    </span>
                  )}
                </label>
                <CurrencyInput
                  value={goldPromoAmt}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) =>
                    setGoldPromoAmt(value ? value : '0')
                  }
                  className={`base ${required.gold_promo_amt ? 'error' : ''}`}
                />
              </div>
              <div className="input-area">
                <label>
                  Jumlah PCT{' '}
                  {required.gold_promo_amt_pct && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_amt_pct?.toString()})
                    </span>
                  )}
                </label>
                <CurrencyInput
                  value={goldPromoAmtPct}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) =>
                    setGoldPromoAmtPct(value ? value : '0')
                  }
                  className={`base ${
                    required.gold_promo_amt_pct ? 'error' : ''
                  }`}
                />
              </div>
              <div className="input-area">
                <label>
                  Status Promo{' '}
                  {required.gold_promo_active && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_active?.toString()})
                    </span>
                  )}
                </label>
                <select
                  defaultValue={goldPromoActive ? 'active' : 'not_active'}
                  onChange={(e) =>
                    setGoldPromoActive(
                      e.target.value == 'active' ? true : false
                    )
                  }
                  className="base"
                >
                  <option value={`active`}>Aktif</option>
                  <option value={`not_active`}>Tidak Aktif</option>
                </select>
              </div>
            </div>
            <div className="form-area w-1/2">
              <div className="input-area">
                <label>
                  Berat Minimal{' '}
                  {required.gold_promo_min_weight && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_min_weight?.toString()})
                    </span>
                  )}
                </label>
                <CurrencyInput
                  value={goldPromoMinWeight}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) =>
                    setGoldPromoMinWeight(value ? value : '0')
                  }
                  className={`base ${
                    required.gold_promo_min_weight ? 'error' : ''
                  }`}
                />
              </div>
              <div className="input-area">
                <label>
                  Berat Maksimal{' '}
                  {required.gold_promo_max_weight && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_max_weight?.toString()})
                    </span>
                  )}
                </label>
                <CurrencyInput
                  value={goldPromoMaxWeight}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) =>
                    setGoldPromoMaxWeight(value ? value : '0')
                  }
                  className={`base ${
                    required.gold_promo_max_weight ? 'error' : ''
                  }`}
                />
              </div>
              <div className="input-area">
                <label>
                  Minimal Amount{' '}
                  {required.gold_promo_min_weight && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_min_weight?.toString()})
                    </span>
                  )}
                </label>
                <CurrencyInput
                  value={goldPromoMinAmt}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) =>
                    setGoldPromoMinAmt(value ? value : '0')
                  }
                  className={`base ${
                    required.gold_promo_min_weight ? 'error' : ''
                  }`}
                  placeholder="0"
                />
              </div>
              <div className="input-area">
                <label>
                  Maksimal Amount{' '}
                  {required.gold_promo_max_amt && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_max_amt?.toString()})
                    </span>
                  )}
                </label>
                <CurrencyInput
                  value={goldPromoMaxAmt}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) =>
                    setGoldPromoMaxAmt(value ? value : '0')
                  }
                  className={`base ${
                    required.gold_promo_max_amt ? 'error' : ''
                  }`}
                  placeholder="0"
                />
              </div>
              <div className="input-area">
                <label>
                  Tanggal Mulai Promo{' '}
                  {required.gold_promo_start_date && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_start_date?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={goldPromoStartDate}
                  onChange={(e) => setGoldPromoStartDate(e.target.value)}
                  type="date"
                  className="base"
                />
              </div>
              <div className="input-area">
                <label>
                  Tanggal Berakhir Promo{' '}
                  {required.gold_promo_end_date && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_end_date?.toString()})
                    </span>
                  )}
                </label>
                <input
                  value={goldPromoEndDate}
                  onChange={(e) => setGoldPromoEndDate(e.target.value)}
                  type="date"
                  className="base"
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

export default GoldPromoPageForm;
