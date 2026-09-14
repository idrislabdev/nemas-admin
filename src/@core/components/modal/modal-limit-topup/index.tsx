'use client';

import { InputNumber, Modal } from 'antd';
import React, { useEffect, useState } from 'react';

interface ModalLimitTopupProps {
  open: boolean;
  defaultValue?: number | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (value: number) => void | Promise<void>;
}

const ModalLimitTopup = ({
  open,
  defaultValue = null,
  loading = false,
  onCancel,
  onSubmit,
}: ModalLimitTopupProps) => {
  const [topupLimit, setTopupLimit] = useState<number | null>(defaultValue);

  useEffect(() => {
    if (open) {
      setTopupLimit(defaultValue ?? null);
    }
  }, [open, defaultValue]);

  const handleSubmit = async () => {
    if (topupLimit === null || topupLimit < 0) {
      return;
    }

    await onSubmit(topupLimit);
  };

  const handleClose = () => {
    if (loading) return;

    onCancel();
  };

  return (
    <Modal
      title="Edit Limit Top Up"
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      okText="Simpan"
      cancelText="Batal"
      confirmLoading={loading}
      destroyOnClose
    >
      <div className="flex flex-col gap-[8px] py-[12px]">
        <label className="text-sm font-medium">Limit Top Up</label>

        <InputNumber
          className="w-full"
          size="large"
          min={0}
          precision={0}
          placeholder="Masukkan limit top up"
          value={topupLimit}
          onChange={(value) => {
            setTopupLimit(value);
          }}
          formatter={(value) =>
            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
          }
          parser={(value) => (value ? Number(value.replace(/\./g, '')) : 0)}
        />
      </div>
    </Modal>
  );
};

export default ModalLimitTopup;
