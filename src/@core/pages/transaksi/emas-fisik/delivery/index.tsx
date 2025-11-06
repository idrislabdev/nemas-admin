/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  IOrderGold,
  IOrderGoldDetail,
  IOrderGoldDetailPayload,
} from '@/@core/@types/interface';
import { UndoOutlineIcon } from '@/@core/my-icons';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { FileAttachment01, Truck01, X } from '@untitled-ui/icons-react';
import UploadMiniForm from '@/@core/components/forms/upload-mini-form';
import { notification } from 'antd';
import ModalSertifikat from '../modal-sertifikat';
import { useRouter } from 'next/navigation';
import ModalLoading from '@/@core/components/modal/modal-loading';

const ComEmasFisikDeliveryPage = (props: {
  parentUrl: string;
  paramsId: string;
}) => {
  const { parentUrl, paramsId } = props;
  const [data, setData] = useState<IOrderGold>({} as IOrderGold);
  const [refreshData, setRefresData] = useState(false);
  const [fileData, setFileData] = useState<File | null>(null);
  const [payloads, setPayloads] = useState<IOrderGoldDetailPayload[]>([]);
  const [fileAdditionalData, setFileAdditionalData] = useState<File | null>(
    null
  );
  const [note, setNote] = useState('');
  const [isModalSertifikat, setIsModalSertifikat] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectGoldId, setSelectGoldId] = useState(0);
  const [detailErrors, setDetailErrors] = useState<Record<string, string[]>[]>(
    []
  );
  const [uploadFileError, setUploadFileError] = useState<string[]>([]);
  const [additionalFileError, setAdditionalFileError] = useState<string[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(
      `/reports/gold-sales-order/${paramsId}`
    );
    const respDetail = await axiosInstance.get(
      `/reports/gold-sales-order/${paramsId}/detail`
    );
    const details: IOrderGoldDetailPayload[] =
      respDetail.data.order_gold_details.map((item: IOrderGoldDetail) => ({
        order_detail_id: item.order_gold_detail_id,
        gold_type: item.gold_type,
        gold_brand: item.gold_brand,
        weight: item.weight,
        qty: item.qty,
        order_detail_total_price: item.order_detail_total_price,
        gold_price: item.gold_price,
        gold_cert_detail_price: null,
        gold_cert_detail: null,
        pre_packing_file: null,
        post_packing_file: null,
        gold: item.gold,
      }));
    setData(resp.data);
    setPayloads(details);
  }, [paramsId]);

  const onChangeDetail = (
    field:
      | 'pre_packing_file'
      | 'post_packing_file'
      | 'gold_cert_detail_price'
      | 'gold_cert_detail',
    index: number,
    value: File | string | null
  ) => {
    setPayloads((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const uploadFile = async (file: File | null): Promise<string> => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);
    const resp = await axiosInstance.post('/delivery/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data.file_url || resp.data; // API bisa return string atau object {url}
  };

  const handleSubmit = async () => {
    try {
      // Upload utama dan additional
      setIsModalLoading(true);
      const deliveryFileUrl = await uploadFile(fileData);
      const additionalFileUrl = await uploadFile(fileAdditionalData);

      // Upload per detail pre/post packing
      const uploadedDetails = await Promise.all(
        payloads.map(async (item) => {
          const preUrl = await uploadFile(item.pre_packing_file as File | null);
          const postUrl = await uploadFile(
            item.post_packing_file as File | null
          );

          return {
            order_detail_id: item.order_detail_id,
            gold_cert_detail_price: item.gold_cert_detail_price,
            gold_cert_detail: item.gold_cert_detail,
            pre_packing_photo_url: preUrl,
            post_packing_photo_url: postUrl,
          };
        })
      );

      // Buat payload utama
      const payload = {
        order: data.order_gold_id,
        delivery_type: data.tracking_courier_service_name,
        order_shipping: data.order_shipping[0]?.order_delivery_id ?? '',
        user: data.user.id,
        delivery_pickup_request_datetime:
          data.order_shipping[0]?.delivery_pickup_date ?? '',
        delivery_tracking_number: '',
        delivery_notes: note,
        delivery_file_url: deliveryFileUrl,
        additional_file_url: additionalFileUrl,
        details: uploadedDetails,
      };

      await axiosInstance.post('/delivery/create', payload);

      api.success({
        message: 'Proses Sukses',
        description: 'Data order pengiriman berhasil disimpan',
        placement: 'bottomRight',
      });
      setRefresData(true);
      setFileData(null);
      setNote('');
      setIsModalLoading(false);
      router.push(`${parentUrl}/${paramsId}`);
    } catch (error: any) {
      console.error(error);
      if (error.response?.data) {
        setDetailErrors(error.response.data.details || []);
        setUploadFileError(error.response.data.delivery_file_url || []);
        setAdditionalFileError(error.response.data.additional_file_url || []);
      }

      api.error({
        message: 'Proses Gagal',
        description: 'Data order gagal disimpan',
        placement: 'bottomRight',
      });
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    if (refreshData) fetchData();
  }, [refreshData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="flex flex-col gap-[10px]">
      {contextHolder}
      <hr />
      <div className="flex gap-[4px] items-center justify-end">
        <div className="flex items-center gap-[4px]">
          {!data.is_picked_up && data.order_gold_payment_status == 'PAID' && (
            <a
              className="btn btn-outline-primary cursor-pointer w-full h-[28px] rounded"
              onClick={() => handleSubmit()}
            >
              <span className="my-icon icon-sm">
                <FileAttachment01 />
              </span>
              Buat Surat Jalan
            </a>
          )}
          <Link href={`${parentUrl}`} className="btn btn-outline-neutral">
            <UndoOutlineIcon /> Kembali
          </Link>
        </div>
      </div>

      {data.user && data.user.name && (
        <>
          <div className="flex flex-col">
            <div className="flex">
              {/* Kiri */}
              <div className="flex-1">
                {/* Data Transaksi */}
                <div className="border border-r-0 border-b-0 rounded-tl-md overflow-hidden">
                  <div className="flex flex-col justify-center bg-gray-100 px-4 h-[30px] font-semibold">
                    Data Transaksi
                  </div>
                  <div className="divide-y text-sm">
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Nomor Order</span>
                      <span className="font-medium">: {data.order_number}</span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Tanggal</span>
                      <span>
                        : {new Date(data.order_timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Status Pesanan</span>
                      <span className="font-medium flex items-center gap-[4px]">
                        :
                        <span className="bg-yellow-600 text-white text-[11px] rounded-md flex gap-[4px] items-center justify-center w-[70px] h-[20px] italic">
                          {data.order_status}
                        </span>
                      </span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">
                        Status Pembayaran
                      </span>
                      <span className="font-medium flex items-center gap-[4px]">
                        :{' '}
                        <span className="bg-blue-600 text-white text-[11px] rounded-md flex gap-[4px] items-center justify-center w-[70px] h-[20px] italic">
                          {data.order_gold_payment_status}
                        </span>
                      </span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">
                        Status Pengiriman
                      </span>
                      <span className="font-medium flex items-center gap-[4px]">
                        :
                        {data.is_picked_up && (
                          <span className="bg-green-600 text-white text-[11px] rounded-md flex gap-[4px] items-center justify-center w-[70px] h-[20px] italic">
                            <span className="my-icon icon-xs">
                              <Truck01 />
                            </span>
                            Dikirim
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Metode Bayar</span>
                      <span>: {data.order_payment_method_name}</span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Total</span>
                      <span className="font-bold text-green-600">
                        : Rp{formatterNumber(data.order_grand_total_price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Pengiriman */}
                <div className="border border-r-0 overflow-hidden">
                  <div className="flex flex-col justify-center bg-gray-100 px-4 h-[30px] font-semibold">
                    Data Pengiriman
                  </div>
                  <div className="divide-y text-sm">
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Kurir</span>
                      <span>
                        :{' '}
                        {data.order_shipping.length > 0
                          ? data.order_shipping[0].delivery_partner
                          : '-'}
                      </span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Ongkir</span>
                      <span>
                        : Rp
                        {data.order_shipping.length > 0
                          ? formatterNumber(
                              data.order_shipping[0].delivery_price
                            )
                          : '0'}
                      </span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Status</span>
                      <span>
                        :{' '}
                        {data.order_shipping.length > 0
                          ? data.order_shipping[0].delivery_status
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kanan */}
              <div className="flex-1">
                {/* Data Pengguna */}
                <div className="border border-b-0 rounded-tr-md overflow-hidden">
                  <div className="flex flex-col justify-center bg-gray-100 px-4 h-[30px] font-semibold">
                    Data Pengguna
                  </div>
                  <div className="divide-y text-sm">
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Nama</span>
                      <span>: {data.user.name}</span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Email</span>
                      <span>: {data.user.email}</span>
                    </div>
                    <div className="flex px-4 h-[30px] items-center">
                      <span className="w-40 text-gray-500">Telepon</span>
                      <span>: {data.user.phone_number}</span>
                    </div>
                  </div>
                </div>

                {/* Data Alamat */}
                <div className="border border-b-0 overflow-hidden">
                  <div className="flex flex-col justify-center bg-gray-100 px-4 h-[30px] font-semibold">
                    Alamat Pengiriman
                  </div>
                  <div className="divide-y text-sm">
                    <div className="px-4 h-[60px] text-sm">
                      {data.order_user_address.address},{' '}
                      {data.order_user_address.city},{' '}
                      {data.order_user_address.province},{' '}
                      {data.order_user_address.postal_code}
                    </div>
                  </div>
                </div>
                <div className="border">
                  <div className="flex flex-col justify-center bg-gray-100 px-4 h-[30px] font-semibold">
                    Upload Foto Evidence
                  </div>
                  <div className="flex items-center gap-[10px] px-4 h-[120px]">
                    <div className="w-[90px] h-[90px]">
                      <UploadMiniForm
                        index={1}
                        withFile={false}
                        label="Utama"
                        isOptional={true}
                        initFile={fileData}
                        initUrl={''}
                        isError={uploadFileError[0] ? true : false}
                        onChange={(val) => setFileData(val)}
                      />
                    </div>
                    <div className="w-[90px] h-[90px]">
                      <UploadMiniForm
                        index={2}
                        withFile={false}
                        label="Additional"
                        isOptional={true}
                        initFile={fileAdditionalData}
                        initUrl={''}
                        isError={additionalFileError[0] ? true : false}
                        onChange={(val) => setFileAdditionalData(val)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border border-t-0 rounded-br-md rounded-bl-md  overflow-hidden h-[90px] flex p-[10px]">
              <label>Note Pengiriman: </label>
              <textarea
                placeholder="tuliskan note pengiriman di sini"
                className="w-full h-full border-0 placeholder:font-normal"
              />
            </div>
          </div>
          {/* Data Emas full width di bawah */}
          <div className="mt-3 border rounded-md overflow-hidden">
            <div className="flex flex-col justify-center bg-gray-100 px-4 h-[30px] font-semibold">
              Data Emas
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 h-[30px] text-left">Brand</th>
                  <th className="px-3 h-[30px] text-left">Tipe</th>
                  <th className="px-3 h-[30px] text-left">Berat (gr)</th>
                  <th className="px-3 h-[30px] text-left">Qty</th>
                  <th className="px-3 h-[30px] text-left">Harga</th>
                  <th className="px-3 h-[30px] text-left">Total</th>
                  <th className="px-3 h-[30px] text-center">Serial Number</th>
                  <th className="px-3 h-[30px] text-center">
                    Foto Sebelum Packing
                  </th>
                  <th className="px-3 h-[30px] text-center">
                    Foto Sesudah Packing
                  </th>
                </tr>
              </thead>
              <tbody>
                {payloads.map((item, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="px-3 h-[30px]">{item.gold_brand}</td>
                    <td className="px-3 h-[30px]">{item.gold_type}</td>
                    <td className="px-3 h-[30px] text-left">{item.weight}</td>
                    <td className="px-3 h-[30px] text-left">{item.qty}</td>
                    <td className="px-3 h-[30px] text-left">
                      Rp{formatterNumber(item.gold_price)}
                    </td>
                    <td className="px-3 h-[30px] text-left">
                      Rp{formatterNumber(item.order_detail_total_price)}
                    </td>
                    <td className="px-3 text-center">
                      {item.gold_cert_detail_price == null ? (
                        <a
                          className={`underline h-[90px] w-full cursor-pointer flex justify-center items-center ${
                            detailErrors[index]?.gold_cert_detail_price
                              ? 'text-red-500 border border-red-500 rounded-md border-dashed'
                              : 'text-primary'
                          }`}
                          onClick={() => {
                            setSelectGoldId(item.gold);
                            setSelectedIndex(index);
                            setIsModalSertifikat(true);
                          }}
                        >
                          Pilih Nomor Seri
                        </a>
                      ) : (
                        <a
                          className={`underline h-[90px] w-full cursor-pointer flex justify-center items-center text-primary'
                          }`}
                          onClick={() => {
                            setSelectGoldId(item.gold);
                            setSelectedIndex(index);
                            setIsModalSertifikat(true);
                          }}
                        >
                          {item.gold_cert_detail}
                        </a>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center flex flex-col">
                      <div className="w-full flex flex-col items-center">
                        <div className="w-[90px] h-[90px]">
                          <UploadMiniForm
                            index={(index + 1) * 2 + 1} // pre-packing
                            withFile={false}
                            label=""
                            isOptional={true}
                            initFile={item.pre_packing_file}
                            initUrl={''}
                            isError={
                              detailErrors[index]?.pre_packing_photo_url
                                ? true
                                : false
                            }
                            onChange={(val) =>
                              onChangeDetail('pre_packing_file', index, val)
                            }
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center ">
                      <div className="w-full flex flex-col items-center">
                        <div className="w-[90px] h-[90px]">
                          <UploadMiniForm
                            index={(index + 2) * 2 + 2} // post-packing
                            withFile={false}
                            label=""
                            isOptional={true}
                            initFile={item.post_packing_file}
                            initUrl={''}
                            isError={
                              detailErrors[index]?.post_packing_photo_url
                                ? true
                                : false
                            }
                            onChange={(val) =>
                              onChangeDetail('post_packing_file', index, val)
                            }
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ModalSertifikat
            isModalOpen={isModalSertifikat}
            setIsModalOpen={setIsModalSertifikat}
            goldId={selectGoldId.toString()}
            onSelect={(id: string, value: string) => {
              onChangeDetail('gold_cert_detail_price', selectedIndex, id);
              onChangeDetail('gold_cert_detail', selectedIndex, value);
              setIsModalSertifikat(false);
            }}
          />
          <ModalLoading
            isModalOpen={isModalLoading}
            textInfo="Harap tunggu, data sedang diproses"
          />
        </>
      )}
    </div>
  );
};

export default ComEmasFisikDeliveryPage;
