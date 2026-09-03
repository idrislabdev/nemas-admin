'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldPromo, IUser } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';

import { Pagination, Table, notification } from 'antd';
import { ColumnsType } from 'antd/es/table';

import React, { useCallback, useEffect, useState } from 'react';
import debounce from 'debounce';
import Link from 'next/link';

import {
  Edit05,
  FileDownload02,
  Plus,
  SearchSm,
  Trash01,
} from '@untitled-ui/icons-react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

const GoldPromoPageTable = () => {
  const url = `/core/gold/gold_promo/`;

  const [dataTable, setDataTable] = useState<Array<IGoldPromo>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    search: '',
  });

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IGoldPromo> = [
    {
      title: 'No',
      width: 70,
      key: 'no',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Kode Promo',
      dataIndex: 'gold_promo_code',
      key: 'gold_promo_code',
      width: 150,
    },
    {
      title: 'Deskripsi',
      dataIndex: 'gold_promo_description',
      key: 'gold_promo_description',
      width: 200,
    },
    {
      title: 'Tipe Promo',
      dataIndex: 'gold_promo_type',
      key: 'gold_promo_type',
      width: 140,
      render: (value) => value || '-',
    },
    {
      title: 'Tipe Produk',
      dataIndex: 'gold_promo_product_type',
      key: 'gold_promo_product_type',
      width: 150,
      render: (value) => value || '-',
    },
    {
      title: 'Weight Threshold',
      dataIndex: 'gold_promo_weight_threshold',
      key: 'gold_promo_weight_threshold',
      width: 160,
      render: (value) =>
        value !== undefined && value !== null ? `${value} gr` : '-',
    },
    {
      title: 'Weight Amount',
      dataIndex: 'gold_promo_weight_amt',
      key: 'gold_promo_weight_amt',
      width: 150,
      render: (value) => (value !== undefined && value !== null ? value : '-'),
    },
    {
      title: 'Amount PCT',
      dataIndex: 'gold_promo_amt_pct',
      key: 'gold_promo_amt_pct',
      width: 130,
      render: (value) =>
        value !== undefined && value !== null ? `${value}%` : '-',
    },
    {
      title: 'Amount',
      dataIndex: 'gold_promo_amt',
      key: 'gold_promo_amt',
      width: 150,
      render: (value) => (value !== undefined && value !== null ? value : '-'),
    },
    {
      title: 'Minimal Berat',
      dataIndex: 'gold_promo_min_weight',
      key: 'gold_promo_min_weight',
      width: 150,
      render: (value) =>
        value !== undefined && value !== null ? `${value} gr` : '-',
    },
    {
      title: 'Maksimal Berat',
      dataIndex: 'gold_promo_max_weight',
      key: 'gold_promo_max_weight',
      width: 150,
      render: (value) =>
        value !== undefined && value !== null ? `${value} gr` : '-',
    },
    {
      title: 'Minimal Amount',
      dataIndex: 'gold_promo_min_amt',
      key: 'gold_promo_min_amt',
      width: 150,
      render: (value) => (value !== undefined && value !== null ? value : '-'),
    },
    {
      title: 'Maksimal Amount',
      dataIndex: 'gold_promo_max_amt',
      key: 'gold_promo_max_amt',
      width: 150,
      render: (value) => (value !== undefined && value !== null ? value : '-'),
    },
    {
      title: 'Tanggal Mulai',
      dataIndex: 'gold_promo_start_date',
      key: 'gold_promo_start_date',
      width: 150,
      render: (value) => (value ? moment(value).format('DD-MM-YYYY') : '-'),
    },
    {
      title: 'Tanggal Berakhir',
      dataIndex: 'gold_promo_end_date',
      key: 'gold_promo_end_date',
      width: 150,
      render: (value) => (value ? moment(value).format('DD-MM-YYYY') : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'gold_promo_active',
      key: 'gold_promo_active',
      width: 100,
      align: 'center',
      render: (active) => (
        <span
          className={
            active
              ? 'inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700'
              : 'inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600'
          }
        >
          {active ? 'Aktif' : 'Tidak Aktif'}
        </span>
      ),
    },
    {
      title: 'Create By',
      dataIndex: 'create_user_name',
      key: 'create_user_name',
      width: 150,
      render: (value) => value || '-',
    },
    {
      title: 'Create Time',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 170,
      render: (value) =>
        value ? moment(value).format('DD MMM YYYY HH:mm') : '-',
    },
    {
      title: 'Update By',
      dataIndex: 'upd_user_name',
      key: 'upd_user_name',
      width: 150,
      render: (value) => value || '-',
    },
    {
      title: 'Update Time',
      dataIndex: 'upd_time',
      key: 'upd_time',
      width: 170,
      render: (value) =>
        value ? moment(value).format('DD MMM YYYY HH:mm') : '-',
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-[5px]">
          <Link
            href={`/data/informations/gold-promo/${record.gold_promo_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>

          <a
            className="btn-action"
            onClick={() => deleteData(record.gold_promo_id)}
          >
            <Trash01 />
          </a>
        </div>
      ),
    },
  ];

  // ========================
  // Fetch Data
  // ========================
  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, {
      params,
    });

    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams({
      ...params,
      offset: (val - 1) * params.limit,
    });
  };

  const handleFilter = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      search: value,
    });
  };

  // ========================
  // Delete Data
  // ========================
  const deleteData = (id: number | undefined) => {
    if (id) {
      setSelectedId(id);
      setOpenModalConfirm(true);
    }
  };

  const confirmDelete = async () => {
    await axiosInstance.delete(`${url}${selectedId}/`);

    setOpenModalConfirm(false);

    setParams({
      ...params,
      offset: 0,
      limit: 10,
      search: '',
    });

    api.info({
      message: 'Data Gold Promo',
      description: 'Data Gold Promo Berhasil Dihapus',
      placement: 'bottomRight',
    });
  };

  // ========================
  // Export Excel
  // ========================
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const exportParams = {
        ...params,
        offset: 0,
        limit: 100,
      };

      const resp = await axiosInstance.get(url, {
        params: exportParams,
      });

      const rows = resp.data.results;

      const dataToExport = rows.map((item: IGoldPromo, index: number) => ({
        No: index + 1,
        'Kode Promo': item.gold_promo_code || '-',
        Deskripsi: item.gold_promo_description || '-',
        'Tipe Promo': item.gold_promo_type || '-',
        'Tipe Produk': item.gold_promo_product_type || '-',
        'Weight Threshold': item.gold_promo_weight_threshold ?? '-',
        'Weight Amount': item.gold_promo_weight_amt ?? '-',
        'Amount PCT':
          item.gold_promo_amt_pct !== undefined &&
          item.gold_promo_amt_pct !== null
            ? `${item.gold_promo_amt_pct}%`
            : '-',
        Amount: item.gold_promo_amt ?? '-',
        'Minimal Berat': item.gold_promo_min_weight ?? '-',
        'Maksimal Berat': item.gold_promo_max_weight ?? '-',
        'Minimal Amount': item.gold_promo_min_amt ?? '-',
        'Maksimal Amount': item.gold_promo_max_amt ?? '-',
        'Tanggal Mulai': item.gold_promo_start_date
          ? moment(item.gold_promo_start_date).format('DD-MM-YYYY')
          : '-',
        'Tanggal Berakhir': item.gold_promo_end_date
          ? moment(item.gold_promo_end_date).format('DD-MM-YYYY')
          : '-',
        Status: item.gold_promo_active ? 'Aktif' : 'Tidak Aktif',
        'Create By': item.create_user_name || '-',
        'Create Time': item.create_time
          ? moment(item.create_time).format('DD MMM YYYY, HH:mm')
          : '-',
        'Update By': item.upd_user_name || '-',
        'Update Time': item.upd_time
          ? moment(item.upd_time).format('DD MMM YYYY, HH:mm')
          : '-',
      }));

      // Jangan proses kalau tidak ada data
      if (!dataToExport.length) {
        api.warning({
          message: 'Data Gold Promo',
          description: 'Tidak ada data untuk diekspor.',
          placement: 'bottomRight',
        });

        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Gold Promo');

      const header = Object.keys(dataToExport[0]);

      // ======================
      // COLUMN LETTER
      // ======================
      const getColumnLetter = (columnNumber: number) => {
        let dividend = columnNumber;
        let columnName = '';

        while (dividend > 0) {
          const modulo = (dividend - 1) % 26;

          columnName = String.fromCharCode(65 + modulo) + columnName;

          dividend = Math.floor((dividend - modulo) / 26);
        }

        return columnName;
      };

      const lastColumn = getColumnLetter(header.length);

      // ======================
      // JUDUL
      // ======================
      worksheet.mergeCells(`A1:${lastColumn}1`);

      worksheet.getCell('A1').value = 'DATA GOLD PROMO';

      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      worksheet.getCell('A1').font = {
        size: 14,
        bold: true,
      };

      // ======================
      // INFO EXPORT
      // ======================
      worksheet.mergeCells(`A2:${lastColumn}2`);

      worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;

      worksheet.getCell('A2').alignment = {
        horizontal: 'left',
      };

      worksheet.mergeCells(`A3:${lastColumn}3`);

      worksheet.getCell('A3').value = `Tanggal Export : ${moment().format(
        'DD MMM YYYY, HH:mm'
      )}`;

      worksheet.getCell('A3').alignment = {
        horizontal: 'left',
      };

      worksheet.addRow([]);

      // ======================
      // HEADER TABLE
      // ======================
      const headerRow = worksheet.addRow(header);

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
        };

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'FFE5E5E5',
          },
        };
      });

      // ======================
      // DATA ROW
      // ======================
      dataToExport.forEach((row: any) => {
        const rowValues = header.map((key) => row[key as keyof typeof row]);

        const newRow = worksheet.addRow(rowValues);

        newRow.eachCell((cell) => {
          cell.alignment = {
            vertical: 'middle',
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // ======================
      // AUTO WIDTH
      // ======================
      worksheet.columns.forEach((col: any) => {
        if (col !== undefined) {
          let maxLength = 0;

          col.eachCell(
            {
              includeEmpty: true,
            },
            (cell: any) => {
              const val = cell.value ? cell.value.toString() : '';

              if (val.length > maxLength) {
                maxLength = val.length;
              }
            }
          );

          col.width = Math.min(maxLength + 2, 40);
        }
      });

      // ======================
      // DOWNLOAD
      // ======================
      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `data_gold_promo_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);

      api.error({
        message: 'Export Gagal',
        description: 'Data Gold Promo gagal diekspor.',
        placement: 'bottomRight',
      });
    } finally {
      setIsModalLoading(false);
    }
  };

  // ========================
  // Initial Fetch
  // ========================
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {contextHolder}

      <div className="flex items-center justify-between">
        <div className="group-input prepend-append">
          <span className="append">
            <SearchSm />
          </span>

          <input
            type="text"
            className="color-1 base"
            placeholder="cari data"
            onChange={debounce(
              (event) => handleFilter(event.target.value),
              1000
            )}
          />
        </div>

        <div className="flex items-center gap-[4px]">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>

          <Link
            href="/data/informations/gold-promo/form"
            className="btn btn-outline-neutral"
          >
            <Plus />
            Add data
          </Link>
        </div>
      </div>

      <div className="flex flex-col rounded-tr-[8px] rounded-tl-[8px] border border-gray-200">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{
            x: 'max-content',
            y: 550,
          }}
          pagination={false}
          className="table-basic"
          rowKey="gold_promo_id"
        />

        <div className="flex justify-end p-[12px]">
          <Pagination
            onChange={onChangePage}
            pageSize={params.limit}
            total={total}
            showSizeChanger={false}
          />
        </div>
      </div>

      <ModalConfirm
        isModalOpen={openModalConfirm}
        setIsModalOpen={setOpenModalConfirm}
        content="Hapus Data Ini?"
        onConfirm={confirmDelete}
      />

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default GoldPromoPageTable;
