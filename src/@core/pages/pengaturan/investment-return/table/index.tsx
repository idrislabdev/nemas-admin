'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IInvesmentReturn, IUser } from '@/@core/@types/interface';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { notification, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  Edit05,
  FileDownload02,
  Plus,
  SearchSm,
  Trash01,
} from '@untitled-ui/icons-react';
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
import axiosInstance from '@/@core/utils/axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Link from 'next/link';
import { formatterNumber } from '@/@core/utils/general';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
moment.locale('id');

const InvestmentReturnPageTable = () => {
  const url = `/core/investment/return/`;
  const [dataTable, setDataTable] = useState<Array<IInvesmentReturn>>([]);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    name__icontains: '',
    description__icontains: '',
  });
  // const [api, contextHolder] = notification.useNotification();
  const columns: ColumnsType<IInvesmentReturn> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      align: 'center',
      render: (_, record, index) => index + params.offset + 1,
    },
    { title: 'Nama', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 150,
      render: (_, record) =>
        `${formatterNumber(
          parseFloat(record.rate ? record.rate.toString() : '')
        )}`,
    },
    {
      title: 'Durasi',
      dataIndex: 'duration_days',
      key: 'duration_days',
      width: 150,
      render: (_, record) =>
        `${formatterNumber(
          parseFloat(
            record.duration_days ? record.duration_days.toString() : ''
          )
        )}`,
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      width: 150,
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link
            className="btn-action"
            href={`/pengaturan/investment-return/${record.id}`}
          >
            <Edit05 />
          </Link>
          <a className="btn-action" onClick={() => deleteData(record.id)}>
            <Trash01 />
          </a>
        </div>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const handleFilter = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      name__icontains: value,
      description__icontains: value,
    });
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const param = {
        format: 'json',
        offset: 0,
        limit: 50,
        search: '',
      };

      const resp = await axiosInstance.get(url, { params: param });
      const rows = resp.data.results || [];

      const dataToExport = rows.map(
        (item: IInvesmentReturn, index: number) => ({
          No: index + 1,
          Nama: item.name || '-',
          Rate: item.rate ?? '-',
          Durasi: item.duration_days ?? '-',
          Deskripsi: item.description || '-',
        })
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Investment Return');

      const thinBorder = {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const },
      };

      // ======================
      // JUDUL
      // ======================
      worksheet.mergeCells('A1:E1');
      worksheet.getCell('A1').value = 'DATA MASTER INVESTMENT RETURN';
      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };
      worksheet.getCell('A1').border = thinBorder;

      // ======================
      // HEADER INFO
      // ======================
      worksheet.mergeCells('A2:E2');
      worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;
      worksheet.getCell('A2').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A2').border = thinBorder;

      worksheet.mergeCells('A3:E3');
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
      // HEADER TABLE (STATIC)
      // ======================
      const header = ['No', 'Nama', 'Rate', 'Durasi', 'Deskripsi'];

      const headerRow = worksheet.addRow(header);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = thinBorder;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E5E5' },
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
        // Tetap buat 1 row kosong supaya border tabel tetap muncul
        const emptyRow = worksheet.addRow(['', '', '', '', '']);

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
        if (col != undefined) {
          let maxLength = 0;

          col.eachCell({ includeEmpty: true }, (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength) maxLength = val.length;
          });

          col.width = Math.max(maxLength + 2, 15);
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `data_investment_return_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

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
      name__icontains: '',
    });
    api.info({
      message: 'Data Gold',
      description: 'Data Gold Berhasil Dihapus',
      placement: 'bottomRight',
    });
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
            href={`/pengaturan/admin-fee/form`}
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
      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
      <ModalConfirm
        isModalOpen={openModalConfirm}
        setIsModalOpen={setOpenModalConfirm}
        content="Hapus Data Ini?"
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default InvestmentReturnPageTable;
