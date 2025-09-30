'use client';

import { IOrderGold } from '@/@core/@types/interface';
import { UndoOutlineIcon } from '@/@core/my-icons';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';
// import { notification } from 'antd';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import ModalProsesPengiriman from '../modal-proses';
import { CheckCircle, Truck01 } from '@untitled-ui/icons-react';

const ComEmasFisikDetailPage = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const [data, setData] = useState<IOrderGold>({} as IOrderGold);
  //   const [api, contextHolder] = notification.useNotification();
  const [isModalPengiriman, setIsModalPengiriman] = useState(false);
  const [refreshData, setRefresData] = useState(false);
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(
      `/reports/gold-sales-order/${paramsId}`
    );
    setData(resp.data);
  }, [setData, paramsId]);

  useEffect(() => {
    if (refreshData) {
      fetchData();
    }
  }, [refreshData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-[10px]">
      {/* {contextHolder} */}
      <hr />
      <div className="flex gap-[4px] items-center justify-end">
        <div className="flex items-center gap-[4px]">
          {!data.is_picked_up && (
            <a
              className="btn btn-primary cursor-pointer w-full h-[28px] rounded"
              onClick={() => setIsModalPengiriman(true)}
            >
              <span className="my-icon icon-sm">
                <Truck01 />
              </span>
              Proses Pesanan
            </a>
          )}
          <Link
            href={`/transaksi/emas-fisik`}
            className="btn btn-outline-neutral"
          >
            <UndoOutlineIcon /> Kembali
          </Link>
        </div>
      </div>
      {data.user && data.user.name && (
        <>
          <div className="flex">
            {/* Kiri */}
            <div className="flex-1">
              {/* Data Transaksi */}
              <div className="border border-r-0 border-b-0 rounded-tl-md overflow-hidden">
                <div className="bg-gray-100 px-4 h-[30px] font-semibold">
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
                    <span className="w-40 text-gray-500">Status</span>
                    <span className="font-medium">: {data.order_status}</span>
                  </div>
                  <div className="flex px-4 h-[30px] items-center">
                    <span className="w-40 text-gray-500">
                      Status Pengiriman
                    </span>
                    <span className="font-medium">
                      :
                      {data.is_picked_up && (
                        <span className="bg-green-600 text-white text-[11px] rounded-md flex gap-[4px] items-center justify-center w-[70px] h-[20px]">
                          <span className="my-icon icon-xs">
                            <CheckCircle />
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
              <div className="border border-r-0 rounded-bl-md overflow-hidden">
                <div className="bg-gray-100 px-4 h-[30px] font-semibold">
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
                        ? formatterNumber(data.order_shipping[0].delivery_price)
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
                <div className="bg-gray-100 px-4 h-[30px] font-semibold">
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
              <div className="border rounded-br-md overflow-hidden">
                <div className="bg-gray-100 px-4 h-[30px] font-semibold">
                  Data Alamat
                </div>
                <div className="divide-y text-sm">
                  <div className="px-4 h-[60px] text-sm">
                    {data.order_user_address.address},{' '}
                    {data.order_user_address.city},{' '}
                    {data.order_user_address.province},{' '}
                    {data.order_user_address.postal_code}
                  </div>
                  <div className="flex border-b px-4 h-[30px]"></div>
                  <div className="flex border-b px-4 h-[30px]"></div>
                  <div className="flex border-b px-4 h-[30px]"></div>
                  <div className="flex border-b px-4 h-[30px]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Emas full width di bawah */}
          <div className="mt-3 border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-4 h-[30px] font-semibold">
              Data Emas
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 h-[30px] text-left">Brand</th>
                  <th className="px-3 h-[30px] text-left">Tipe</th>
                  <th className="px-3 h-[30px] text-left">Cert Code</th>
                  <th className="px-3 h-[30px] text-left">Berat (gr)</th>
                  <th className="px-3 h-[30px] text-left">Qty</th>
                  <th className="px-3 h-[30px] text-left">Harga</th>
                  <th className="px-3 h-[30px] text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.order_gold_details.map((item) => (
                  <tr key={item.order_gold_detail_id} className="border-t">
                    <td className="px-3 h-[30px]">{item.gold_brand}</td>
                    <td className="px-3 h-[30px]">{item.gold_type}</td>
                    <td className="px-3 h-[30px]">{item.cert_code}</td>
                    <td className="px-3 h-[30px] text-left">{item.weight}</td>
                    <td className="px-3 h-[30px] text-left">{item.qty}</td>
                    <td className="px-3 h-[30px] text-left">
                      Rp{formatterNumber(item.gold_price)}
                    </td>
                    <td className="px-3 h-[30px] text-left">
                      Rp{formatterNumber(item.order_detail_total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {data && data.order_gold_id && (
        <ModalProsesPengiriman
          isModalOpen={isModalPengiriman}
          setIsModalOpen={setIsModalPengiriman}
          orderId={data.order_gold_id}
          setRefresData={setRefresData}
        />
      )}
    </div>
  );
};

export default ComEmasFisikDetailPage;
