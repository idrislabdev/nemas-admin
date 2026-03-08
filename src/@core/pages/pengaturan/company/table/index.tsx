'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useState } from 'react';
import { notification, Spin, Input, InputNumber } from 'antd';
import axiosInstance from '@/@core/utils/axios';
import { Pencil01, Save01, X } from '@untitled-ui/icons-react';

interface ICompanyConfig {
  company_id: number;
  company_name: string;
  company_address: string;
  company_phone_number: string;
  company_email: string;
  company_operational_head: string;
  admin_phone_number: string;
  admin_email: string;
  minimum_stock: string;
}

const CompanyConfigEditable = () => {
  const url = `/core/admin/company`;

  const [data, setData] = useState<ICompanyConfig | null>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Fetch Data
  // ========================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axiosInstance.get(`${url}?limit=10&offset=0`);

      if (resp.data.results && resp.data.results.length > 0) {
        const company = resp.data.results[0];
        setData(company);
        setForm(company);
      }
    } catch {
      api.error({
        message: 'Load Data Gagal',
        description: 'Tidak dapat memuat konfigurasi perusahaan',
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  }, [url, api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ========================
  // Handle Change
  // ========================
  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ========================
  // Handle Save
  // ========================
  const handleSave = async () => {
    if (!data?.company_id) return;

    try {
      setLoading(true);

      await axiosInstance.patch(`/core/admin/company/${data.company_id}/`, {
        company_name: form.company_name,
        company_address: form.company_address,
        company_phone_number: form.company_phone_number,
        company_email: form.company_email,
        company_operational_head: form.company_operational_head,
        admin_phone_number: form.admin_phone_number,
        admin_email: form.admin_email,
        minimum_stock: form.minimum_stock,
      });

      api.success({
        message: 'Berhasil',
        description: 'Konfigurasi perusahaan berhasil diperbarui',
        placement: 'bottomRight',
      });

      setEditing(false);
      fetchData();
    } catch {
      api.error({
        message: 'Gagal Update',
        description: 'Tidak dapat memperbarui data perusahaan',
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(data);
    setEditing(false);
  };

  // ========================
  // Formatter angka Indonesia
  // ========================
  const formatNumber = (value: string | number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID').format(Number(value));
  };

  // ========================
  // Render Item
  // ========================
  const renderItem = (
    label: string,
    field: string,
    type: 'text' | 'textarea' | 'number' | 'stock' = 'text'
  ) => (
    <div className="grid grid-cols-3 border-b border-gray-200">
      <div className="p-3 font-medium bg-gray-50 text-sm">{label}</div>

      <div className="p-3 col-span-2 text-sm">
        {editing ? (
          type === 'textarea' ? (
            <Input.TextArea
              rows={3}
              value={form[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="text-sm!"
            />
          ) : type === 'number' ? (
            <InputNumber
              value={form[field]}
              onChange={(value) => handleChange(field, value?.toString() || '')}
              min={0}
              style={{ width: '100%' }}
              formatter={(value) =>
                value
                  ? new Intl.NumberFormat('id-ID').format(Number(value))
                  : ''
              }
              parser={(value) => value!.replace(/\./g, '')}
            />
          ) : type === 'stock' ? (
            <InputNumber
              value={form[field]}
              onChange={(value) => handleChange(field, value?.toString() || '')}
              min={0}
              style={{ width: '100%' }}
              addonAfter="gr"
              formatter={(value) =>
                value
                  ? new Intl.NumberFormat('id-ID').format(Number(value))
                  : ''
              }
              parser={(value) => value!.replace(/\./g, '')}
            />
          ) : (
            <Input
              value={form[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="text-sm!"
            />
          )
        ) : type === 'stock' ? (
          `${formatNumber(form[field])} gr`
        ) : (
          form[field] || '-'
        )}
      </div>
    </div>
  );

  return (
    <>
      {contextHolder}

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <Spin spinning={loading}>
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold text-lg">Konfigurasi Perusahaan</h2>

            {!editing ? (
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setEditing(true)}
              >
                <Pencil01 size={18} />
                Edit Data
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="btn btn-outline-secondary flex items-center gap-2"
                  onClick={handleCancel}
                >
                  <X size={18} />
                  Batal
                </button>

                <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={handleSave}
                >
                  <Save01 size={18} />
                  Simpan
                </button>
              </div>
            )}
          </div>

          {renderItem('Nama Perusahaan', 'company_name')}
          {renderItem('Alamat', 'company_address', 'textarea')}
          {renderItem('No. Telepon', 'company_phone_number')}
          {renderItem('Email', 'company_email')}
          {renderItem('Operational Head', 'company_operational_head')}
          {renderItem('Email Admin', 'admin_email')}
          {renderItem('No. Hp Admin', 'admin_phone_number')}
          {renderItem('Stock Minimum', 'minimum_stock', 'stock')}
        </Spin>
      </div>
    </>
  );
};

export default CompanyConfigEditable;
