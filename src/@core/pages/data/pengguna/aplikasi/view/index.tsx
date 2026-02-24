'use client';

import { IPenggunaAplikasi } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { notification, Segmented } from 'antd';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import PengggunaProfile from './profile';
import ProfileTransaction from './transaction';
import { UndoOutlineIcon } from '@/@core/my-icons';

const DataPenggunaPageView = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/users/admin/${paramsId}`;

  const [refreshData, setRefresData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<IPenggunaAplikasi>(
    {} as IPenggunaAplikasi
  );
  const [api, contextHolder] = notification.useNotification();

  const [tab, setTab] = useState('profile');

  const tabs = [
    { label: 'Profil Pengguna', value: 'profile' },
    { label: 'Transaksi', value: 'transaction' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    axiosInstance.get(url).then((resp) => {
      const { data } = resp;
      setDetail(data.user);
      setLoading(false);
    });
  }, [url]);

  useEffect(() => {
    if (refreshData) {
      fetchData();
      setRefresData(false);
      api.info({
        message: 'Data Profil',
        description: 'Data Profile Telah Diupdate',
        placement: 'bottomRight',
      });
    }
  }, [refreshData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {contextHolder}
      <hr />
      <div className="flex gap-[4px] items-center justify-end">
        <Link
          href={`/data/pengguna/aplikasi`}
          className="btn btn-outline-neutral"
        >
          <UndoOutlineIcon /> Kembali
        </Link>
      </div>
      <Segmented
        value={tab}
        style={{ marginBottom: 8 }}
        onChange={setTab}
        options={tabs}
      />
      {!loading && (
        <>
          {tab == 'profile' && (
            <PengggunaProfile detail={detail} setRefresData={setRefresData} />
          )}
          {tab == 'transaction' && <ProfileTransaction id={detail.id} />}
        </>
      )}
    </>
  );
};

export default DataPenggunaPageView;
