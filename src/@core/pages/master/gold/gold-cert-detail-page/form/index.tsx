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
  const [golds, setGolds] = useState<IGold[]>([] as IGold[]);
  const [certs, setCerts] = useState<IGoldCert[]>([] as IGoldCert[]);
  const [gold, setGold] = useState(0);
  const [goldCert, setGoldCert] = useState(0);
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
    // const user = JSON.parse(localStorage.getItem("user") || "{}")
    const body = {
      gold: gold,
      gold_cert: goldCert,
      gold_cert_code: goldCertCode,
      gold_weight: parseInt(
        goldWeight.toString().replace('.', '').replace(',', '.')
      ),
      include_stock: includeStock,
      // "create_user": user.id
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
    setGold(results[0].gold_id);
  }, [setGolds]);

  const fetchDataCerts = useCallback(async () => {
    const resp = await axiosInstance.get(`/core/gold/cert/?offset=0&limit=100`);
    const { results } = resp.data;
    setCerts(results);
    setGoldCert(results[0].cert_id);
  }, [setCerts]);

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
  });

  const clearForm = () => {
    setGoldCertCode('');
    setGoldWeight('');
    setIncludeStock(true);
    // setCertCode("");
    // setGoldWeight("");
    // setCertPrice("");
  };
  return (
    <div className="form-input">
      {contextHolder}
      <div className="form-area">
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
            defaultValue={gold}
            onChange={(e) => setGold(parseInt(e.target.value))}
          >
            {golds.map((item, index: number) => (
              <option value={item.gold_id} key={index}>
                {item.brand} - {item.gold_weight}Gr
              </option>
            ))}
          </select>
        </div>
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
            defaultValue={goldCert}
            onChange={(e) => setGoldCert(parseInt(e.target.value))}
          >
            {certs.map((item, index: number) => (
              <option value={item.cert_id} key={index}>
                {item.cert_code} - {item.cert_name}
              </option>
            ))}
          </select>
        </div>
        <div className="input-area">
          <label>
            Kode Sertifikat{' '}
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
            defaultValue={includeStock ? 'Ya' : 'Tidak'}
            onChange={(e) =>
              setIncludeStock(e.target.value == 'Ya' ? true : false)
            }
          >
            <option value={`Ya`}>Ya</option>
            <option value={`Tidak`}>Tidak</option>
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
