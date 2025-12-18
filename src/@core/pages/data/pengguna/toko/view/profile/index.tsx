/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  IPenggunaAplikasi,
  IUserAddress,
  IUserBank,
} from '@/@core/@types/interface';
import { formatDecimal, formatterNumber } from '@/@core/utils/general';
import { ArrowSquareUpRight, Edit05, Upload01 } from '@untitled-ui/icons-react';
import dynamic from 'next/dynamic';
import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import ModalBank from './modal-bank';
import Modalstatus from '@/@core/components/modal/modal-status';
import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';
import ModalstatusVerify from '@/@core/components/modal/modal-status-verifikasi';

const ModalAddress = dynamic(
  () => import('@/@core/components/modal/modal-address'),
  { ssr: false }
);

const PengggunaProfile = (props: {
  detail: IPenggunaAplikasi;
  setRefresData: Dispatch<SetStateAction<boolean>>;
}) => {
  const { detail, setRefresData } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalBankOpen, setIsModalBankOpen] = useState(false);
  const [isModalStatusOpen, setIsModalStatusOpen] = useState(false);
  const [isModalStatusOpenVerify, setIsModalStatusOpenVerify] = useState(false);
  const [userAddress, setUserAddress] = useState<IUserAddress>(
    {} as IUserAddress
  );
  const [userBank, setUserBank] = useState<IUserBank>({} as IUserBank);
  const inputFile = useRef<HTMLInputElement>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const showModalAddress = () => {
    setUserAddress(detail.address ? detail.address : ({} as IUserAddress));
    setIsModalOpen(true);
  };

  const showModalBank = () => {
    setUserBank({
      ...userBank,
      bank_account_code: detail.props.bank_account_code,
      bank_account_holder_name: detail.props.bank_account_holder_name,
      bank_account_number: detail.props.bank_account_number,
    });
    setIsModalBankOpen(true);
  };

  const onChangeKTP = () => {
    const files = inputFile.current?.files;
    if (files) {
      const body = new FormData();
      body.append('file', files[0]);
      setIsModalLoading(true);
      axiosInstance
        .post(`users/admin/${detail.id}/upload_ktp`, body)
        .then((resp) => {
          const { data } = resp;
          const dataKTP = data.result.data;
          delete dataKTP.image_quality;
          delete dataKTP.status_code;
          delete dataKTP.reference_id;
          axiosInstance
            .put(`users/admin/${detail.id}/verify_ktp`, dataKTP)
            .then(() => {
              setIsModalLoading(false);
              setRefresData(true);
            })
            .catch(() => {
              setIsModalLoading(false);
              setRefresData(true);
            });
        })
        .catch(() => {
          setIsModalLoading(false);
          setRefresData(true);
        });
    }
  };

  return (
    <>
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
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Nama
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  : {detail.name ?? '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Username
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  : {detail.user_name ?? '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Email
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  : {detail.email ?? '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Nomor Telepon
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  : {detail.phone_number ?? '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Level
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :{' '}
                  {detail.props && detail.props.level != ''
                    ? detail.props.level
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Nomor Member
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.member_number && detail.member_number != ''
                    ? detail.member_number
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Verifikasi 2FA
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  : {detail.is_2fa_verified ? 'Aktif' : 'Tidak Aktif'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Status Akun
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :
                  <span className="flex items-center gap-[4px]">
                    {detail.is_active ? 'Aktif' : 'Tidak Aktif'}
                    <a
                      className="cursor-pointer"
                      onClick={() => setIsModalStatusOpen(true)}
                    >
                      <span className="my-icon icon-sm">
                        <Edit05 />
                      </span>
                    </a>
                  </span>
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Status Verifikasi
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :
                  <span className="flex items-center gap-[4px]">
                    {detail.is_verified ? (
                      <span className="text-green-600">Sudah Verifikasi</span>
                    ) : (
                      <span className="text-red-600">Belum Verifikasi</span>
                    )}
                    {!detail.is_verified && (
                      <a
                        className="cursor-pointer"
                        onClick={() => setIsModalStatusOpenVerify(true)}
                      >
                        <span className="my-icon icon-sm">
                          <Edit05 />
                        </span>
                      </a>
                    )}
                  </span>
                </p>
              </div>
              <div className="flex items-center border-b border-r rounded-tl-[6px] border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
                <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                  Data Toko
                </h5>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Nama Toko
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :{' '}
                  {(detail.seller_props && detail.seller_props.nama_toko) ??
                    '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Alamat Toko
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :{' '}
                  {(detail.seller_props && detail.seller_props.alamat_toko) ??
                    '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  No. Telepon Toko
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :{' '}
                  {(detail.seller_props && detail.seller_props.no_telp_toko) ??
                    '-'}
                </p>
              </div>
              {/* <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  SIUP
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  : {(detail.seller_props && detail.seller_props.siup) ?? '-'}
                </p>
              </div> */}
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  NIB
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :{' '}
                  {detail.seller_props && detail.seller_props.nib ? (
                    <a
                      href={detail.seller_props.file_nib}
                      className="text-blue-600 flex items-center gap-[4px]"
                      target="_blank"
                    >
                      {detail.seller_props.nib}
                      <span className="my-icon icon-sm">
                        <ArrowSquareUpRight />
                      </span>
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  NPWP
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :{' '}
                  {detail.seller_props && detail.seller_props.npwp ? (
                    <a
                      href={detail.seller_props.file_npwp}
                      className="text-blue-600 flex items-center gap-[4px]"
                      target="_blank"
                    >
                      {detail.seller_props.npwp}
                      <span className="my-icon icon-sm">
                        <ArrowSquareUpRight />
                      </span>
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Kontak Person
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :{' '}
                  {detail.seller_props &&
                  detail.seller_props.file_contact_person ? (
                    <a
                      href={detail.seller_props.file_contact_person}
                      className="text-blue-600 flex items-center gap-[4px]"
                      target="_blank"
                    >
                      Download
                      <span className="my-icon icon-sm">
                        <ArrowSquareUpRight />
                      </span>
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div className="flex items-center border-b  border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Foto KTP
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  :{' '}
                  {detail.photo_ktp_url && detail.photo_ktp_url ? (
                    <a
                      href={detail.photo_ktp_url}
                      className="text-blue-600 flex items-center gap-[4px]"
                      target="_blank"
                    >
                      Download
                      <span className="my-icon icon-sm">
                        <ArrowSquareUpRight />
                      </span>
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </div>
            <div className="flex w-1/2 flex-col">
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
                <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                  Data Saldo / Wallet
                </h5>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Saldo Wallet Nemas
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.props && detail.props.wallet.balance
                    ? `Rp${formatterNumber(detail.props.wallet.balance)}`
                    : 'Rp0'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Saldo Tabungan Emas
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.props && detail.props.gold_stock.weight
                    ? `${formatDecimal(detail.props.gold_stock.weight)} gr`
                    : '0 gr'}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Saldo Deposito Emas
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.props && detail.props.invest_gold_wgt
                    ? `${formatDecimal(detail.props.invest_gold_wgt)} gr`
                    : '0 gr'}
                </p>
              </div>
              <div className="flex items-center border-r border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Berat Emas yg Digadaikan
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.props && detail.props.loan_wgt
                    ? `${formatDecimal(detail.props.loan_wgt)} gr`
                    : '0 gr'}
                </p>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
                <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                  Rekening Bank
                </h5>
                <a className="cursor-pointer" onClick={() => showModalBank()}>
                  <span className="my-icon icon-sm">
                    <Edit05 />
                  </span>
                </a>
              </div>
              <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Nama Bank
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.props && detail.props.bank_name
                    ? detail.props.bank_name
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  No. Rekening
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.props && detail.props.bank_account_number
                    ? detail.props.bank_account_number
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  A.n Rekening
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.props && detail.props.bank_account_holder_name
                    ? detail.props.bank_account_holder_name
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]"></div>
              <div className="flex justify-between items-center border-b  border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
                <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                  Data Alamat
                </h5>
                <a
                  className="cursor-pointer"
                  onClick={() => showModalAddress()}
                >
                  <span className="my-icon icon-sm">
                    <Edit05 />
                  </span>
                </a>
              </div>
              <div className="flex items-center border-b  border-gray-200 px-[10px] py-[4px] h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Alamat
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.address && detail.address.address != ''
                    ? detail.address.address
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-b  border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Kelurahan
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.address && detail.address.subdistrict != ''
                    ? detail.address.subdistrict
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Kecamatan
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.address && detail.address.district != ''
                    ? detail.address.district
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Kab / Kota
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.address && detail.address.city != ''
                    ? detail.address.city
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Provinsi
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.address &&
                  detail.address.province != '' &&
                  detail.address.province != null
                    ? detail.address.province
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-gray-200 border-b px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Kode Pos
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.address && detail.address.postal_code != ''
                    ? detail.address.postal_code
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-gray-200 border-b px-[10px] py-[4px] min-h-[30px]">
                <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                  Latitude, Longitude
                </label>
                <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                  <span>:</span>
                  {detail.address && detail.address.latitude
                    ? `${detail.address.latitude}, ${detail.address.longtitude}`
                    : '-'}
                </p>
              </div>
              <div className="flex items-center border-gray-200 px-[10px] py-[4px] min-h-[30px]"></div>
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="w-full flex-col flex border border-t-0 border-gray-200 rounded-br-[6px] rounded-bl-[6px]">
            <div className="flex items-center justify-between border-b border-gray-200 px-[10px] py-[4px] min-h-[30px] bg-gray-50 ">
              <h5 className="font-semibold text-neutral-700 text-[17px]/[17px] ">
                Data KTP Pengguna
              </h5>
              <div>
                <input
                  id="file-upload"
                  ref={inputFile}
                  accept=".jpg, .jpeg,.png"
                  type="file"
                  name="file"
                  className="hidden"
                  onChange={onChangeKTP}
                />
                <label
                  className="flex items-center gap-[4px] text-blue-600 text-sm cursor-pointer"
                  htmlFor="file-upload"
                >
                  <span className="my-icon icon-sm">
                    <Upload01 />
                  </span>
                  Upload KTP
                </label>
              </div>
            </div>
            <div className="flex">
              <div className="flex w-1/2 flex-col">
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    NIK
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    : {detail.ktp && detail.ktp.nik ? detail.ktp.nik : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Nama
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.full_name
                      ? detail.ktp.full_name
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Tgl. Lahir
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.date_of_birth
                      ? detail.ktp.date_of_birth
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Tempat Lahir
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.place_of_birth
                      ? detail.ktp.place_of_birth
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Status Perkawainan
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.marital_status
                      ? detail.ktp.marital_status
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Jenis Kelamin
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.gender ? detail.ktp.gender : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-r border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Golongan Darah
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.blood_type
                      ? detail.ktp.blood_type
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex w-1/2 flex-col">
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Agama
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.religion
                      ? detail.ktp.religion
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Kewarganegaraan
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.nationality
                      ? detail.ktp.nationality
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Pekerjaan
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.occupation
                      ? detail.ktp.occupation
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Alamat (Domisili)
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.address
                      ? detail.ktp.address
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Kelurahan (Domisili)
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.administrative_village
                      ? detail.ktp.administrative_village
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Kecamatan (Domisili)
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    <span>:</span>
                    {detail.ktp && detail.ktp.district
                      ? detail.ktp.district
                      : '-'}
                  </p>
                </div>
                <div className="flex items-center border-b border-gray-200 px-[10px] py-[4px] min-h-[30px]">
                  <label className="w-[200px] text-[14px]/[14px] text-neutral-500">
                    Kota (Domisili)
                  </label>
                  <p className="text-[14px]/[14px] text-neutral-700 font-medium flex items-center gap-[4px] flex-1">
                    : {detail.ktp && detail.ktp.city ? detail.ktp.city : '-'}
                  </p>
                </div>
                <div className="flex items-center border-gray-200 px-[10px] py-[4px] min-h-[30px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalAddress
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        userAddress={userAddress}
        setUserAddress={setUserAddress}
        userId={detail.id}
        setRefresData={setRefresData}
      />
      <ModalBank
        isModalOpen={isModalBankOpen}
        setIsModalOpen={setIsModalBankOpen}
        userBank={userBank}
        setUserBank={setUserBank}
        userId={detail.id}
        setRefresData={setRefresData}
      />
      <Modalstatus
        isModalOpen={isModalStatusOpen}
        setIsModalOpen={setIsModalStatusOpen}
        userDetail={detail}
        setRefresData={setRefresData}
      />
      <ModalstatusVerify
        isModalOpen={isModalStatusOpenVerify}
        setIsModalOpen={setIsModalStatusOpenVerify}
        userDetail={detail}
        setRefresData={setRefresData}
      />
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang dalam proses"
      />
    </>
  );
};

export default PengggunaProfile;
