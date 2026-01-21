'use client';

import Modal from 'rsuite/Modal';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { notification } from 'antd';
import { IPenggunaAplikasi, ISellerProps } from '@/@core/@types/interface';

const ModalDataToko = ({
  isModalOpen,
  setIsModalOpen,
  userId,
  userData,
  setRefreshData,
}: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  userId: string;
  userData: IPenggunaAplikasi;
  setRefreshData: Dispatch<SetStateAction<boolean>>;
}) => {
  const [form, setForm] = useState<ISellerProps>({} as ISellerProps);
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const [fileNpwp, setFileNpwp] = useState<File | null>(null);
  const [fileNib, setFileNib] = useState<File | null>(null);
  const [fileContactPerson, setFileContactPerson] = useState<File | null>(null);
  const [photoKtp, setPhotoKtp] = useState<File | null>(null);

  const fileNpwpRef = useRef<HTMLInputElement>(null);
  const fileNibRef = useRef<HTMLInputElement>(null);
  const fileContactPersonRef = useRef<HTMLInputElement>(null);
  const photoKtpRef = useRef<HTMLInputElement>(null);

  const onChange = (key: keyof ISellerProps, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadFile = async (file: File | null): Promise<string> => {
    if (!file) return '';
    const fd = new FormData();
    fd.append('file', file);

    const res = await axiosInstance.post(`/users/user/seller/upload`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data.file_url || res.data;
  };

  const onSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // ===== seller props =====
      formData.append('seller_props.nama_toko', form.nama_toko || '');
      formData.append('seller_props.alamat_toko', form.alamat_toko || '');
      formData.append('seller_props.no_telp_toko', form.no_telp_toko || '');
      formData.append('seller_props.nib', form.nib || '');
      formData.append('seller_props.npwp', form.npwp || '');

      if (fileNib) {
        formData.append('seller_props.file_nib', await uploadFile(fileNib));
      }

      if (fileNpwp) {
        formData.append('seller_props.file_npwp', await uploadFile(fileNpwp));
      }

      if (fileContactPerson) {
        formData.append(
          'seller_props.file_contact_person',
          await uploadFile(fileContactPerson)
        );
      }

      if (photoKtp) {
        formData.append(
          'seller_props.photo_ktp_url',
          await uploadFile(photoKtp)
        );
      }

      // ===== required user fields =====
      formData.append('email', userData.email);
      formData.append('name', userData.name);
      formData.append('phone_number', userData.phone_number);

      await axiosInstance.patch(`/users/admin/${userId}`, formData);

      api.success({
        message: 'Berhasil',
        description: 'Data toko berhasil diperbarui',
        placement: 'bottomRight',
      });

      setRefreshData(true);
      setIsModalOpen(false);
    } catch {
      api.error({
        message: 'Gagal',
        description: 'Gagal memperbarui data toko',
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      setForm(userData.seller_props || {});
      setFileNib(null);
      setFileNpwp(null);
      setFileContactPerson(null);
      setPhotoKtp(null);

      if (fileNibRef.current) fileNibRef.current.value = '';
      if (fileNpwpRef.current) fileNpwpRef.current.value = '';
      if (fileContactPersonRef.current) fileContactPersonRef.current.value = '';
      if (photoKtpRef.current) photoKtpRef.current.value = '';
    }
  }, [isModalOpen]);

  return (
    <>
      {contextHolder}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} size="sm">
        <Modal.Header>
          <Modal.Title>Update Data Toko</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="flex flex-col gap-3 w-full">
            <div className="w-full flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label>Nama Toko</label>
                <input
                  className="base"
                  value={form.nama_toko || ''}
                  onChange={(e) => onChange('nama_toko', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>Alamat Toko</label>
                <textarea
                  className="base"
                  value={form.alamat_toko || ''}
                  onChange={(e) => onChange('alamat_toko', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label>No. Telepon Toko</label>
                <input
                  className="base"
                  value={form.no_telp_toko || ''}
                  onChange={(e) => onChange('no_telp_toko', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <div className="flex flex-col gap-2 w-1/2">
                <div className="flex flex-col gap-1 w-full">
                  <label>NIB</label>
                  <input
                    className="base"
                    value={form.nib || ''}
                    onChange={(e) => onChange('nib', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label>File NIB</label>
                  <input
                    ref={fileNibRef}
                    type="file"
                    className="base w-full"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => setFileNib(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <div className="flex flex-col gap-1 w-full">
                  <label>NPWP</label>
                  <input
                    className="base"
                    value={form.npwp || ''}
                    onChange={(e) => onChange('npwp', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label>File NPWP</label>
                  <input
                    ref={fileNpwpRef}
                    type="file"
                    className="base w-full"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => setFileNpwp(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-col gap-1">
                <label>File Contact Person</label>
                <input
                  ref={fileContactPersonRef}
                  type="file"
                  className="base"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) =>
                    setFileContactPerson(e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>Foto KTP</label>
                <input
                  ref={photoKtpRef}
                  type="file"
                  className="base"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => setPhotoKtp(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </button>
            <button className="btn btn-primary" onClick={onSave}>
              Simpan
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      <ModalLoading isModalOpen={loading} textInfo="Menyimpan data toko..." />
    </>
  );
};

export default ModalDataToko;
