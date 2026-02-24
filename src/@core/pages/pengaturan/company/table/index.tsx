'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useState } from 'react';
import { notification, Spin, Input } from 'antd';
import axiosInstance from '@/@core/utils/axios';
import { Pencil01, Save01, X } from '@untitled-ui/icons-react';

interface ICompanyConfig {
  company_id: number;
  company_name: string;
  company_address: string;
  company_phone_number: string;
  company_email: string;
  company_operational_head: string;
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
  // Handle Save (PATCH)
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

  const renderItem = (
    label: string,
    field: string,
    type: 'text' | 'textarea' = 'text'
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
          ) : (
            <Input
              value={form[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="text-sm!"
            />
          )
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
                className="btn btn-primary"
                onClick={() => setEditing(true)}
              >
                <Pencil01 />
                Edit Data
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                >
                  <X />
                  Batal
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save01 />
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
        </Spin>
      </div>
    </>
  );
};

export default CompanyConfigEditable;
