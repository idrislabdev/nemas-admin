'use client';
import {
  IGold,
  IGoldCert,
  IGoldCertPriceDetail,
} from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { notification } from 'antd';

const GoldCertDetailPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/gold/cert_price_detail`;

  const [required, setRequired] = useState<IGoldCertPriceDetail>(
    {} as IGoldCertPriceDetail
  );

  const [golds, setGolds] = useState<IGold[]>([]);
  const [certs, setCerts] = useState<IGoldCert[]>([]);

  const [gold, setGold] = useState<number>(0);
  const [goldCert, setGoldCert] = useState<number>(0);

  const [goldCertCode, setGoldCertCode] = useState('');
  const [includeStock, setIncludeStock] = useState(true);
  const [goldWeight, setGoldWeight] = useState('');

  const [api, contextHolder] = notification.useNotification();

  const onCancel = () => {
    if (paramsId == 'form') {
      clearForm();
    } else {
      fetchData();
    }
  };

  const onSave = async () => {
    const body = {
      gold: gold,
      gold_cert: goldCert,
      gold_cert_code: goldCertCode,
      gold_weight: parseInt(
        goldWeight.toString().replace('.', '').replace(',', '.')
      ),
      include_stock: includeStock,
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
        const data: IGoldCertPriceDetail = err.response.data;
        setRequired(data);
      }
    }
  };

  const fetchDataGolds = useCallback(async () => {
    const resp = await axiosInstance.get(`/core/gold/?offset=0&limit=100`);
    const { results } = resp.data;

    setGolds(results);

    if (results.length > 0) {
      setGold(results[0].gold_id ?? 0);
    }
  }, []);

  const fetchDataCerts = useCallback(async (brand?: string) => {
    let query = `/core/gold/cert/?offset=0&limit=100`;

    if (brand) {
      query += `&cert_brand__icontains=${brand}`;
    }

    const resp = await axiosInstance.get(query);
    const { results } = resp.data;

    setCerts(results);

    if (results.length > 0) {
      setGoldCert(results[0].cert_id ?? 0);
    }
  }, []);

  const fetchData = async () => {
    const resp = await axiosInstance.get(`${url}/${paramsId}/`);
    const { data } = resp;

    setGold(data.gold);
    setGoldCert(data.gold_cert);
    setGoldCertCode(data.gold_cert_code);
    setGoldWeight(data.gold_weight.toString());
    setIncludeStock(data.include_stock);
  };

  useEffect(() => {
    fetchDataGolds();
  }, [fetchDataGolds]);

  useEffect(() => {
    fetchDataCerts();
  }, [fetchDataCerts]);

  useEffect(() => {
    if (paramsId != 'form') fetchData();
  }, []);

  /**
   * Trigger ketika gold berubah
   */
  useEffect(() => {
    if (!golds.length) return;

    const selectedGold = golds.find((g) => g.gold_id === gold);

    if (!selectedGold) return;

    const brand = selectedGold.brand ?? '';

    /**
     * fetch cert berdasarkan brand
     */
    fetchDataCerts(brand);

    /**
     * auto isi satuan
     */
    if (selectedGold.gold_weight) {
      setGoldWeight(selectedGold.gold_weight.toString());
    }
  }, [gold, golds, fetchDataCerts]);

  const clearForm = () => {
    setGoldCertCode('');
    // setGoldWeight('');
    setIncludeStock(true);
  };

  return (
    <div className="form-input">
      {contextHolder}

      <div className="form-area">
        {/* GOLD */}
        <div className="input-area">
          <label>
            Emas{' '}
            {required.gold && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.gold?.toString()})
              </span>
            )}
          </label>

          <select
            value={gold}
            onChange={(e) => setGold(parseInt(e.target.value))}
          >
            {golds.map((item, index) => (
              <option value={item.gold_id} key={index}>
                {item.brand} - {item.gold_weight}Gr
              </option>
            ))}
          </select>
        </div>

        {/* CERT */}
        <div className="input-area">
          <label>
            Sertifikat{' '}
            {required.gold_cert && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.gold_cert?.toString()})
              </span>
            )}
          </label>

          <select
            value={goldCert}
            onChange={(e) => setGoldCert(parseInt(e.target.value))}
          >
            {certs.map((item, index) => (
              <option value={item.cert_id} key={index}>
                {item.cert_code} - {item.cert_brand}
              </option>
            ))}
          </select>
        </div>

        {/* NOMOR CERT */}
        <div className="input-area">
          <label>
            Nomor Sertifikat{' '}
            {required.gold_cert_code && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.gold_cert_code?.toString()})
              </span>
            )}
          </label>

          <input
            value={goldCertCode}
            onChange={(e) => setGoldCertCode(e.target.value)}
            className={`base ${required.gold_cert_code ? 'error' : ''}`}
          />
        </div>

        {/* SATUAN */}
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

        {/* INCLUDE STOCK */}
        <div className="input-area">
          <label>
            Include Stock{' '}
            {required.include_stock && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.include_stock?.toString()})
              </span>
            )}
          </label>

          <select
            value={includeStock ? 'Ya' : 'Tidak'}
            onChange={(e) =>
              setIncludeStock(e.target.value === 'Ya' ? true : false)
            }
          >
            <option value="Ya">Ya</option>
            <option value="Tidak">Tidak</option>
          </select>
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

export default GoldCertDetailPageForm;
