'use client';

import { IBrand } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { AxiosError } from 'axios';

const BrandPageForm = (props: { paramsId: string }) => {
  const { paramsId } = props;

  const url = `/core/brand`;

  const [required, setRequired] = useState<IBrand>({} as IBrand);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Fetch Data
  // ========================
  const fetchData = async () => {
    try {
      const resp = await axiosInstance.get(`${url}/${paramsId}/`);

      const { data } = resp;

      setName(data.name || '');
      setDescription(data.description || '');
      setImagePreview(data.image || '');
    } catch (error) {
      console.error(error);

      api.error({
        message: 'Error',
        description: 'Gagal memuat data brand',
        placement: 'bottomRight',
      });
    }
  };

  // ========================
  // Clear Form
  // ========================
  const clearForm = () => {
    setName('');
    setDescription('');
    setImage(null);
    setImagePreview('');
    setRequired({} as IBrand);
  };

  // ========================
  // Image Change
  // ========================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);

    // Buat preview image
    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // ========================
  // Upload Image
  // ========================
  const uploadImage = async (id: number) => {
    if (!image) return;

    const formData = new FormData();

    formData.append('file', image);

    await axiosInstance.post(`${url}/upload/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  // ========================
  // Save
  // ========================
  const onSave = async () => {
    setRequired({} as IBrand);

    const body = {
      name,
      description,
    };

    try {
      if (paramsId === 'form') {
        // ========================
        // CREATE
        // ========================
        const resp = await axiosInstance.post(`${url}/`, body);

        /*
         * Sesuaikan dengan response API.
         *
         * Contoh:
         * {
         *   "id": 1,
         *   "name": "Antam",
         *   ...
         * }
         */

        const createdId = resp.data?.id ?? resp.data?.data?.id;

        // Upload image setelah data berhasil dibuat
        if (image && createdId) {
          await uploadImage(Number(createdId));
        }

        api.success({
          message: 'Data Brand',
          description: 'Data Brand Telah Disimpan',
          placement: 'bottomRight',
        });

        clearForm();
      } else {
        // ========================
        // UPDATE
        // ========================
        await axiosInstance.patch(`${url}/${paramsId}/`, body);

        // Upload image jika user memilih image baru
        if (image) {
          await uploadImage(Number(paramsId));
        }

        api.success({
          message: 'Data Brand',
          description: 'Data Brand Telah Diupdate',
          placement: 'bottomRight',
        });

        // Refresh data
        await fetchData();

        // Reset file yang dipilih
        setImage(null);
      }
    } catch (error) {
      console.error(error);

      const err = error as AxiosError;

      if (err.response?.data) {
        const data = err.response.data as IBrand;

        setRequired(data);
      }

      api.error({
        message: 'Error',
        description: 'Gagal menyimpan data brand',
        placement: 'bottomRight',
      });
    }
  };

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
  // Initial Load
  // ========================
  useEffect(() => {
    if (paramsId !== 'form') {
      fetchData();
    }
  }, [paramsId]);

  // ========================
  // Render
  // ========================
  return (
    <div className="form-input">
      {contextHolder}

      <div className="form-area">
        {/* ========================
            Nama Brand
        ======================== */}
        <div className="input-area">
          <label>
            Nama Brand{' '}
            {required.name && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.name.toString()})
              </span>
            )}
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`base ${required.name ? 'error' : ''}`}
          />
        </div>

        {/* ========================
            Deskripsi
        ======================== */}
        <div className="input-area">
          <label>
            Deskripsi{' '}
            {required.description && (
              <span className="text-red-500 text-[10px]/[14px] italic">
                ({required.description.toString()})
              </span>
            )}
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`base ${required.description ? 'error' : ''}`}
            rows={4}
          />
        </div>

        {/* ========================
            Image
        ======================== */}
        <div className="input-area">
          <label>Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="base"
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-[10px]">
              <label>Preview Image</label>

              <div className="mt-[5px]">
                <img
                  src={imagePreview}
                  alt="Brand"
                  className="h-[150px] w-[150px] rounded-md border border-border object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================
          Button
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

export default BrandPageForm;
