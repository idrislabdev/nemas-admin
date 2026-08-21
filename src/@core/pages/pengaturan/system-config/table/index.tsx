'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useCallback, useEffect, useState } from 'react';

import { notification, Spin, Input, Switch } from 'antd';

import axiosInstance from '@/@core/utils/axios';

import { Pencil01, Save01, X } from '@untitled-ui/icons-react';

interface ISystemConfig {
  id: number;
  key: string;
  value: string;
  description: string;
}

const SystemConfigTable = () => {
  const url = '/core/admin/system-config';

  const [data, setData] = useState<ISystemConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Fetch Data
  // ========================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const resp = await axiosInstance.get(url);

      const results = Array.isArray(resp.data) ? resp.data : resp.data?.results;

      setData(results ?? []);
    } catch {
      api.error({
        message: 'Load Data Gagal',
        description: 'Tidak dapat memuat konfigurasi sistem',
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
  // Check Boolean Config
  // ========================

  const isBooleanConfig = (config: ISystemConfig) => {
    return ['true', 'false'].includes(config.value.toLowerCase());
  };

  // ========================
  // Start Edit
  // ========================

  const handleEdit = (config: ISystemConfig) => {
    setEditingId(config.id);
    setEditingValue(config.value);
  };

  // ========================
  // Cancel Edit
  // ========================

  const handleCancel = () => {
    setEditingId(null);
    setEditingValue('');
  };

  // ========================
  // Save
  // ========================

  const handleSave = async (config: ISystemConfig) => {
    try {
      setLoading(true);

      await axiosInstance.put(`${url}/${config.id}/`, {
        key: config.key,
        value: editingValue,
        description: config.description,
      });

      api.success({
        message: 'Berhasil',
        description: `${config.key} berhasil diperbarui`,
        placement: 'bottomRight',
      });

      setEditingId(null);
      setEditingValue('');

      await fetchData();
    } catch {
      api.error({
        message: 'Gagal Update',
        description: `Tidak dapat memperbarui ${config.key}`,
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Render Value
  // ========================

  const renderValue = (config: ISystemConfig) => {
    const isEditing = editingId === config.id;

    if (isEditing) {
      if (isBooleanConfig(config)) {
        return (
          <Switch
            checked={editingValue === 'true'}
            onChange={(checked) => {
              setEditingValue(checked ? 'true' : 'false');
            }}
          />
        );
      }

      return (
        <Input
          size="small"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          className="max-w-[400px]"
        />
      );
    }

    if (isBooleanConfig(config)) {
      return <Switch size="small" checked={config.value === 'true'} disabled />;
    }

    return <span className="text-sm text-gray-700">{config.value || '-'}</span>;
  };

  return (
    <>
      {contextHolder}

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <Spin spinning={loading}>
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h2 className="font-semibold text-lg">Konfigurasi Sistem</h2>

              <p className="text-sm text-gray-500 mt-1">
                Kelola konfigurasi sistem aplikasi
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[25%]">
                    Key
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[25%]">
                    Value
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Deskripsi
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[120px]">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((config) => {
                    const isEditing = editingId === config.id;

                    return (
                      <tr
                        key={config.id}
                        className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50"
                      >
                        {/* Key */}
                        <td className="px-4 py-3 align-middle">
                          <span className="font-medium text-sm text-gray-700">
                            {config.key}
                          </span>
                        </td>

                        {/* Value */}
                        <td className="px-4 py-3 align-middle">
                          {renderValue(config)}
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3 align-middle">
                          <span className="text-sm text-gray-500">
                            {config.description || '-'}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center justify-center gap-2">
                            {!isEditing ? (
                              <button
                                type="button"
                                className="btn btn-primary flex items-center gap-1"
                                onClick={() => handleEdit(config)}
                                disabled={loading}
                              >
                                <Pencil01 />
                                Edit
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary flex items-center gap-1"
                                  onClick={handleCancel}
                                  disabled={loading}
                                >
                                  <X />
                                  Batal
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-primary flex items-center gap-1"
                                  onClick={() => handleSave(config)}
                                  disabled={loading}
                                >
                                  <Save01 />
                                  Simpan
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      Data konfigurasi sistem tidak ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Spin>
      </div>
    </>
  );
};

export default SystemConfigTable;
