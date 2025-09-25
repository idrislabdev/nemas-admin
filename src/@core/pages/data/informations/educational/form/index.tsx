'use client';

import { IEducational } from '@/@core/@types/interface';
import UploadForm from '@/@core/components/forms/upload-form';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { notification } from 'antd';
import ModalLoading from '@/@core/components/modal/modal-loading';

const InformationEducationalPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/information/educational`;
  const [informationName, setInformationName] = useState('');
  const [informationUrl, setInformationUrl] = useState('');
  const [informationNotes, setInformationNotes] = useState('');
  const [informationBackground, setInformationBackground] = useState('');
  const [fileData, setFileData] = useState<File | null>(null);
  const [required, setRequired] = useState<IEducational>({} as IEducational);
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
      information_name: informationName,
      information_notes: informationNotes,
      information_url: informationUrl,
      // "information_background": informationBackground,
    };
    setRequired({});
    setIsModalLoading(true);
    try {
      let desc = '';
      if (paramsId == 'form') {
        const resp = await axiosInstance.post(`${url}/create/`, body);
        const { data } = resp;
        if (fileData != null) await uploadFile(data.information_educational_id);

        desc = 'Data Educational Telah Disimpan';
        clearForm();
      } else {
        desc = 'Data Educational Telah Diupdate';
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
        if (fileData != null) await uploadFile(paramsId);
      }
      setIsModalLoading(false);
      api.info({
        message: 'Data Educational',
        description: desc,
        placement: 'bottomRight',
      });
    } catch (error) {
      setIsModalLoading(false);
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IEducational = err.response.data;
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
    const resp = await axiosInstance.get(`${url}/${paramsId}/`);
    const { data } = resp;
    setInformationName(data.information_name);
    setInformationUrl(data.information_url);
    setInformationNotes(data.information_notes);
    setInformationBackground(data.information_background);
  };

  const clearForm = () => {
    setInformationName('');
    setInformationUrl('');
    setInformationNotes('');
    setInformationBackground('');
    setFileData(null);
  };

  useState(() => {
    if (paramsId != 'form') fetchData();
  });
  return (
    <>
      {contextHolder}
      <div className="form-input">
        <div className="form-area">
          <div className="input-area">
            <label>Gambar / Background</label>
            <UploadForm
              index={1}
              withFile={false}
              label=""
              isOptional={true}
              initFile={fileData}
              initUrl={informationBackground}
              onChange={(val) => setFileData(val)}
            />
          </div>
          <div className="input-area">
            <label>
              Pertanyaan{' '}
              {required.information_name && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.information_name?.toString()})
                </span>
              )}
            </label>
            <input
              value={informationName}
              onChange={(e) => setInformationName(e.target.value)}
              className={`base ${required.information_name ? 'error' : ''}`}
            />
          </div>
          <div className="input-area">
            <label>
              Jawaban{' '}
              {required.information_notes && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.information_notes?.toString()})
                </span>
              )}
            </label>
            <textarea
              value={informationNotes}
              onChange={(e) => setInformationNotes(e.target.value)}
              className={`base ${required.information_notes ? 'error' : ''}`}
            />
          </div>
          <div className="input-area">
            <label>
              Alamat URL{' '}
              {required.information_url && (
                <span className="text-red-500 text-[10px]/[14px] italic">
                  ({required.information_url?.toString()})
                </span>
              )}
            </label>
            <input
              value={informationUrl}
              onChange={(e) => setInformationUrl(e.target.value)}
              className={`base ${required.information_url ? 'error' : ''}`}
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
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diproses"
      />
    </>
  );
};

export default InformationEducationalPageForm;
