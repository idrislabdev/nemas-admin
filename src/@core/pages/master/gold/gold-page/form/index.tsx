/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { IGold, IGoldCert } from '@/@core/@types/interface';
import React, { useCallback, useEffect, useState } from 'react';
import { notification } from 'antd';
import CurrencyInput from 'react-currency-input-field';
import UploadGoldForm from '@/@core/components/forms/upload-gold-form';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import Link from 'next/link';
import GoldCertDetailTable from '../cert-detail';
import { useRouter } from 'next/navigation';
import { UndoOutlineIcon } from '@/@core/my-icons';

const GoldPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const isEditMode = paramsId !== 'form';
  const url = `/core/gold`;
  const router = useRouter();
  const [goldWeight, setGoldWeight] = useState('0');
  const [type, setType] = useState('Bar');
  const [brand, setBrand] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [certBrand, setCertBrand] = useState('');
  const [certificateNumber, setCertficateNumber] = useState('');
  const [productCost, setProductCost] = useState('0');
  const [required, setRequired] = useState<IGold>({} as IGold);
  const [api, contextHolder] = notification.useNotification();
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [certificateId, setCertificateId] = useState(0);
  const [certs, setCerts] = useState<IGoldCert[]>([] as IGoldCert[]);

  const [goldImage1, setGoldImage1] = useState('');
  const [goldImage2, setGoldImage2] = useState('');
  const [goldImage3, setGoldImage3] = useState('');
  const [goldImage4, setGoldImage4] = useState('');
  const [goldImage5, setGoldImage5] = useState('');

  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image3, setImage3] = useState<File | null>(null);
  const [image4, setImage4] = useState<File | null>(null);
  const [image5, setImage5] = useState<File | null>(null);

  const onCancel = () => {
    if (!isEditMode) {
      clearForm();
    } else {
      fetchData();
    }
  };

  const onSave = async () => {
    const parsedWeight = parseFloat(
      goldWeight.toString().replace('.', '').replace(',', '.')
    );
    const parsedCost = parseFloat(
      productCost.toString().replace('.', '').replace(',', '.')
    );

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      api.warning({
        message: 'Validasi Gagal',
        description: 'Berat emas tidak boleh 0 atau bernilai minus (-)',
        placement: 'bottomRight',
      });
      return;
    }

    if (isNaN(parsedCost) || parsedCost < 0) {
      api.warning({
        message: 'Validasi Gagal',
        description: 'Harga produk tidak boleh bernilai minus (-)',
        placement: 'bottomRight',
      });
      return;
    }

    const body = {
      gold_weight: parsedWeight,
      type: type,
      brand: brand,
      product_cost: parsedCost,
      certificate_number: certificateNumber,
      certificate_id: certificateId,
    };

    setIsModalLoading(true);
    setRequired({});
    let tempGoldId = '';
    try {
      let desc = '';
      if (!isEditMode) {
        const resp = await axiosInstance.post(`${url}/create`, body);
        const { data } = resp;
        desc = 'Data Gold Telah Disimpan';
        tempGoldId = data.gold_id;
        if (image1 != null) await uploadFile1(data.gold_id);
        if (image2 != null) await uploadFile2(data.gold_id);
        if (image3 != null) await uploadFile3(data.gold_id);
        if (image4 != null) await uploadFile4(data.gold_id);
        if (image5 != null) await uploadFile5(data.gold_id);

        clearForm();
      } else {
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
        if (image1 != null) await uploadFile1(paramsId);
        if (image2 != null) await uploadFile2(paramsId);
        if (image3 != null) await uploadFile3(paramsId);
        if (image4 != null) await uploadFile4(paramsId);
        if (image5 != null) await uploadFile5(paramsId);
        desc = 'Data Gold Telah Diupdate';
      }
      setIsModalLoading(false);
      api.info({
        message: 'Data Gold',
        description: desc,
        placement: 'bottomRight',
      });
      if (!isEditMode) router.replace(`/master/gold/${tempGoldId}`);
    } catch (error) {
      setIsModalLoading(false);
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IGold = err.response.data;
        setRequired(data);
      }
    }
  };

  const fetchBrands = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(`/core/gold/brand`);
      const results = resp.data.results || resp.data;
      const brandList = results.map((item: { name: string }) => item.name);
      setBrands(brandList);
      if (brandList.length > 0 && !brand) {
        setBrand(brandList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  }, [brand]);

  const fetchData = async () => {
    try {
      const resp = await axiosInstance.get(`${url}/${paramsId}/`);
      const { data } = resp;
      setGoldWeight(data.gold_weight.toString().replace('.', ','));
      setType(data.type);
      setBrand(data.brand);
      setCertBrand(data.certificate?.brand || '');
      setProductCost(data.product_cost.toString().replace('.', ','));
      setGoldImage1(data.gold_image_1);
      setGoldImage2(data.gold_image_2);
      setGoldImage3(data.gold_image_3);
      setGoldImage4(data.gold_image_4);
      setGoldImage5(data.gold_image_5);
      setCertificateId(data.certificate?.cert_id || 0);
      setCertficateNumber(data.certificate_number);
    } catch (err) {
      console.error('Failed to fetch detail gold:', err);
    }
  };

  const fetchDataCerts = useCallback(async () => {
    try {
      const params: any = { offset: 0, limit: 100 };
      if (brand) {
        params.cert_brand__icontains = brand;
      }
      const resp = await axiosInstance.get(`/core/gold/cert/`, { params });
      const results = resp.data.results || [];
      setCerts(results);

      if (results.length > 0) {
        const exists = results.some(
          (c: IGoldCert) => c.cert_id === certificateId
        );
        if (!exists && !isEditMode) {
          setCertificateId(results[0].cert_id);
        }
      } else {
        setCertificateId(0);
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    }
  }, [brand, certificateId, isEditMode]);

  // Efek untuk mengubah berat emas secara otomatis berdasarkan sertifikat yang dipilih
  useEffect(() => {
    if (certificateId && certs.length > 0) {
      const selectedCert = certs.find((c) => c.cert_id === certificateId);
      if (selectedCert && selectedCert.gold_weight !== undefined) {
        setGoldWeight(selectedCert.gold_weight.toString().replace('.', ','));
      }
    }
  }, [certificateId, certs]);

  const uploadFile1 = async (id: string) => {
    if (image1 != null) {
      const body = new FormData();
      body.append('file', image1);
      body.append('gold_image_code', 'image1');
      await axiosInstance.post(`${url}/upload/${id}/`, body);
    }
  };

  const uploadFile2 = async (id: string) => {
    if (image2 != null) {
      const body = new FormData();
      body.append('file', image2);
      body.append('gold_image_code', 'image2');
      await axiosInstance.post(`${url}/upload/${id}/`, body);
    }
  };

  const uploadFile3 = async (id: string) => {
    if (image3 != null) {
      const body = new FormData();
      body.append('file', image3);
      body.append('gold_image_code', 'image3');
      await axiosInstance.post(`${url}/upload/${id}/`, body);
    }
  };

  const uploadFile4 = async (id: string) => {
    if (image4 != null) {
      const body = new FormData();
      body.append('file', image4);
      body.append('gold_image_code', 'image4');
      await axiosInstance.post(`${url}/upload/${id}/`, body);
    }
  };

  const uploadFile5 = async (id: string) => {
    if (image5 != null) {
      const body = new FormData();
      body.append('file', image5);
      body.append('gold_image_code', 'image5');
      await axiosInstance.post(`${url}/upload/${id}/`, body);
    }
  };

  useEffect(() => {
    fetchBrands();
    if (isEditMode) {
      fetchData();
    }
  }, [fetchBrands, isEditMode]);

  useEffect(() => {
    if (brand) {
      fetchDataCerts();
    }
  }, [brand, fetchDataCerts]);

  const clearForm = () => {
    setGoldWeight('0');
    setType('Bar');
    if (brands.length > 0) setBrand(brands[0]);
    setProductCost('0');
    setCertficateNumber('');
  };

  return (
    <>
      <div className="flex justify-end">
        <Link href={`/master/gold`} className="btn btn-outline-neutral">
          <UndoOutlineIcon />
          Kembali
        </Link>
      </div>
      <div className="form-input">
        {contextHolder}
        <div className="form-area">
          <div className="flex gap-[20px]">
            <div className="input-area w-1/5">
              <label>Foto 1</label>
              <UploadGoldForm
                index={1}
                withFile={false}
                label=""
                isOptional={true}
                initFile={image1}
                initUrl={goldImage1}
                onChange={(val) => setImage1(val)}
              />
            </div>
            <div className="input-area w-1/5">
              <label>Foto 2</label>
              <UploadGoldForm
                index={2}
                withFile={false}
                label=""
                isOptional={true}
                initFile={image2}
                initUrl={goldImage2}
                onChange={(val) => setImage2(val)}
              />
            </div>
            <div className="input-area w-1/5">
              <label>Foto 3</label>
              <UploadGoldForm
                index={3}
                withFile={false}
                label=""
                isOptional={true}
                initFile={image3}
                initUrl={goldImage3}
                onChange={(val) => setImage3(val)}
              />
            </div>
            <div className="input-area w-1/5">
              <label>Foto 4</label>
              <UploadGoldForm
                index={4}
                withFile={false}
                label=""
                isOptional={true}
                initFile={image4}
                initUrl={goldImage4}
                onChange={(val) => setImage4(val)}
              />
            </div>
            <div className="input-area w-1/5">
              <label>Foto 5</label>
              <UploadGoldForm
                index={5}
                withFile={false}
                label=""
                isOptional={true}
                initFile={image5}
                initUrl={goldImage5}
                onChange={(val) => setImage5(val)}
              />
            </div>
          </div>
          <hr className="my-[20px]" />
          <div className="input-area">
            <label>
              Jenis Emas{' '}
              {required.type && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.type?.toString()})
                </span>
              )}
            </label>
            <select
              className={`base ${required.type ? 'error' : ''}`}
              onChange={(e) => setType(e.target.value)}
              value={type}
              disabled={isEditMode}
            >
              <option value={'Bar'}>Bar</option>
              <option value={'Min Bar'}>Min Bar</option>
            </select>
          </div>
          <div className="input-area">
            <label>
              Merek Emas{' '}
              {required.brand && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.brand?.toString()})
                </span>
              )}
            </label>
            <select
              className={`base ${required.brand ? 'error' : ''}`}
              onChange={(e) => setBrand(e.target.value)}
              value={brand}
              disabled={isEditMode}
            >
              {brands.map((b, index: number) => (
                <option value={b} key={index}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-[4px]">
            <label>
              Sertifikat{' '}
              {required.certificate_id && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.certificate_id?.toString()})
                </span>
              )}
            </label>
            <select
              value={certificateId}
              onChange={(e) => setCertificateId(parseInt(e.target.value))}
              disabled={isEditMode}
            >
              {certs.length === 0 ? (
                <option value={0} disabled>
                  Tidak ada sertifikat untuk merek ini
                </option>
              ) : (
                certs.map((item, index: number) => (
                  <option value={item.cert_id} key={index}>
                    {item.cert_code} - {item.cert_name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="input-area">
            <label>
              Berat Emas (gr){' '}
              {required.gold_weight && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.gold_weight?.toString()})
                </span>
              )}
            </label>
            <div className="group-input prepend">
              <span className="prepend !top-[5px]">gr</span>
              <CurrencyInput
                value={goldWeight}
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                allowNegativeValue={false}
                disabled={true}
                onValueChange={(value) => setGoldWeight(value ? value : '0')}
                className={`base ${required.gold_weight ? 'error' : ''} bg-gray-100 cursor-not-allowed`}
              />
            </div>
          </div>
          <div className="input-area">
            <label>
              Harga Produk{' '}
              {required.product_cost && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.product_cost?.toString()})
                </span>
              )}
            </label>
            <CurrencyInput
              value={productCost}
              decimalsLimit={2}
              decimalSeparator=","
              groupSeparator="."
              allowNegativeValue={false}
              onValueChange={(value) => setProductCost(value ? value : '0')}
              className={`base ${required.product_cost ? 'error' : ''}`}
            />
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
      <hr />
      {isEditMode && (
        <GoldCertDetailTable
          goldId={paramsId}
          goldWeight={goldWeight}
          goldBrand={brand}
          goldCertBrand={certBrand}
          goldType={type}
          certificateId={certificateId.toString()}
        />
      )}
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diproses"
      />
    </>
  );
};

export default GoldPageForm;
