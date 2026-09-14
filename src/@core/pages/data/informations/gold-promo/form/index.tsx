'use client';

import { IGoldPromo } from '@/@core/@types/interface';
import UploadForm from '@/@core/components/forms/upload-form';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { notification } from 'antd';

const levelOptions: Record<number, string> = {
  6: 'Opulence King',
  5: 'Gold Sovereign',
  4: 'Treasure Voyager',
  3: 'Fortune Rider',
  2: 'Coin Digger',
  1: 'Novice Saver',
  0: 'All',
};

const GoldPromoPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;

  const url = `/core/gold/gold_promo`;

  // =========================================================
  // GOLD PROMO
  // =========================================================

  const [goldPromoCode, setGoldPromoCode] = useState('');
  const [goldPromoDescription, setGoldPromoDescription] = useState('');

  const [goldPromoWeightThreshold, setGoldPromoWeightThreshold] = useState('0');

  const [goldPromoWeightAmt, setGoldPromoWeightAmt] = useState('0');

  const [goldPromoAmtPct, setGoldPromoAmtPct] = useState('0');

  const [goldPromoAmt, setGoldPromoAmt] = useState('0');

  const [goldPromoMinWeight, setGoldPromoMinWeight] = useState('0');

  const [goldPromoMaxWeight, setGoldPromoMaxWeight] = useState('0');

  const [goldPromoMinAmt, setGoldPromoMinAmt] = useState('0');

  const [goldPromoMaxAmt, setGoldPromoMaxAmt] = useState('0');

  const [goldPromoStartDate, setGoldPromoStartDate] = useState('');

  const [goldPromoEndDate, setGoldPromoEndDate] = useState('');

  const [goldPromoActive, setGoldPromoActive] = useState(true);

  const [goldPromoType, setGoldPromoType] =
    useState<IGoldPromo['gold_promo_type']>('PERCENTAGE');

  const [goldPromoProductType, setGoldPromoProductType] =
    useState<IGoldPromo['gold_promo_product_type']>('DIGITAL_GOLD');

  // =========================================================
  // PROMO INFORMATION
  // =========================================================

  const [levelingUser, setLevelingUser] = useState('0');

  const [levelingUserId, setLevelingUserId] = useState('0');

  const [promoContent, setPromoContent] = useState('');

  const [promoUrl, setPromoUrl] = useState('');

  const [promoUrlBackground, setPromoUrlBackground] = useState('');

  const [promoTag, setPromoTag] = useState('');

  const [promoCashback, setPromoCashback] = useState('0');

  const [promoCashbackTipeUser, setPromoCashbackTipeUser] = useState('');

  const [merchantCashback, setMerchantCashback] = useState('');

  const [showBanner, setShowBanner] = useState(true);

  // =========================================================
  // FILE
  // =========================================================

  const [fileData, setFileData] = useState<File | null>(null);

  // =========================================================
  // OTHER
  // =========================================================

  const [required, setRequired] = useState<IGoldPromo>({} as IGoldPromo);

  const [api, contextHolder] = notification.useNotification();

  const [isModalLoading, setIsModalLoading] = useState(false);

  // =========================================================
  // HELPERS
  // =========================================================

  const parseNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    return parseFloat(value.toString().replace(/\./g, '').replace(',', '.'));
  };

  const formatDate = (value: string | null | undefined): string => {
    if (!value) {
      return '';
    }

    // Kalau sudah YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    // Kalau ISO datetime
    return value.substring(0, 10);
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const onCancel = () => {
    if (paramsId === 'form') {
      clearForm();
    } else {
      fetchData();
    }
  };

  // =========================================================
  // SAVE
  // =========================================================

  const onSave = async () => {
    const body = {
      // -----------------------------------------------------
      // GOLD PROMO
      // -----------------------------------------------------

      gold_promo_code: goldPromoCode,

      gold_promo_description: goldPromoDescription,

      gold_promo_weight_threshold: parseNumber(goldPromoWeightThreshold),

      gold_promo_weight_amt: parseNumber(goldPromoWeightAmt),

      gold_promo_amt_pct: parseNumber(goldPromoAmtPct),

      gold_promo_amt: parseNumber(goldPromoAmt),

      gold_promo_min_weight: parseNumber(goldPromoMinWeight),

      gold_promo_max_weight: parseNumber(goldPromoMaxWeight),

      gold_promo_min_amt: parseNumber(goldPromoMinAmt),

      gold_promo_max_amt: parseNumber(goldPromoMaxAmt),

      gold_promo_start_date: goldPromoStartDate,

      gold_promo_end_date: goldPromoEndDate,

      gold_promo_active: goldPromoActive,

      gold_promo_type: goldPromoType,

      gold_promo_product_type: goldPromoProductType,

      // -----------------------------------------------------
      // LEVELING
      // -----------------------------------------------------

      leveling_user: levelingUser,

      leveling_user_id: parseInt(levelingUserId || '0', 10),

      // -----------------------------------------------------
      // PROMO INFORMATION
      // -----------------------------------------------------

      promo_content: promoContent,

      promo_url: promoUrl,

      promo_url_background: promoUrlBackground,

      promo_tag: promoTag,

      promo_cashback: parseNumber(promoCashback),

      promo_cashback_tipe_user: promoCashbackTipeUser,

      merchant_cashback: merchantCashback,

      show_banner: showBanner,
    };

    setRequired({});
    setIsModalLoading(true);

    try {
      let desc = '';

      if (paramsId === 'form') {
        // ===================================================
        // CREATE
        // ===================================================

        const resp = await axiosInstance.post(`${url}/create`, body);

        const { data } = resp;

        /*
         * Sesuaikan dengan response API.
         *
         * Support beberapa kemungkinan response:
         * - { id: 123 }
         * - { gold_promo_id: 123 }
         */

        const promoId = data?.gold_promo_id ?? data?.id;

        if (fileData != null && promoId) {
          await uploadFile(promoId);
        }

        desc = 'Data Promo Telah Disimpan';

        clearForm();
      } else {
        // ===================================================
        // UPDATE
        // ===================================================

        await axiosInstance.patch(`${url}/${paramsId}/`, body);

        if (fileData != null) {
          await uploadFile(paramsId);
        }

        desc = 'Data Promo Telah Diupdate';
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
        const data = err.response.data as IGoldPromo;

        setRequired(data);
      }
    }
  };

  // =========================================================
  // UPLOAD
  // =========================================================

  const uploadFile = async (id: string | number) => {
    if (fileData == null) {
      return;
    }

    const body = new FormData();

    body.append('file', fileData);

    await axiosInstance.post(`${url}/upload/${id}/`, body);
  };

  // =========================================================
  // FETCH DETAIL
  // =========================================================

  const fetchData = async () => {
    setIsModalLoading(true);

    try {
      const resp = await axiosInstance.get(`${url}/${paramsId}/`);

      const { data } = resp;

      // ===================================================
      // GOLD PROMO
      // ===================================================

      setGoldPromoCode(data.gold_promo_code ?? '');

      setGoldPromoDescription(data.gold_promo_description ?? '');

      setGoldPromoWeightThreshold(
        data.gold_promo_weight_threshold?.toString() ?? '0'
      );

      setGoldPromoWeightAmt(data.gold_promo_weight_amt?.toString() ?? '0');

      setGoldPromoAmtPct(data.gold_promo_amt_pct?.toString() ?? '0');

      setGoldPromoAmt(data.gold_promo_amt?.toString() ?? '0');

      setGoldPromoMinWeight(data.gold_promo_min_weight?.toString() ?? '0');

      setGoldPromoMaxWeight(data.gold_promo_max_weight?.toString() ?? '0');

      setGoldPromoMinAmt(data.gold_promo_min_amt?.toString() ?? '0');

      setGoldPromoMaxAmt(data.gold_promo_max_amt?.toString() ?? '0');

      setGoldPromoStartDate(formatDate(data.gold_promo_start_date));

      setGoldPromoEndDate(formatDate(data.gold_promo_end_date));

      setGoldPromoActive(data.gold_promo_active ?? true);

      setGoldPromoType(data.gold_promo_type ?? 'PERCENTAGE');

      setGoldPromoProductType(data.gold_promo_product_type ?? 'DIGITAL_GOLD');

      // ===================================================
      // LEVELING
      // ===================================================

      setLevelingUser(data.leveling_user?.toString() ?? '0');

      setLevelingUserId(data.leveling_user_id?.toString() ?? '0');

      // ===================================================
      // PROMO INFORMATION
      // ===================================================

      setPromoContent(data.promo_content ?? '');

      setPromoUrl(data.promo_url ?? '');

      setPromoUrlBackground(data.promo_url_background ?? '');

      setPromoTag(data.promo_tag ?? '');

      setPromoCashback(data.promo_cashback?.toString() ?? '0');

      setPromoCashbackTipeUser(data.promo_cashback_tipe_user ?? '');

      setMerchantCashback(data.merchant_cashback?.toString() ?? '');

      setShowBanner(data.show_banner ?? true);
    } catch (error) {
      const err = error as AxiosError;

      if (err.response && err.response.data) {
        const data = err.response.data as IGoldPromo;

        setRequired(data);
      }
    } finally {
      setIsModalLoading(false);
    }
  };

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const changeFile = (val: File | null) => {
    if (val != null) {
      setPromoUrlBackground(URL.createObjectURL(val));
    } else {
      setPromoUrlBackground('');
    }

    setFileData(val);
  };

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {
    // GOLD PROMO
    setGoldPromoCode('');
    setGoldPromoDescription('');

    setGoldPromoWeightThreshold('0');
    setGoldPromoWeightAmt('0');

    setGoldPromoAmtPct('0');
    setGoldPromoAmt('0');

    setGoldPromoMinWeight('0');
    setGoldPromoMaxWeight('0');

    setGoldPromoMinAmt('0');
    setGoldPromoMaxAmt('0');

    setGoldPromoStartDate('');
    setGoldPromoEndDate('');

    setGoldPromoActive(true);

    setGoldPromoType('PERCENTAGE');
    setGoldPromoProductType('DIGITAL_GOLD');

    // LEVELING
    setLevelingUser('0');
    setLevelingUserId('0');

    // PROMO INFORMATION
    setPromoContent('');
    setPromoUrl('');
    setPromoUrlBackground('');
    setPromoTag('');

    setPromoCashback('0');
    setPromoCashbackTipeUser('');
    setMerchantCashback('');

    setShowBanner(true);

    // FILE
    setFileData(null);

    setRequired({});
  };

  // =========================================================
  // EFFECT
  // =========================================================

  useEffect(() => {
    if (paramsId !== 'form') {
      fetchData();
    }
  }, [paramsId]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {contextHolder}

      {!isModalLoading && (
        <div className="form-input">
          <div className="flex items-start gap-[10px]">
            {/* =================================================
                LEFT
            ================================================= */}

            <div className="form-area w-1/2">
              {/* ===============================
                  IMAGE / BACKGROUND
              =============================== */}

              <div className="input-area">
                <label>
                  Gambar / Background{' '}
                  {required.promo_url_background && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_url_background.toString()})
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
                  height={102}
                  onChange={(val) => changeFile(val)}
                />
              </div>

              {/* ===============================
                  KODE PROMO
              =============================== */}

              <div className="input-area">
                <label>
                  Kode Promo{' '}
                  {required.gold_promo_code && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_code.toString()})
                    </span>
                  )}
                </label>

                <input
                  value={goldPromoCode}
                  onChange={(e) => setGoldPromoCode(e.target.value)}
                  className={`base ${required.gold_promo_code ? 'error' : ''}`}
                />
              </div>

              {/* ===============================
                  DESKRIPSI
              =============================== */}

              <div className="input-area">
                <label>
                  Deskripsi Promo{' '}
                  {required.gold_promo_description && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_description.toString()})
                    </span>
                  )}
                </label>

                <input
                  value={goldPromoDescription}
                  onChange={(e) => setGoldPromoDescription(e.target.value)}
                  className={`base ${
                    required.gold_promo_description ? 'error' : ''
                  }`}
                />
              </div>

              {/* ===============================
                  PRODUCT TYPE
              =============================== */}

              <div className="input-area">
                <label>
                  Product Type{' '}
                  {required.gold_promo_product_type && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_product_type.toString()})
                    </span>
                  )}
                </label>

                <select
                  value={goldPromoProductType}
                  onChange={(e) =>
                    setGoldPromoProductType(
                      e.target.value as IGoldPromo['gold_promo_product_type']
                    )
                  }
                  className={`base ${
                    required.gold_promo_product_type ? 'error' : ''
                  }`}
                >
                  <option value="DIGITAL_GOLD">Digital Gold</option>

                  <option value="PHYSICAL_GOLD">Physical Gold</option>
                </select>
              </div>

              {/* ===============================
                  PROMO TYPE
              =============================== */}

              <div className="input-area">
                <label>
                  Tipe Promo{' '}
                  {required.gold_promo_type && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_type.toString()})
                    </span>
                  )}
                </label>

                <select
                  value={goldPromoType}
                  onChange={(e) =>
                    setGoldPromoType(
                      e.target.value as IGoldPromo['gold_promo_type']
                    )
                  }
                  className={`base ${required.gold_promo_type ? 'error' : ''}`}
                >
                  <option value="PERCENTAGE">Percentage</option>

                  <option value="FIXED_AMOUNT">Fixed Amount</option>

                  <option value="WEIGHT_BASED">Weight Based</option>

                  <option value="WEIGHT_PERCENTAGE">Weight Percentage</option>
                </select>
              </div>

              {/* ===============================
                  WEIGHT THRESHOLD
              =============================== */}

              <div className="input-area">
                <label>
                  Weight Threshold{' '}
                  {required.gold_promo_weight_threshold && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_weight_threshold.toString()})
                    </span>
                  )}
                </label>

                <div className="group-input prepend">
                  <span className="prepend !top-[5px]">gr</span>

                  <CurrencyInput
                    value={goldPromoWeightThreshold}
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    onValueChange={(value) =>
                      setGoldPromoWeightThreshold(value || '0')
                    }
                    className={`base ${
                      required.gold_promo_weight_threshold ? 'error' : ''
                    }`}
                  />
                </div>
              </div>

              {/* ===============================
                  WEIGHT AMOUNT
              =============================== */}

              <div className="input-area">
                <label>
                  Weight Amount{' '}
                  {required.gold_promo_weight_amt && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_weight_amt.toString()})
                    </span>
                  )}
                </label>

                <div className="group-input prepend">
                  <span className="prepend !top-[5px]">gr</span>

                  <CurrencyInput
                    value={goldPromoWeightAmt}
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    onValueChange={(value) =>
                      setGoldPromoWeightAmt(value || '0')
                    }
                    className={`base ${
                      required.gold_promo_weight_amt ? 'error' : ''
                    }`}
                  />
                </div>
              </div>

              {/* ===============================
                  AMOUNT
              =============================== */}

              <div className="input-area">
                <label>
                  Jumlah{' '}
                  {required.gold_promo_amt && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_amt.toString()})
                    </span>
                  )}
                </label>

                <CurrencyInput
                  value={goldPromoAmt}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) => setGoldPromoAmt(value || '0')}
                  className={`base ${required.gold_promo_amt ? 'error' : ''}`}
                />
              </div>

              {/* ===============================
                  AMOUNT PERCENTAGE
              =============================== */}

              <div className="input-area">
                <label>
                  Jumlah PCT{' '}
                  {required.gold_promo_amt_pct && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_amt_pct.toString()})
                    </span>
                  )}
                </label>

                <div className="group-input append">
                  <CurrencyInput
                    value={goldPromoAmtPct}
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    onValueChange={(value) => setGoldPromoAmtPct(value || '0')}
                    className={`base ${
                      required.gold_promo_amt_pct ? 'error' : ''
                    }`}
                  />

                  <span className="append !top-[5px]">%</span>
                </div>
              </div>

              {/* ===============================
                  STATUS
              =============================== */}

              <div className="input-area">
                <label>
                  Status Promo{' '}
                  {required.gold_promo_active && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_active.toString()})
                    </span>
                  )}
                </label>

                <select
                  value={goldPromoActive ? 'active' : 'not_active'}
                  onChange={(e) =>
                    setGoldPromoActive(e.target.value === 'active')
                  }
                  className={`base ${
                    required.gold_promo_active ? 'error' : ''
                  }`}
                >
                  <option value="active">Aktif</option>

                  <option value="not_active">Tidak Aktif</option>
                </select>
              </div>

              {/* ===============================
                  LEVEL USER
              =============================== */}

              <div className="input-area">
                <label>
                  Level User{' '}
                  {required.leveling_user && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.leveling_user.toString()})
                    </span>
                  )}
                </label>

                <select
                  value={levelingUser}
                  onChange={(e) => {
                    const value = e.target.value;

                    setLevelingUser(value);
                    setLevelingUserId(value);
                  }}
                  className={`base ${required.leveling_user ? 'error' : ''}`}
                >
                  {Object.entries(levelOptions).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* ===============================
                  PROMO CONTENT
              =============================== */}

              <div className="input-area">
                <label>
                  Promo Content{' '}
                  {required.promo_content && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_content.toString()})
                    </span>
                  )}
                </label>

                <input
                  value={promoContent}
                  onChange={(e) => setPromoContent(e.target.value)}
                  className={`base ${required.promo_content ? 'error' : ''}`}
                />
              </div>
            </div>

            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="form-area w-1/2">
              {/* ===============================
                  MIN WEIGHT
              =============================== */}

              <div className="input-area">
                <label>
                  Berat Minimal{' '}
                  {required.gold_promo_min_weight && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_min_weight.toString()})
                    </span>
                  )}
                </label>

                <CurrencyInput
                  value={goldPromoMinWeight}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) => setGoldPromoMinWeight(value || '0')}
                  className={`base ${
                    required.gold_promo_min_weight ? 'error' : ''
                  }`}
                />
              </div>

              {/* ===============================
                  MAX WEIGHT
              =============================== */}

              <div className="input-area">
                <label>
                  Berat Maksimal{' '}
                  {required.gold_promo_max_weight && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_max_weight.toString()})
                    </span>
                  )}
                </label>

                <CurrencyInput
                  value={goldPromoMaxWeight}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) => setGoldPromoMaxWeight(value || '0')}
                  className={`base ${
                    required.gold_promo_max_weight ? 'error' : ''
                  }`}
                />
              </div>

              {/* ===============================
                  MIN AMOUNT
              =============================== */}

              <div className="input-area">
                <label>
                  Minimal Amount{' '}
                  {required.gold_promo_min_amt && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_min_amt.toString()})
                    </span>
                  )}
                </label>

                <CurrencyInput
                  value={goldPromoMinAmt}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) => setGoldPromoMinAmt(value || '0')}
                  className={`base ${
                    required.gold_promo_min_amt ? 'error' : ''
                  }`}
                  placeholder="0"
                />
              </div>

              {/* ===============================
                  MAX AMOUNT
              =============================== */}

              <div className="input-area">
                <label>
                  Maksimal Amount{' '}
                  {required.gold_promo_max_amt && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_max_amt.toString()})
                    </span>
                  )}
                </label>

                <CurrencyInput
                  value={goldPromoMaxAmt}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) => setGoldPromoMaxAmt(value || '0')}
                  className={`base ${
                    required.gold_promo_max_amt ? 'error' : ''
                  }`}
                  placeholder="0"
                />
              </div>

              {/* ===============================
                  START DATE
              =============================== */}

              <div className="input-area">
                <label>
                  Tanggal Mulai Promo{' '}
                  {required.gold_promo_start_date && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_start_date.toString()})
                    </span>
                  )}
                </label>

                <input
                  value={goldPromoStartDate}
                  onChange={(e) => setGoldPromoStartDate(e.target.value)}
                  type="date"
                  className={`base ${
                    required.gold_promo_start_date ? 'error' : ''
                  }`}
                />
              </div>

              {/* ===============================
                  END DATE
              =============================== */}

              <div className="input-area">
                <label>
                  Tanggal Berakhir Promo{' '}
                  {required.gold_promo_end_date && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.gold_promo_end_date.toString()})
                    </span>
                  )}
                </label>

                <input
                  value={goldPromoEndDate}
                  onChange={(e) => setGoldPromoEndDate(e.target.value)}
                  type="date"
                  className={`base ${
                    required.gold_promo_end_date ? 'error' : ''
                  }`}
                />
              </div>

              {/* ===============================
                  PROMO URL
              =============================== */}

              <div className="input-area">
                <label>
                  Promo URL{' '}
                  {required.promo_url && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_url.toString()})
                    </span>
                  )}
                </label>

                <input
                  value={promoUrl}
                  onChange={(e) => setPromoUrl(e.target.value)}
                  className={`base ${required.promo_url ? 'error' : ''}`}
                />
              </div>

              {/* ===============================
                  PROMO TAG
              =============================== */}

              <div className="input-area">
                <label>
                  Promo Tag{' '}
                  {required.promo_tag && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_tag.toString()})
                    </span>
                  )}
                </label>

                <input
                  value={promoTag}
                  onChange={(e) => setPromoTag(e.target.value)}
                  type="text"
                  className={`base ${required.promo_tag ? 'error' : ''}`}
                />
              </div>

              {/* ===============================
                  PROMO CASHBACK
              =============================== */}

              <div className="input-area">
                <label>
                  Promo Cashback{' '}
                  {required.promo_cashback && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_cashback.toString()})
                    </span>
                  )}
                </label>

                <CurrencyInput
                  value={promoCashback}
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  onValueChange={(value) => setPromoCashback(value || '0')}
                  className={`base ${required.promo_cashback ? 'error' : ''}`}
                  placeholder="0"
                />
              </div>

              {/* ===============================
                  CASHBACK USER TYPE
              =============================== */}

              <div className="input-area">
                <label>
                  Tipe User Cashback{' '}
                  {required.promo_cashback_tipe_user && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.promo_cashback_tipe_user.toString()})
                    </span>
                  )}
                </label>

                <input
                  value={promoCashbackTipeUser}
                  onChange={(e) => setPromoCashbackTipeUser(e.target.value)}
                  className={`base ${
                    required.promo_cashback_tipe_user ? 'error' : ''
                  }`}
                />
              </div>

              {/* ===============================
                  MERCHANT CASHBACK
              =============================== */}

              <div className="input-area">
                <label>
                  Merchant Cashback{' '}
                  {required.merchant_cashback && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.merchant_cashback.toString()})
                    </span>
                  )}
                </label>

                <input
                  value={merchantCashback}
                  onChange={(e) => setMerchantCashback(e.target.value)}
                  className={`base ${
                    required.merchant_cashback ? 'error' : ''
                  }`}
                />
              </div>

              {/* ===============================
                  SHOW BANNER
              =============================== */}

              <div className="input-area">
                <label>
                  Show Banner{' '}
                  {required.show_banner && (
                    <span className="text-red-500 text-[10px]/[14px] italic">
                      ({required.show_banner.toString()})
                    </span>
                  )}
                </label>

                <select
                  value={showBanner ? 'true' : 'false'}
                  onChange={(e) => setShowBanner(e.target.value === 'true')}
                  className={`base ${required.show_banner ? 'error' : ''}`}
                >
                  <option value="true">Ya</option>

                  <option value="false">Tidak</option>
                </select>
              </div>
            </div>
          </div>

          {/* =================================================
              BUTTON
          ================================================= */}

          <div className="form-button">
            <button className="btn btn-outline-secondary" onClick={onCancel}>
              Batal
            </button>

            <button className="btn btn-primary" onClick={onSave}>
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
