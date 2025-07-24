'use client';

import { IPenggunaAplikasi } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { FlipBackward } from '@untitled-ui/icons-react';
import { Segmented } from 'antd';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import PengggunaProfile from './profile';
import ProfileTransaction from './transaction';

const DataPenggunaPageView = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/users/${paramsId}`;

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<IPenggunaAplikasi>(
    {} as IPenggunaAplikasi
  );

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
    fetchData();
  }, [fetchData]);

  return (
    <>
      <hr />
      <div className="flex gap-[4px] items-center justify-end">
        <Link href={`/data/pengguna`} className="btn btn-outline-neutral">
          <FlipBackward /> Kembali
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
          {tab == 'profile' && <PengggunaProfile detail={detail} />}
          {tab == 'transaction' && <ProfileTransaction id={detail.id} />}
        </>
      )}
    </>
  );
};

export default DataPenggunaPageView;
