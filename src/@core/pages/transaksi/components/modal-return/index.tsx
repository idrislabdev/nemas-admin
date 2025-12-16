'use client';

import Modal from 'rsuite/Modal';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { DatePicker, Spin } from 'antd';
import { Dayjs } from 'dayjs';
import axiosInstance from '@/@core/utils/axios';
import TextArea from 'antd/es/input/TextArea';
import UploadMiniForm from '@/@core/components/forms/upload-mini-form';
import { AxiosError } from 'axios';

const ModalReturn = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setRefresData: Dispatch<SetStateAction<boolean>>;
  orderGoldId: string;
  goldCertDetailPrice: string;
}) => {
  const {
    isModalOpen,
    setIsModalOpen,
    setRefresData,
    orderGoldId,
    goldCertDetailPrice,
  } = props;

  const [returnReason, setReturnReason] = useState('');
  const [returnType] = useState('BY_GOLD');

  // ✅ FIX: pakai Dayjs
  const [returnDate, setReturnDate] = useState<Dayjs | null>(null);

  const [fileImage1, setFileImage1] = useState<File | null>(null);
  const [fileImage2, setFileImage2] = useState<File | null>(null);
  const [fileImage3, setFileImage3] = useState<File | null>(null);
  const [required, setRequired] = useState<{
    return_reason?: string;
    return_image_1?: string;
  }>({});

  // ✅ loading state
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file: File | null): Promise<string> => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);

    const resp = await axiosInstance.post(
      'orders/fix/order/return/upload/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return resp.data?.file_url || resp.data || '';
  };

  const save = async () => {
    setRequired({});
    try {
      setLoading(true);

      const image1 = await uploadFile(fileImage1);
      const image2 = await uploadFile(fileImage2);
      const image3 = await uploadFile(fileImage3);

      const body = {
        order_gold: orderGoldId,
        return_reason: returnReason,
        return_date: returnDate ? returnDate.format('YYYY-MM-DD') : null,
        return_type: returnType,
        gold_cert_detail_price: goldCertDetailPrice,
        return_image_1: image1,
        return_image_2: image2,
        return_image_3: image3,
      };

      await axiosInstance.post('orders/fix/order/return/create/', body);

      setRefresData(true);
      setIsModalOpen(false);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: { return_reason?: string; return_image_1?: string } =
          err.response.data;
        setRequired(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      setRequired({});
      setReturnReason('');
      setReturnDate(null);
      setFileImage1(null);
      setFileImage2(null);
      setFileImage3(null);
    }
  }, [isModalOpen]);

  return (
    <Modal
      size="xs"
      dialogClassName="my-modal"
      backdropClassName="my-modal-backdrop"
      backdrop="static"
      keyboard={false}
      open={isModalOpen}
      onClose={() => !loading && setIsModalOpen(false)}
    >
      <Modal.Header>
        <Modal.Title>Return Emas</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Spin spinning={loading}>
          <div className="flex flex-col gap-[8px]">
            {/* NOTE */}
            <div className="flex flex-col gap-[4px]">
              <label>Note</label>
              <TextArea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className={`rounded-[4px] ${
                  required.return_reason ? 'error' : ''
                }`}
                autoSize={{ minRows: 3, maxRows: 3 }}
                disabled={loading}
              />
              {required.return_reason && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.return_reason?.toString()})
                </span>
              )}
            </div>

            {/* DATE */}
            <div className="flex flex-col gap-[4px]">
              <label>Tanggal Return</label>
              <DatePicker
                value={returnDate}
                format="DD MMM YYYY"
                onChange={(date) => setReturnDate(date)}
                getPopupContainer={(trigger) => trigger.parentElement!}
                className="h-[40px]"
              />
            </div>

            {/* UPLOAD */}
            <div className="flex flex-col gap-[4px]">
              <label>Upload Gambar</label>
              <div className="flex gap-2">
                <div className="w-[110px] h-[110px]">
                  <UploadMiniForm
                    index={43}
                    withFile={false}
                    label="1"
                    isOptional
                    initFile={fileImage1}
                    initUrl=""
                    isError={required.return_image_1 ? true : false}
                    onChange={(val) => setFileImage1(val)}
                  />
                </div>

                <div className="w-[110px] h-[110px]">
                  <UploadMiniForm
                    index={44}
                    withFile={false}
                    label="2"
                    isOptional
                    initFile={fileImage2}
                    initUrl=""
                    onChange={(val) => setFileImage2(val)}
                  />
                </div>

                <div className="w-[110px] h-[110px]">
                  <UploadMiniForm
                    index={45}
                    withFile={false}
                    label="3"
                    isOptional
                    initFile={fileImage3}
                    initUrl=""
                    onChange={(val) => setFileImage3(val)}
                  />
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex gap-2 justify-end">
          <button
            className="btn btn-outline-primary"
            disabled={loading}
            onClick={() => setIsModalOpen(false)}
          >
            Batal
          </button>
          <button className="btn btn-primary" disabled={loading} onClick={save}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalReturn;
