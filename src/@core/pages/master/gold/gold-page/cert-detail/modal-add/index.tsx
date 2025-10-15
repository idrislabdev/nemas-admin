import Modal from 'rsuite/Modal';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IGoldCertPriceDetail } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';

const ModalAddCertificate = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  goldId: string;
  goldWeight: string;
  certificateId: string;
  paramsId: string;
  onConfirm: () => void;
}) => {
  const {
    isModalOpen,
    setIsModalOpen,
    goldId,
    goldWeight,
    certificateId,
    paramsId,
    onConfirm,
  } = props;
  const url = `/core/gold/cert_price_detail`;
  const [required, setRequired] = useState<IGoldCertPriceDetail>(
    {} as IGoldCertPriceDetail
  );
  const [goldCertCode, setGoldCertCode] = useState('');
  const [includeStock, setIncludeStock] = useState(true);
  // const [goldWeight, setGoldWeight] = useState('');

  const onSave = async () => {
    // const user = JSON.parse(localStorage.getItem("user") || "{}")
    const body = {
      gold: goldId,
      gold_cert: certificateId,
      gold_cert_code: goldCertCode,
      gold_weight: parseInt(
        goldWeight.toString().replace('.', '').replace(',', '.')
      ),
      include_stock: includeStock,
      // "create_user": user.id
    };
    setRequired({});
    try {
      if (paramsId == '') {
        await axiosInstance.post(`${url}/create`, body);
        clearForm();
      } else {
        await axiosInstance.patch(`${url}/${paramsId}/`, body);
      }
      clearForm();
      setIsModalOpen(false);
      onConfirm();
    } catch (error) {
      const err = error as AxiosError;
      if (err.response && err.response.data) {
        const data: IGoldCertPriceDetail = err.response.data;
        setRequired(data);
      }
    }
  };

  const fetchData = async () => {
    const resp = await axiosInstance.get(`${url}/${paramsId}/`);
    const { data } = resp;
    setGoldCertCode(data.gold_cert_code);
    setIncludeStock(data.include_stock);
  };

  useEffect(() => {
    if (paramsId != '') fetchData();
  }, [paramsId]);

  const clearForm = () => {
    setGoldCertCode('');
    // setGoldWeight('');
    setIncludeStock(true);
    // setCertCode("");
    // setGoldWeight("");
    // setCertPrice("");
  };

  return (
    <>
      <Modal
        size="xs"
        dialogClassName="my-modal"
        backdropClassName="my-modal-backdrop"
        backdrop="static"
        keyboard={false}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <Modal.Header>
          <Modal.Title>Tambah Data Sertifikat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-[12px]">
            <div className="flex flex-col gap-[4px]">
              <label>
                Kode Sertifikat{' '}
                {required.gold_cert_code && (
                  <span className="text-red-500 text-[10px]/[14px] italic">
                    ({required.gold_cert_code?.toString()})
                  </span>
                )}
              </label>
              <input
                value={goldCertCode}
                onChange={(e) => setGoldCertCode(e.target.value)}
                className={`base ${required.gold_cert_code ? 'error' : ''}`}
              />
            </div>
            <div className="flex flex-col gap-[4px]">
              <label>
                Satuan (gr){' '}
                {required.gold_weight && (
                  <span className="text-red-500 text-[10px]/[14px] italic">
                    ({required.gold_weight?.toString()})
                  </span>
                )}
              </label>
              <div className="group-input prepend">
                <span className="prepend !top-[5px]">gr</span>
                <input
                  value={goldWeight}
                  disabled
                  className={`base ${required.gold_weight ? 'error' : ''}`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-[4px]">
              <label>
                Include Stock{' '}
                {required.include_stock && (
                  <span className="text-red-500 text-[10px]/[14px] italic">
                    ({required.include_stock?.toString()})
                  </span>
                )}
              </label>
              <select
                defaultValue={includeStock ? 'Ya' : 'Tidak'}
                onChange={(e) =>
                  setIncludeStock(e.target.value == 'Ya' ? true : false)
                }
              >
                <option value={`Ya`}>Ya</option>
                <option value={`Tidak`}>Tidak</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={() => onSave()}>
              Simpan
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalAddCertificate;
