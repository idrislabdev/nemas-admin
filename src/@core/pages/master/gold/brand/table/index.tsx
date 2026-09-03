'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IBrand } from '@/@core/@types/interface';
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
import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

const BrandPageTable = () => {
  const url = `/core/brand/`;

  const [dataTable, setDataTable] = useState<Array<IBrand>>([]);
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
  const columns: ColumnsType<IBrand> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Nama Brand',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (value) => value || '-',
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 180,
      render: (value) => {
        if (!value) return '-';

        return (
          <span className="block max-w-[180px] truncate" title={value}>
            {value}
          </span>
        );
      },
    },
    {
      title: 'Create By',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      width: 150,
      render: (value) => value || '-',
    },
    {
      title: 'Create Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      align: 'center',
      render: (value) =>
        value ? moment(value).format('DD MMM YYYY HH:mm') : '-',
    },
    {
      title: 'Update By',
      dataIndex: 'updated_by_name',
      key: 'updated_by_name',
      width: 150,
      render: (value) => value || '-',
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-[5px]">
          <Link href={`/master/gold/brand/${record.id}`} className="btn-action">
            <Edit05 />
          </Link>

          <a className="btn-action" onClick={() => deleteData(record.id)}>
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
      const resp = await axiosInstance.get(url, {
        params,
      });

      setDataTable(resp.data.results || []);
      setTotal(resp.data.count || 0);
    } catch (error) {
      console.log(error);

      api.error({
        message: 'Error',
        description: 'Gagal memuat data brand',
        placement: 'bottomRight',
      });
    }
  }, [params, api]);

  // ========================
  // Pagination
  // ========================
  const onChangePage = async (val: number) => {
    setParams({
      ...params,
      offset: (val - 1) * params.limit,
    });
  };

  // ========================
  // Search
  // ========================
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

      setParams({
        ...params,
        offset: 0,
        limit: 10,
      });

      api.success({
        message: 'Data Brand',
        description: 'Data Brand berhasil dihapus',
        placement: 'bottomRight',
      });
    } catch (error) {
      console.log(error);

      api.error({
        message: 'Error',
        description: 'Gagal menghapus data brand',
        placement: 'bottomRight',
      });
    }
  };

  // ========================
  // Get Current User
  // ========================
  const getExportedBy = () => {
    if (typeof window === 'undefined') return '-';

    try {
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
      };

      const resp = await axiosInstance.get(url, {
        params: exportParams,
      });

      const rows: IBrand[] = resp.data?.results || [];

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
        'Nama Brand': item.name || '-',
        Deskripsi: item.description || '-',
        Image: item.image || '-',
        'Create By': item.created_by_name || '-',
        'Create Time': item.created_at
          ? moment(item.created_at).format('DD MMM YYYY HH:mm')
          : '-',
        'Update By': item.updated_by_name || '-',
        'Update Time': item.updated_at
          ? moment(item.updated_at).format('DD MMM YYYY HH:mm')
          : '-',
      }));

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'NEMAS';
      workbook.company = 'NEMAS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Master Brand');

      const exportedBy = getExportedBy();
      const exportedAt = moment().format('DD MMMM YYYY HH:mm:ss');

      const header =
        dataToExport.length > 0
          ? Object.keys(dataToExport[0])
          : [
              'No',
              'Nama Brand',
              'Deskripsi',
              'Image',
              'Create By',
              'Create Time',
              'Update By',
              'Update Time',
            ];

      const totalColumns = header.length;
      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // ==========================
      // Title
      // ==========================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'DATA MASTER BRAND';

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

      worksheet.getCell('A3').font = {
        bold: true,
      };

      worksheet.getCell('A4').font = {
        bold: true,
      };

      worksheet.getCell('A5').font = {
        bold: true,
      };

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
          top: {
            style: 'thin',
          },
          left: {
            style: 'thin',
          },
          bottom: {
            style: 'thin',
          },
          right: {
            style: 'thin',
          },
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

            case 6:
            case 8:
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
            top: {
              style: 'thin',
            },
            left: {
              style: 'thin',
            },
            bottom: {
              style: 'thin',
            },
            right: {
              style: 'thin',
            },
          };
        });
      });

      // ==========================
      // Auto Width
      // ==========================

      worksheet.columns.forEach((column: any) => {
        let maxLength = 10;

        column.eachCell(
          {
            includeEmpty: true,
          },
          (cell: any) => {
            const value = cell.value ? cell.value.toString() : '';

            maxLength = Math.max(maxLength, value.length);
          }
        );

        column.width = Math.min(maxLength + 3, 40);
      });

      // ==========================
      // Export
      // ==========================

      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `data_master_brand_${moment().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);

      api.success({
        message: 'Export Berhasil',
        description: 'Data master brand berhasil diunduh.',
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

  // ========================
  // Initial Fetch
  // ========================
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {contextHolder}

      {/* ========================
          Header
      ======================== */}
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
            href="/master/gold/brand/form"
            className="btn btn-outline-neutral"
          >
            <Plus />
            Add data
          </Link>
        </div>
      </div>

      {/* ========================
          Table
      ======================== */}
      <div className="flex flex-col rounded-tr-[8px] rounded-tl-[8px]">
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
          rowKey="id"
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

      {/* ========================
          Delete Confirmation
      ======================== */}
      <ModalConfirm
        isModalOpen={openModalConfirm}
        setIsModalOpen={setOpenModalConfirm}
        content="Hapus Data Ini?"
        onConfirm={confirmDelete}
      />

      {/* ========================
          Loading
      ======================== */}
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default BrandPageTable;
