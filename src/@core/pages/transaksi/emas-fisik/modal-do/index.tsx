import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import axiosInstance from '@/@core/utils/axios';
import { IOrderGold } from '@/@core/@types/interface';
import { Modal } from 'antd';
import { PrinterFilled } from '@ant-design/icons';
import Image from 'next/image';
import { X } from '@untitled-ui/icons-react';
import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

const ModalDO = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  orderId: string;
}) => {
  const { isModalOpen, setIsModalOpen, orderId } = props;
  const [data, setData] = useState<IOrderGold>({} as IOrderGold);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalQty, setTotalQty] = useState(0);

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(
      `/reports/gold-sales-order/${orderId}`
    );

    const temp: IOrderGold = resp.data;

    const tempWeight = temp.order_gold_details.reduce(
      (sum, i) => sum + (i.weight || 0),
      0
    );
    const tempQty = temp.order_gold_details.reduce(
      (sum, i) => sum + (i.qty || 0),
      0
    );
    setData(resp.data);
    setTotalQty(tempQty);
    setTotalWeight(tempWeight);
  }, [orderId]);

  useEffect(() => {
    if (isModalOpen) fetchData();
  }, [fetchData, isModalOpen]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <>
      <Modal
        title={''}
        className="modal-full"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        closeIcon={null}
      >
        {data && data.user && (
          <>
            <div className="flex items-center justify-end print:hidden gap-[10px]">
              <a
                onClick={() => window.print()}
                className="btn btn-primary cursor-pointer h-[28px] rounded"
              >
                {' '}
                <span className="my-icon icon-sm">
                  <PrinterFilled />
                </span>
                Cetak
              </a>
              <a
                onClick={() => setIsModalOpen(false)}
                className="btn btn-outline-neutral cursor-pointer h-[28px] rounded"
              >
                {' '}
                <span className="my-icon icon-sm">
                  <X />
                </span>
                Tutup
              </a>
            </div>
            <div className="flex gap-[12px] mb-[30px]">
              <Image
                src="/images/main/sjl-logo.png"
                alt="logo nemas"
                width={0}
                height={0}
                sizes="100%"
                className="w-[72px] h-[72px] object-cover"
              />
              <div className="flex flex-col">
                <p className="text-xl font-medium">PT. NEMAS</p>
                <span>Jl. Margomulyo Industri Blok A-12, Surabaya 60183</span>
                <span>Telp. (031) 765 8890 | Email: cs@NEMAS.co.id</span>
              </div>
            </div>
            <div className="flex flex-col gap-[20px]">
              <div className="flex flex-col gap-[8px]">
                <h5 className="text-center text-xl font-medium">
                  Surat Jalan Pengiriman Emas
                </h5>
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center">
                    <label className="w-[120px] font-medium">No. Dokumen</label>
                    <p>
                      :{' '}
                      {data.delivery_transaction &&
                        data.delivery_transaction[0].delivery_number}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="w-[120px] font-medium">Tanggal</label>
                    <p>
                      :{' '}
                      {data.delivery_transaction && data.delivery_transaction[0]
                        ? moment(
                            data.delivery_transaction[0]
                              .delivery_pickup_confirm_datetime
                          ).format('DD MMM YYYY, HH:mm')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
              <table className="w-full border border-gray-300 mb-3 ">
                <tbody>
                  <tr className="h-[30px]">
                    <th className="bg-gray-100 text-left px-2 py-1 border text-[11px] w-[30%]">
                      Nama Penerima, (No. Telepon)
                    </th>
                    <td className="px-2 py-1 border text-[11px]">
                      {data.user.name} ({data.user.phone_number})
                    </td>
                  </tr>
                  <tr className="h-[30px]">
                    <th className="bg-gray-100 text-left px-2 py-1 border text-[11px] w-[30%]">
                      Alamat Tujuan
                    </th>
                    <td className="px-2 py-1 border text-[11px]">
                      {data.order_user_address.address},{' '}
                      {data.order_user_address.city},{' '}
                      {data.order_user_address.province},{' '}
                      {data.order_user_address.postal_code}
                    </td>
                  </tr>
                  <tr className="h-[30px]">
                    <th className="bg-gray-100 text-left px-2 py-1 border text-[11px] w-[30%]">
                      Nomor Order / Invoice
                    </th>
                    <td className="px-2 py-1 border text-[11px]">
                      {data.order_number}
                    </td>
                  </tr>
                  <tr className="h-[30px]">
                    <th className="bg-gray-100 text-left px-2 py-1 border text-[11px] w-[30%]">
                      Ekspedisi, (No. Resi)
                    </th>
                    <td className="px-2 py-1 border text-[11px]">
                      {data.tracking_courier_name} ({' '}
                      {data.tracking_number ?? '-'})
                    </td>
                  </tr>
                  <tr className="h-[30px]">
                    <th className="bg-gray-100 text-left px-2 py-1 border text-[11px] w-[30%]">
                      Metode Pengiriman
                    </th>
                    <td className="px-2 py-1 border text-[11px]">
                      {data.tracking_courier_service_name}
                    </td>
                  </tr>
                  <tr className="h-[30px]">
                    <th className="bg-gray-100 text-left px-2 py-1 border text-[11px] w-[30%]">
                      Asuransi
                    </th>
                    <td className="px-2 py-1 border text-[11px]">
                      Ya – Full Value Protection
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ITEM LIST */}
              <div className="flex flex-col gap-[8px]">
                <h5 className="font-semibold">Rincian Barang Dikirim</h5>
                <div className="flex flex-col">
                  <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr className="h-[30px]">
                        <th className="border p-1 text-[11px] w-10">No</th>
                        <th className="border p-1 text-[11px]">Nama Produk</th>
                        <th className="border p-1 text-[11px]  text-center w-[50px]">
                          Kadar
                        </th>
                        <th className="border p-1 text-[11px]  text-center w-[70px]">
                          Berat (gr)
                        </th>
                        <th className="border p-1 text-[11px] text-center w-[50px]">
                          Qty
                        </th>
                        <th className="border p-1 text-[11px] w-[20%]">
                          No Seri
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.order_gold_details.map((item, index: number) => (
                        <tr
                          className="h-[30px]"
                          key={item.order_gold_detail_id}
                        >
                          <td className="border p-1 text-[11px] text-center">
                            {index + 1}
                          </td>
                          <td className="border p-1 text-[11px]">{`Emas Batangan ${item.gold_brand} (${item.cert_brand})`}</td>
                          <td className="border p-1 text-[11px]  text-center">
                            99.99%
                          </td>
                          <td className="border p-1 text-[11px] text-center">
                            {item.weight}gr
                          </td>
                          <td className="border p-1 text-[11px]  text-center">
                            {item.qty}
                          </td>
                          <td className="border p-1 text-[11px] w-[20%]">
                            {item.delivery_details?.gold_cert_code}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold h-[30px]">
                        <td
                          colSpan={3}
                          className="text-right border p-1 text-[11px]"
                        >
                          Total
                        </td>
                        <td className="border p-1 text-[11px] text-center">
                          {totalWeight} gr
                        </td>
                        <td className="border p-1 text-[11px] text-center">
                          {totalQty}
                        </td>
                        <td className="border p-1 text-[11px]"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* NOTES */}
                <div className="text-xs leading-5 whitespace-pre-line">
                  - Barang telah diverifikasi oleh bagian QC dan disegel dengan
                  segel keamanan NEMAS.
                  {'\n'}- Mohon pastikan segel dalam kondisi utuh saat diterima.
                  {'\n'}- Setiap kerusakan atau kehilangan wajib disertai berita
                  acara dari pihak {data.tracking_courier_name} dalam waktu 1x24
                  jam.
                  {'\n'}- Barang dikirim dalam kondisi terasuransi penuh sesuai
                  nilai invoice.
                </div>
              </div>

              {/* SIGNATURES */}
              <div className="grid grid-cols-4 gap-[40px] text-center mt-10 text-sm">
                <div>
                  <div>Dibuat Oleh</div>
                  <div className="border-t border-black mt-[80px] pt-1">
                    Admin
                  </div>
                </div>
                <div>
                  <div>Mengetahui</div>
                  <div className="border-t border-black mt-[80px] pt-1">
                    Kepala Operasional
                  </div>
                </div>
                <div>
                  <div>PIC Kurir</div>
                  <div className="border-t border-black mt-[80px] pt-1">
                    {data.tracking_courier_name ?? '-'}
                  </div>
                </div>
                <div>
                  <div>Diterima Oleh</div>
                  <div className="border-t border-black mt-[80px] pt-1">
                    {moment().format('DD MMM YYYY, HH:mm')}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ModalDO;
