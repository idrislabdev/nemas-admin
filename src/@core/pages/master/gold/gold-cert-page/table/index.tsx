'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldCertPrice, IUser } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';

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

const GoldCertPageTable = () => {
  const url = `/core/gold/cert/`;

  const [dataTable, setDataTable] = useState<Array<IGoldCertPrice>>([]);
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
  const columns: ColumnsType<IGoldCertPrice> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'cert_id',
      key: 'cert_id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    { title: 'Kode Sertifikat', dataIndex: 'cert_code', key: 'cert_code' },
    { title: 'Nama Brand', dataIndex: 'cert_brand', key: 'cert_brand' },
    {
      title: 'Satuan (gr)',
      dataIndex: 'gold_weight',
      key: 'gold_weight',
      render: (_, record) =>
        `${formatterNumber(record.gold_weight ? record.gold_weight : 0)} gr`,
    },
    {
      title: 'Harga Sertifikat',
      dataIndex: 'cert_price',
      key: 'cert_price',
      render: (_, record) =>
        `Rp${formatterNumber(record.cert_price ? record.cert_price : 0)}`,
    },
    {
      title: 'Create By',
      dataIndex: 'create_user_name',
      key: 'create_user_name',
    },
    {
      title: 'Create Time',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 170,
      render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: 'Update By',
      dataIndex: 'upd_user_name',
      key: 'upd_user_name',
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link
            href={`/master/gold/cert/${record.cert_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>
          <button
            className="btn-action"
            onClick={() => deleteData(record.cert_id)}
          >
            <Trash01 />
          </button>
        </div>
      ),
    },
  ];

  // ========================
  // Fetch Data
  // ========================
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (error) {
      console.log(error);
      api.error({
        message: 'Error',
        description: 'Gagal memuat data sertifikat emas',
        placement: 'bottomRight',
      });
    }
  }, [params, url, api]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
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
    try {
      await axiosInstance.delete(`${url}${selectedId}/`);
      setOpenModalConfirm(false);
      setParams({ ...params, offset: 0, limit: 10 });
      api.success({
        message: 'Data Sertifikat',
        description: 'Data Sertifikat berhasil dihapus',
        placement: 'bottomRight',
      });
    } catch (error) {
      console.log(error);
      api.error({
        message: 'Error',
        description: 'Gagal menghapus data sertifikat',
        placement: 'bottomRight',
      });
    }
  };

  // ========================
  // Export Excel
  // ========================
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const exportParams = {
        format: 'json',
        offset: 0,
        limit: total || 1000,
        search: '',
        cert_brand__icontains: '',
      };

      const resp = await axiosInstance.get(url, { params: exportParams });
      const rows: IGoldCertPrice[] = resp.data?.results || [];

      if (!rows.length) {
        api.warning({
          message: 'Data Kosong',
          description: 'Tidak ada data untuk di-export',
          placement: 'bottomRight',
        });
        return;
      }

      const dataToExport = rows.map((item: IGoldCertPrice, index: number) => ({
        No: index + 1,
        'Kode Sertifikat': item.cert_code || '-',
        'Nama Sertifikat': item.cert_brand || '-',
        'Satuan (gr)': item.gold_weight
          ? `${formatterNumber(item.gold_weight)} gr`
          : '0 gr',
        'Harga Sertifikat': item.cert_price ? item.cert_price : 0,
        'Create By': item.create_user_name || '-',
        'Create Time': item.create_time
          ? moment(item.create_time).format('DD MMM YYYY HH:mm')
          : '-',
        'Update By': item.upd_user_name || '-',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Sertifikat');

      const lastColumnLetter = 'H';

      /* ================= TITLE ================= */
      worksheet.mergeCells(`A1:${lastColumnLetter}1`);
      worksheet.getCell('A1').value = 'LAPORAN DATA MASTER SERTIFIKAT';
      worksheet.getCell('A1').font = { size: 14, bold: true };
      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      /* ================= DIBUAT OLEH ================= */
      worksheet.mergeCells(`A2:${lastColumnLetter}2`);
      worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;
      worksheet.getCell('A2').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      /* ================= TANGGAL EXPORT ================= */
      worksheet.mergeCells(`A3:${lastColumnLetter}3`);
      worksheet.getCell('A3').value = `Tanggal Export : ${dayjs().format(
        'DD MMMM YYYY HH:mm'
      )}`;
      worksheet.getCell('A3').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      /* ================= TOTAL DATA ================= */
      worksheet.mergeCells(`A4:${lastColumnLetter}4`);
      worksheet.getCell('A4').value = `Total Data : ${rows.length}`;
      worksheet.getCell('A4').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      /* ================= PERIODE ================= */
      worksheet.mergeCells(`A5:${lastColumnLetter}5`);
      worksheet.getCell('A5').value = 'Periode : Semua Data';
      worksheet.getCell('A5').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      worksheet.addRow([]);

      /* ================= HEADER ================= */
      const headers = Object.keys(dataToExport[0]);
      const headerRow = worksheet.addRow(headers);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
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
          fgColor: { argb: 'FFE5E5E5' },
        };
      });

      /* ================= DATA ================= */
      dataToExport.forEach((row) => {
        const rowValues = headers.map((key) => (row as any)[key]);
        const newRow = worksheet.addRow(rowValues);

        newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const centerColumns = [1, 4]; // No, Satuan (gr)

          cell.alignment = {
            vertical: 'middle',
            horizontal: centerColumns.includes(colNumber) ? 'center' : 'left',
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          // Kolom Harga Sertifikat = kolom ke-5
          if (colNumber === 5) {
            cell.numFmt = '"Rp"#,##0';
          }
        });
      });

      /* ================= TOTAL ================= */
      const totalRow = worksheet.addRow([
        'TOTAL',
        rows.length,
        '',
        '',
        '',
        '',
        '',
        '',
      ]);

      totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const isNumeric = colNumber === 2;

        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFCE29F' },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: isNumeric ? 'center' : 'left',
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      /* ================= AUTO WIDTH ================= */
      worksheet.columns.forEach((col) => {
        let maxLength = 10;

        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const value = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, value.length);
        });

        col.width = Math.min(maxLength + 2, 35);
      });

      /* ================= FREEZE HEADER ================= */
      // Header tabel ada di baris 7
      worksheet.views = [{ state: 'frozen', ySplit: 7 }];

      /* ================= SAVE ================= */
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_data_master_sertifikat_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;
      saveAs(new Blob([buffer]), fileName);

      api.success({
        message: 'Export Sukses',
        description: 'File sertifikat berhasil diunduh',
        placement: 'bottomRight',
      });
    } catch (error) {
      console.log(error);
      api.error({
        message: 'Export Gagal',
        description: 'Terjadi kesalahan saat export data',
        placement: 'bottomRight',
      });
    } finally {
      setIsModalLoading(false);
    }
  };

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
            href={`/master/gold/cert/form`}
            className="btn btn-outline-neutral"
          >
            <Plus />
            Add data
          </Link>
        </div>
      </div>
      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="cert_id"
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

export default GoldCertPageTable;
