/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';
import { Plus } from '@untitled-ui/icons-react';
import { InputNumber, Modal } from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';

interface ITopUpLimitHistory {
  id: string;
  user: string;
  user_name: string;
  old_value: number;
  new_value: number;
  create_time: string;
  create_user: string;
  create_user_name: string;
}

const ProfileLimitTopUp = (props: { id: string }) => {
  const { id } = props;

  const [histories, setHistories] = useState<ITopUpLimitHistory[]>([]);

  const [params, setParams] = useState({
    offset: 0,
    limit: 1000,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topupLimit, setTopupLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(
        `/users/admin/${id}/topup-limit/history`,
        {
          params: {
            limit: params.limit,
            offset: params.offset,
          },
        }
      );

      setHistories(resp.data.results ?? []);
    } catch (error) {
      console.error('Failed to fetch top up limit history:', error);
    }
  }, [id, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => {
    setTopupLimit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (loading) return;

    setIsModalOpen(false);
    setTopupLimit(null);
  };

  const handleSubmit = async () => {
    if (topupLimit === null || topupLimit < 0) {
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.patch(`/users/admin/${id}/topup-limit`, {
        level_topup_limit: topupLimit,
      });

      setIsModalOpen(false);
      setTopupLimit(null);

      // Kembali ke halaman pertama setelah update limit
      setParams((prev) => ({
        ...prev,
        offset: 0,
      }));

      // Jika sudah di halaman pertama, fetchData tetap perlu dipanggil
      if (params.offset === 0) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to update top up limit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[10px]">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-base font-medium">History Limit Top Up</label>

        <button
          type="button"
          className="btn !h-[44px] btn-primary"
          onClick={handleOpenModal}
        >
          <span>
            <Plus />
          </span>
          Tambah Limit Top Up
        </button>
      </div>

      {/* TABLE */}
      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] overflow-auto">
        <table className="table-basic">
          <thead>
            <tr>
              <th>No</th>
              <th>User</th>
              <th>Limit Sebelumnya</th>
              <th>Limit Baru</th>
              <th>Tanggal Perubahan</th>
              <th>Diubah Oleh</th>
            </tr>
          </thead>

          <tbody>
            {histories.length > 0 ? (
              histories.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + params.offset + 1}</td>

                  <td>{item.user_name || '-'}</td>

                  <td>{formatterNumber(item.old_value)}</td>

                  <td>{formatterNumber(item.new_value)}</td>

                  <td>
                    {moment(item.create_time).format('DD MMMM YYYY HH:mm')}
                  </td>

                  <td>{item.create_user_name || item.create_user || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  Tidak ada history limit top up
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH LIMIT */}
      <Modal
        title="Tambah Limit Top Up"
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText="Simpan"
        cancelText="Batal"
        confirmLoading={loading}
        destroyOnClose
      >
        <div className="flex flex-col gap-[8px] py-[12px]">
          <label className="text-sm font-medium">Limit Top Up</label>

          <InputNumber
            className="w-full"
            size="large"
            min={0}
            precision={0}
            placeholder="Masukkan limit top up"
            value={topupLimit}
            onChange={(value) => {
              setTopupLimit(value);
            }}
            formatter={(value) =>
              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
            }
            parser={(value) => (value ? Number(value.replace(/\./g, '')) : 0)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProfileLimitTopUp;
