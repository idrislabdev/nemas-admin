'use client';

import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Modal } from 'antd';
import axiosInstance from '@/@core/utils/axios';
import { PrinterFilled } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/id';
import Image from 'next/image';
import { X } from '@untitled-ui/icons-react';
import { IReturnGold } from '@/@core/@types/interface';

moment.locale('id');

/* =========================
   PRINT SAFE SECTION HEADER
========================= */
const PrintSection = ({ title }: { title: string }) => (
  <svg
    width="100%"
    height="34"
    viewBox="0 0 1000 34"
    preserveAspectRatio="none"
    style={{
      display: 'block',
      marginTop: '22px',
    }}
  >
    {/* Background */}
    <rect x="0" y="0" width="1000" height="34" fill="#e5e7eb" />

    {/* Left accent */}
    <rect x="0" y="0" width="6" height="34" fill="#4b5563" />

    {/* Text */}
    <text
      x="16"
      y="22"
      fill="#111827"
      fontSize="14"
      fontWeight="500"
      fontFamily="Arial, Helvetica, sans-serif"
    >
      {title.toUpperCase()}
    </text>
  </svg>
);

const ModalReturnPrint = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  returnId: string;
}) => {
  const { isModalOpen, setIsModalOpen, returnId } = props;
  const [data, setData] = useState<IReturnGold | null>(null);

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(
      `/orders/fix/order/return/${returnId}`
    );
    setData(resp.data);
  }, [returnId]);

  const handlePrint = () => {
    setTimeout(() => window.print(), 50);
  };

  useEffect(() => {
    if (isModalOpen) fetchData();
  }, [fetchData, isModalOpen]);

  if (!data) return null;

  return (
    <Modal
      open={isModalOpen}
      footer={null}
      centered
      width={900}
      className="modal-full"
      onCancel={() => setIsModalOpen(false)}
      closeIcon={null}
    >
      {/* ACTION BUTTON */}
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <a
          onClick={handlePrint}
          className="btn btn-primary cursor-pointer h-[28px] rounded"
        >
          <span className="my-icon icon-sm">
            <PrinterFilled />
          </span>
          Cetak
        </a>
        <a
          onClick={() => setIsModalOpen(false)}
          className="btn btn-outline-neutral cursor-pointer h-[28px] rounded"
        >
          <span className="my-icon icon-sm">
            <X />
          </span>
          Tutup
        </a>
      </div>

      {/* CONTENT */}
      <div className="text-[13px] font-[Arial]">
        {/* HEADER */}
        <div className="text-center mb-4">
          <div className="text-xl font-bold">PT NEMAS</div>
          <div className="text-sm font-semibold">BUKTI RETUR EMAS</div>
          <div className="text-xs">
            Jl. .................................................... Telp:
            ..........................................
          </div>
        </div>

        {/* INFORMASI UTAMA */}
        <table className="w-full mb-3">
          <tbody>
            <tr>
              <td className="w-[180px]">Nomor Retur</td>
              <td>: {data.return_number}</td>
            </tr>
            <tr>
              <td>Customer / Toko</td>
              <td>: {data.order_user_name}</td>
            </tr>
            <tr>
              <td>Tanggal Retur</td>
              <td>: {moment(data.return_date).format('DD MMMM YYYY')}</td>
            </tr>
            <tr>
              <td>Invoice No</td>
              <td>: {data.order_number}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td>: {data.return_status}</td>
            </tr>
            <tr>
              <td>Jenis Retur</td>
              <td>
                : {data.return_type === 'BY_GOLD' ? 'Retur Emas' : 'Retur Dana'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* DETAIL EMAS */}
        <PrintSection title="DETAIL EMAS" />
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-[180px]">Kode Sertifikat</td>
              <td>: {data.gold_cert_code}</td>
            </tr>
            <tr>
              <td>Berat Emas</td>
              <td>: {data.gold_cert_weight} gr</td>
            </tr>
          </tbody>
        </table>

        {/* PENGEMBALIAN */}
        <PrintSection title="PENGEMBALIAN" />
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-[180px]">No Transfer</td>
              <td>: {data.gold_transfer_number}</td>
            </tr>
            <tr>
              <td>Tgl Transfer</td>
              <td>
                : {moment(data.return_approved_date).format('DD MMMM YYYY')}
              </td>
            </tr>
            <tr>
              <td>Berat Transfer</td>
              <td>: {data.gold_transfer_weight} gr</td>
            </tr>
            <tr>
              <td>Nilai Uang</td>
              <td>: Rp {data.gold_transfer_amount.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        {/* ALASAN & CATATAN */}
        <PrintSection title="ALASAN & CATATAN" />
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-[180px]">Alasan Retur</td>
              <td>: {data.return_reason}</td>
            </tr>
            <tr>
              <td>Catatan</td>
              <td>: {data.return_notes || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* PERSETUJUAN */}
        <PrintSection title="PERSETUJUAN" />
        <div className="grid grid-cols-3 gap-6 mt-4 text-center text-sm">
          {['Customer', 'Petugas', 'Supervisor'].map((label) => (
            <div key={label}>
              <div className="h-[80px] border border-dashed border-gray-400 mb-1" />
              <div>Tanda Tangan {label}</div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs mt-10">
          Tanggal Cetak: {moment(data.create_time).format('DD MMM YYYY HH:mm')}
          <br />
          Dokumen ini sah tanpa tanda tangan basah.
          <br />
          Terima kasih telah menggunakan layanan NEMAS.
        </div>

        {/* FOTO */}
        <PrintSection title="LAMPIRAN FOTO BARANG RETUR" />
        <div className="grid grid-cols-3 gap-4 mt-3">
          {[data.return_image_1, data.return_image_2, data.return_image_3].map(
            (img, i) => (
              <div
                key={i}
                className="h-[180px] border flex items-center justify-center text-gray-400 text-sm"
              >
                {img ? (
                  <Image
                    src={img}
                    alt={`Foto ${i + 1}`}
                    width={0}
                    height={0}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  `Foto ${i + 1}`
                )}
              </div>
            )
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalReturnPrint;
