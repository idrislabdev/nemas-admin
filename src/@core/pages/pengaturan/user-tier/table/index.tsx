'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IUserTier, IUser } from '@/@core/@types/interface';
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

const UserTierPageTable = () => {
  const url = `/core/user_level/`;

  const [dataTable, setDataTable] = useState<Array<IUserTier>>([]);
  const [total, setTotal] = useState(0);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    user_level_min_point: '',
    user_level_name__icontains: '',
  });

  const [api, contextHolder] = notification.useNotification();

  // ========================
  // Table Columns
  // ========================
  const columns: ColumnsType<IUserTier> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'user_level_id',
      key: 'user_level_id',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Nama Tier',
      dataIndex: 'user_level_name',
      key: 'user_level_name',
      width: 180,
    },
    {
      title: 'Minimum Point',
      dataIndex: 'user_level_min_point',
      key: 'user_level_min_point',
      width: 150,
      align: 'right',
      render: (val) =>
        val !== undefined && val !== null
          ? new Intl.NumberFormat('id-ID').format(val)
          : '-',
    },
    {
      title: 'Deskripsi',
      dataIndex: 'user_level_description',
      key: 'user_level_description',
      width: 250,
    },
    {
      title: 'Diskon (%)',
      dataIndex: 'percentage_discount',
      key: 'percentage_discount',
      width: 120,
      align: 'right',
      render: (val) => (val !== undefined && val !== null ? `${val}%` : '-'),
    },
    {
      title: 'Topup Limit',
      dataIndex: 'topup_limit',
      key: 'topup_limit',
      width: 170,
      align: 'right',
      render: (val) =>
        val !== undefined && val !== null
          ? new Intl.NumberFormat('id-ID').format(val)
          : '-',
    },
    {
      title: 'Disburst Limit',
      dataIndex: 'disburst_limit',
      key: 'disburst_limit',
      width: 170,
      align: 'right',
      render: (val) =>
        val !== undefined && val !== null
          ? new Intl.NumberFormat('id-ID').format(val)
          : '-',
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
      render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: 'Update By',
      dataIndex: 'update_user_name',
      key: 'update_user_name',
      width: 150,
    },
    {
      title: 'Update Time',
      dataIndex: 'update_time',
      key: 'update_time',
      width: 170,
      render: (val) => (val ? moment(val).format('DD MMM YYYY HH:mm') : '-'),
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link
            href={`/pengaturan/user-tier/${record.user_level_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>

          <a
            className="btn-action"
            onClick={() => deleteData(record.user_level_id)}
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
    try {
      const resp = await axiosInstance.get(url, {
        params,
      });

      setDataTable(resp.data.results || []);
      setTotal(resp.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch user tier:', error);
    }
  }, [params]);

  // ========================
  // Pagination
  // ========================
  const onChangePage = (val: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (val - 1) * prev.limit,
    }));
  };

  // ========================
  // Filter Tier Name
  // ========================
  const handleNameFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      user_level_name__icontains: value,
    }));
  };

  // ========================
  // Filter Minimum Point
  // ========================
  const handleMinPointFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      user_level_min_point: value,
    }));
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

      setParams((prev) => ({
        ...prev,
        offset: 0,
      }));

      api.info({
        message: 'Data User Tier',
        description: 'Data User Tier berhasil dihapus',
        placement: 'bottomRight',
      });
    } catch (error) {
      console.error('Delete failed:', error);

      api.error({
        message: 'Data User Tier',
        description: 'Data User Tier gagal dihapus',
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
        limit: 100,
        user_level_min_point: params.user_level_min_point,
        user_level_name__icontains: params.user_level_name__icontains,
      };

      const resp = await axiosInstance.get(url, {
        params: exportParams,
      });

      const rows = resp.data.results || [];

      const dataToExport = rows.map((item: IUserTier, index: number) => ({
        No: index + 1,
        'Tier Name': item.user_level_name || '-',
        'Minimum Point': item.user_level_min_point ?? '-',
        Description: item.user_level_description || '-',
        'Discount (%)': item.percentage_discount ?? '-',
        'Topup Limit': item.topup_limit ?? '-',
        'Disburst Limit': item.disburst_limit ?? '-',
        'Create By': item.create_user_name || '-',
        'Create Time': item.create_time
          ? moment(item.create_time).format('DD MMM YYYY, HH:mm')
          : '-',
        'Update By': item.update_user_name || '-',
        'Update Time': item.update_time
          ? moment(item.update_time).format('DD MMM YYYY, HH:mm')
          : '-',
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('User Tier');

      const thinBorder = {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const },
      };

      // ======================
      // JUDUL
      // ======================
      worksheet.mergeCells('A1:K1');
      worksheet.getCell('A1').value = 'DATA USER TIER';
      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = {
        size: 14,
        bold: true,
      };
      worksheet.getCell('A1').border = thinBorder;

      // ======================
      // HEADER INFO
      // ======================
      worksheet.mergeCells('A2:K2');
      worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;
      worksheet.getCell('A2').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A2').border = thinBorder;

      worksheet.mergeCells('A3:K3');
      worksheet.getCell('A3').value = `Tanggal Export : ${moment().format(
        'DD MMM YYYY, HH:mm'
      )}`;
      worksheet.getCell('A3').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A3').border = thinBorder;

      worksheet.addRow([]);

      // ======================
      // HEADER TABLE
      // ======================
      const header = [
        'No',
        'Tier Name',
        'Minimum Point',
        'Description',
        'Discount (%)',
        'Topup Limit',
        'Disburst Limit',
        'Create By',
        'Create Time',
        'Update By',
        'Update Time',
      ];

      const headerRow = worksheet.addRow(header);

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
        };

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };

        cell.border = thinBorder;

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
      if (dataToExport.length > 0) {
        dataToExport.forEach((row: any) => {
          const rowValues = header.map(
            (key) => row[key as keyof typeof row] ?? '-'
          );

          const newRow = worksheet.addRow(rowValues);

          newRow.eachCell((cell) => {
            cell.alignment = {
              vertical: 'middle',
              horizontal: 'left',
              wrapText: true,
            };

            cell.border = thinBorder;
          });
        });
      } else {
        const emptyRow = worksheet.addRow([
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ]);

        emptyRow.eachCell((cell) => {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
          };

          cell.border = thinBorder;
        });
      }

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

          col.width = Math.max(maxLength + 2, 15);
        }
      });

      // ======================
      // SAVE FILE
      // ======================
      const buffer = await workbook.xlsx.writeBuffer();

      const fileName = `data_user_tier_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
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

      {/* ========================
          FILTER & ACTION
      ======================== */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Search Tier Name */}
          <div className="group-input prepend-append">
            <span className="append">
              <SearchSm />
            </span>

            <input
              type="text"
              className="color-1 base"
              placeholder="Cari nama tier"
              onChange={debounce(
                (event) => handleNameFilter(event.target.value),
                1000
              )}
            />
          </div>

          {/* Minimum Point */}
          <input
            type="number"
            className="color-1 base"
            placeholder="Minimum point"
            onChange={debounce(
              (event) => handleMinPointFilter(event.target.value),
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
            href={`/pengaturan/user-tier/form`}
            className="btn btn-outline-neutral"
          >
            <Plus />
            Add data
          </Link>
        </div>
      </div>

      {/* ========================
          TABLE
      ======================== */}
      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
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
          rowKey="user_level_id"
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
          DELETE MODAL
      ======================== */}
      <ModalConfirm
        isModalOpen={openModalConfirm}
        setIsModalOpen={setOpenModalConfirm}
        content="Hapus Data Ini?"
        onConfirm={confirmDelete}
      />

      {/* ========================
          LOADING MODAL
      ======================== */}
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default UserTierPageTable;
