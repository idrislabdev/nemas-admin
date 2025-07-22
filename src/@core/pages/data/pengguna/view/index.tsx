'use client';

import { IPenggunaAplikasi } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { FlipBackward } from '@untitled-ui/icons-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

const DataPenggunaPageView = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/users/${paramsId}`;

  const [detail, setDetail] = useState<IPenggunaAplikasi>(
    {} as IPenggunaAplikasi
  );

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url);
    const { data } = resp;
    setDetail(data.user);
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
      {detail.ktp && (
        <div className="flex flex-col">
          <div className="flex">
            <div className="w-full flex border border-gray-200 rounded-tr-[6px] rounded-tl-[6px]">
              <div className="flex w-1/2 flex-col">
                <div className="flex items-center border-b border-r rounded-tr-[6px] rounded-tl-[6px] border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
                  <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                    Data Pengguna
                  </h5>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Nama
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.name ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Username
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.user_name ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Email
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.email ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Nomor Telepon
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.phone_number ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Level
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    :{' '}
                    {detail.props.level && detail.props.level != ''
                      ? detail.props.level
                      : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Nomor Member
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    :{' '}
                    {detail.member_number && detail.member_number != ''
                      ? detail.member_number
                      : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Verifikasi 2FA
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.is_2fa_verified ? 'Aktif' : 'Tidak Aktif'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
                  <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                    Data Alamat
                  </h5>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Alamat
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.props.address ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Kode POS
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.props.address_post_code ?? 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex w-1/2 flex-col">
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
                  <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                    Detail Akun
                  </h5>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    wallet_amt
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.props.wallet_amt ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    gold_wgt
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.props.gold_wgt ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    invest_gold_wgt
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.props.invest_gold_wgt ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    loan_wgt
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.props.loan_wgt ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
                  <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                    Rekening Bank
                  </h5>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Nama Bank
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.props.bank_account_code ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    No. Rekening
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.props.bank_account_number ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    A.n Rekening
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.props.bank_account_holder_name ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-gray-200 px-[10px] py-[4px] min-h-[30px]"></div>
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="w-full flex border border-t-0 border-gray-200 rounded-br-[6px] rounded-bl-[6px]">
              <div className="flex w-1/2 flex-col">
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
                  <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                    Data KTP Pengguna
                  </h5>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    NIK
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.nik ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Nama
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.full_name ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Tgl. Lahir
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.date_of_birth ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Tempat Lahir
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.place_of_birth ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Status Perkawainan
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.marital_status ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Jenis Kelamin
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.gender ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Golongan Darah
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.blood_type ?? 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex w-1/2 flex-col">
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 "></div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Agama
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.religion ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Kewarganegaraan
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.nationality ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Pekerjaan
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.occupation ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Alamat (Domisili)
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.address ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Kelurahan (Domisili)
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.administrative_village ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Kecamatan (Domisili)
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.district ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[150px] text-[14px]/[14px] text-neutral-500">
                    Kota (Domisili)
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px]">
                    : {detail.ktp.city ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center border-gray-200 px-[10px] py-[4px] min-h-[30px]"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataPenggunaPageView;
