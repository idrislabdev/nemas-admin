'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldCertPrice } from '@/@core/@types/interface';
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
    {
      title: 'Kode Sertifikat',
      dataIndex: 'cert_code',
      key: 'cert_code',
      width: 150,
    },
    {
      title: 'Nama Brand',
      dataIndex: 'cert_brand',
      key: 'cert_brand',
      width: 180,
    },
    {
      title: 'Satuan (gr)',
      dataIndex: 'gold_weight',
      key: 'gold_weight',
      width: 140,
      align: 'right',
      render: (_, record) =>
        `${formatterNumber(record.gold_weight ? record.gold_weight : 0)} gr`,
    },
    {
      title: 'Harga Sertifikat',
      dataIndex: 'cert_price',
      key: 'cert_price',
      width: 170,
      align: 'right',
      render: (_, record) =>
        `Rp ${formatterNumber(record.cert_price ? record.cert_price : 0)}`,
    },
    {
      title: 'Create By',
      dataIndex: 'create_user_name',
      key: 'create_user_name',
      width: 150,
    },
    {
      title: 'Create Time',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 170,
      align: 'center',
      render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: 'Update By',
      dataIndex: 'upd_user_name',
      key: 'upd_user_name',
      width: 150,
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-[5px]">
          <Link
            href={`/master/gold/cert/${record.cert_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>

          <a className="btn-action" onClick={() => deleteData(record.cert_id)}>
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

  const getExportedBy = () => {
    if (typeof window === 'undefined') return '-';

    try {
      // Sesuaikan key localStorage sesuai project kamu
      const rawUser =
        localStorage.getItem('user') ||
        localStorage.getItem('auth_user') ||
        localStorage.getItem('profile');

      if (!rawUser) return '-';

      const parsedUser = JSON.parse(rawUser);

      return (
        parsedUser?.full_name ||
        parsedUser?.name ||
        parsedUser?.username ||
        parsedUser?.email ||
        '-'
      );
    } catch (error) {
      console.error('Gagal membaca user dari localStorage:', error);
      return '-';
    }
  };

  // ========================
  // Export Excel
  // ========================
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const exportParams = {
        format: 'json',
        offset: 0,
        limit: total || 1000,
        search: params.search,
        cert_brand__icontains: '',
      };

      const resp = await axiosInstance.get(url, {
        params: exportParams,
      });

      const rows: IGoldCertPrice[] = resp.data?.results || [];

      if (!rows.length) {
        api.warning({
          message: 'Data Kosong',
          description: 'Tidak ada data untuk di-export',
          placement: 'bottomRight',
        });

        return;
      }

      const dataToExport = rows.map((item, index) => ({
        No: index + 1,
        'Kode Sertifikat': item.cert_code || '-',
        'Nama Brand': item.cert_brand || '-',
        'Satuan (gr)': `${formatterNumber(item.gold_weight || 0)} gr`,
        'Harga Sertifikat': item.cert_price || 0,
        'Create By': item.create_user_name || '-',
        'Create Time': item.create_time
          ? moment(item.create_time).format('DD MMM YYYY HH:mm')
          : '-',
        'Update By': item.upd_user_name || '-',
      }));

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';
      workbook.company = 'NEMAS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Master Sertifikat');

      const exportedBy = getExportedBy();
      const exportedAt = moment().format('DD MMMM YYYY HH:mm:ss');

      const header =
        dataToExport.length > 0
          ? Object.keys(dataToExport[0])
          : [
              'No',
              'Kode Sertifikat',
              'Nama Brand',
              'Satuan (gr)',
              'Harga Sertifikat',
              'Create By',
              'Create Time',
              'Update By',
            ];

      const totalColumns = header.length;
      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // ==========================
      // Title
      // ==========================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'DATA MASTER SERTIFIKAT';

      titleCell.font = {
        size: 16,
        bold: true,
        color: {
          argb: 'FF0057B7',
        },
      };

      titleCell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      // ==========================
      // Export Info
      // ==========================

      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${exportedBy}`;

      worksheet.getCell('A4').value = 'Diexport Pada';
      worksheet.getCell('B4').value = `: ${exportedAt}`;

      worksheet.getCell('A5').value = 'Pencarian';
      worksheet.getCell('B5').value = `: ${params.search || '-'}`;

      worksheet.getCell('A3').font = { bold: true };
      worksheet.getCell('A4').font = { bold: true };
      worksheet.getCell('A5').font = { bold: true };

      worksheet.addRow([]);

      // ==========================
      // Header
      // ==========================

      const headerRow = worksheet.addRow(header);

      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
          color: {
            argb: 'FFFFFFFF',
          },
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'FF0057B7',
          },
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
      });

      // ==========================
      // Freeze Header
      // ==========================

      worksheet.views = [
        {
          state: 'frozen',
          ySplit: headerRow.number,
        },
      ];

      worksheet.autoFilter = {
        from: `A${headerRow.number}`,
        to: `${lastColumnLetter}${headerRow.number}`,
      };

      // ==========================
      // Data
      // ==========================

      dataToExport.forEach((row: any) => {
        const values = header.map((key) => row[key]);

        const newRow = worksheet.addRow(values);

        if (newRow.number % 2 === 1) {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: {
                argb: 'FFF8FBFF',
              },
            };
          });
        }

        newRow.eachCell((cell, colNumber) => {
          let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

          switch (colNumber) {
            case 1:
              horizontal = 'center';
              break;

            case 4:
            case 5:
              horizontal = 'right';
              break;

            case 7:
              horizontal = 'center';
              break;

            default:
              horizontal = 'left';
          }

          cell.alignment = {
            horizontal,
            vertical: 'middle',
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          if (colNumber === 5) {
            cell.numFmt = '"Rp" #,##0';
          }
        });
      });

      // ==========================
      // Auto Width
      // ==========================

      worksheet.columns.forEach((column: any) => {
        let maxLength = 10;

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const value = cell.value ? cell.value.toString() : '';

          maxLength = Math.max(maxLength, value.length);
        });

        column.width = Math.min(maxLength + 3, 40);
      });

      // ==========================
      // Export
      // ==========================

      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `data_master_sertifikat_${moment().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);

      api.success({
        message: 'Export Berhasil',
        description: 'Data master sertifikat berhasil diunduh.',
        placement: 'bottomRight',
      });
    } catch (err) {
      console.error(err);

      api.error({
        message: 'Export Gagal',
        description: 'Terjadi kesalahan saat export data.',
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
      <div className="flex flex-col rounded-tr-[8px] rounded-tl-[8px]">
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
