'use client';

import { IOrderGold, IOrderGoldDetail } from '@/@core/@types/interface';
import { UndoOutlineIcon } from '@/@core/my-icons';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import {
  CalendarCheck01,
  ClipboardCheck,
  FlipBackward,
  Truck01,
} from '@untitled-ui/icons-react';
import Image from 'next/image';
import ModalPhoto from '@/@core/components/modal/modal-photo';
import ModalDO from '@/@core/pages/transaksi/emas-fisik/modal-do';
import ModalReturn from '@/@core/components/modal/modal-return';
import { useRouter } from 'next/navigation';

const ComEmasFisikDetailPage = (props: {
  parentUrl: string;
  paramsId: string;
}) => {
  const { parentUrl, paramsId } = props;
  const router = useRouter();

  const [data, setData] = useState<IOrderGold>({} as IOrderGold);
  const [selectedItem, setSelectedItem] = useState<IOrderGoldDetail>(
    {} as IOrderGoldDetail
  );
  const [openModalPhoto, setOpenModalPhoto] = useState(false);
  const [openModalDO, setOpenModalDO] = useState(false);
  const [openModalReturn, setOpenModalReturn] = useState(false);
  const [urlPhoto, setUrlPhoto] = useState('');
  const [goldCertDetailPrice, setGoldCertDetailPrice] = useState('');
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(
      `/reports/gold-sales-order/${paramsId}`
    );

    const respDetail = await axiosInstance.get(
      `/reports/gold-sales-order/${paramsId}/detail`
    );
    let temp: IOrderGold = {} as IOrderGold;
    temp = resp.data;
    temp.order_gold_details = respDetail.data.order_gold_details;

    setData(temp);
  }, [paramsId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-[10px]">
      <hr />
      <div className="flex gap-[4px] items-center justify-end">
        <div className="flex items-center gap-[4px]">
          {data.is_picked_up && (
            <a
              className="btn btn-success cursor-pointer w-full h-[28px] rounded"
              onClick={() => setOpenModalDO(true)}
            >
              <span className="my-icon icon-sm">
                <ClipboardCheck />
              </span>
              Surat Jalan
            </a>
          )}
          {!data.is_picked_up && data.order_gold_payment_status == 'PAID' && (
            <Link
              href={`${parentUrl}/${paramsId}/delivery`}
              className="btn btn-primary text-white text-[11px] flex-row gap-[4px] w-full h-[28px] rounded"
            >
              <span className="my-icon icon-sm">
                <CalendarCheck01 />
              </span>
              Proses
            </Link>
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
                    Foto Evidence
                  </div>
                  <div className="flex items-center gap-[10px] px-4 h-[120px]">
                    <div className="w-[90px] h-[90px]">
                      {data.delivery_transaction.length > 0 &&
                        data.delivery_transaction[0].delivery_file_url !=
                          null && (
                          <a
                            onClick={() => {
                              setUrlPhoto(
                                data.delivery_transaction[0].delivery_file_url
                              );
                              setOpenModalPhoto(true);
                            }}
                            className="cursor-pointer w-full h-full"
                          >
                            <Image
                              src={
                                data.delivery_transaction[0].delivery_file_url
                              }
                              width={0}
                              height={0}
                              alt="image"
                              className="w-full h-full rounded-[12px] border border-gray-100 object-cover"
                              unoptimized={true}
                            />
                          </a>
                        )}
                    </div>
                    <div className="w-[90px] h-[90px]">
                      {data.delivery_transaction.length > 0 &&
                        data.delivery_transaction[0].additional_file_url !=
                          null && (
                          <a
                            onClick={() => {
                              setUrlPhoto(
                                data.delivery_transaction[0].additional_file_url
                              );
                              setOpenModalPhoto(true);
                            }}
                            className="cursor-pointer w-full h-full"
                          >
                            <Image
                              src={
                                data.delivery_transaction[0].additional_file_url
                              }
                              width={0}
                              height={0}
                              alt="image"
                              className="w-full h-full rounded-[12px] border border-gray-100 object-cover"
                              unoptimized={true}
                            />
                          </a>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border border-t-0 rounded-br-md rounded-bl-md  overflow-hidden h-[90px] flex p-[10px]">
              <label>Note Pengiriman: </label>
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
                  <th className="px-3 h-[30px] text-center">Return</th>
                </tr>
              </thead>
              <tbody>
                {data.order_gold_details.map((item, index: number) => (
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
                      <span>
                        {item.delivery_details
                          ? item.delivery_details.gold_cert_code
                          : ''}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center flex flex-col">
                      <div className="w-full flex flex-col items-center">
                        <div className="w-[90px] h-[90px]">
                          {item.delivery_details &&
                            item.delivery_details.pre_packing_photo_url &&
                            item.delivery_details.pre_packing_photo_url !=
                              null && (
                              <a
                                onClick={() => {
                                  setUrlPhoto(
                                    item.delivery_details.pre_packing_photo_url
                                  );
                                  setOpenModalPhoto(true);
                                }}
                                className="cursor-pointer w-full h-full"
                              >
                                <Image
                                  src={
                                    item.delivery_details.pre_packing_photo_url
                                  }
                                  width={0}
                                  height={0}
                                  alt="image"
                                  className="w-full h-full rounded-[12px] border border-gray-100 object-cover"
                                  unoptimized={true}
                                />
                              </a>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center ">
                      <div className="w-full flex flex-col items-center">
                        <div className="w-[90px] h-[90px]">
                          {item.delivery_details &&
                            item.delivery_details.post_packing_photo_url &&
                            item.delivery_details.post_packing_photo_url !=
                              null && (
                              <a
                                onClick={() => {
                                  setUrlPhoto(
                                    item.delivery_details.post_packing_photo_url
                                  );
                                  setOpenModalPhoto(true);
                                }}
                                className="cursor-pointer w-full h-full"
                              >
                                <Image
                                  src={
                                    item.delivery_details.post_packing_photo_url
                                  }
                                  width={0}
                                  height={0}
                                  alt="image"
                                  className="w-full h-full rounded-[12px] border border-gray-100 object-cover"
                                  unoptimized={true}
                                />
                              </a>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center ">
                      {data.is_picked_up && !item.is_returned && (
                        <a
                          className="flex flex-row items-center gap-2 btn bg-red-500 text-white cursor-pointer"
                          onClick={() => {
                            setSelectedItem(item);
                            setGoldCertDetailPrice(
                              item.delivery_details.gold_cert_detail_price
                            );
                            setOpenModalReturn(true);
                          }}
                        >
                          <span className="my-icon icon-sm">
                            <FlipBackward />
                          </span>
                          Return
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <ModalPhoto
        isModalOpen={openModalPhoto}
        setIsModalOpen={setOpenModalPhoto}
        url={urlPhoto}
      />
      <ModalDO
        isModalOpen={openModalDO}
        setIsModalOpen={setOpenModalDO}
        orderId={paramsId}
      />
      <ModalReturn
        isModalOpen={openModalReturn}
        setIsModalOpen={setOpenModalReturn}
        orderGoldId={paramsId}
        goldCertDetailPrice={goldCertDetailPrice}
        orderNumber={data.order_number}
        item={selectedItem}
        setRefresData={() => router.replace('/transaksi/return')}
      />
    </div>
  );
};

export default ComEmasFisikDetailPage;
