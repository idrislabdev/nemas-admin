'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldPrice } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber } from '@/@core/utils/general';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table, notification } from 'antd';
import { ColumnsType } from 'antd/es/table';
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
import dayjs from 'dayjs';
import 'moment/locale/id';

moment.locale('id');

const GoldPricePageTable = () => {
  const url = `/core/gold/price/`;
  const [dataTable, setDataTable] = useState<Array<IGoldPrice>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    gold_price_source__icontains: '',
  });

  const [api, contextHolder] = notification.useNotification();

  const columns: ColumnsType<IGoldPrice> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'gold_price_id',
      key: 'gold_price_id',
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Asal Harga Emas',
      dataIndex: 'gold_price_source',
      key: 'gold_price_source',
      width: 200,
    },
    {
      title: 'Satuan (gr)',
      dataIndex: 'gold_price_weight',
      key: 'gold_price_weight',
      width: 150,
      align: 'right',
      render: (_, record) =>
        `${formatterNumber(record.gold_price_weight || 0)} gr`,
    },
    {
      title: 'Harga Dasar',
      dataIndex: 'gold_price_base',
      key: 'gold_price_base',
      width: 180,
      align: 'right',
      render: (_, record) =>
        `Rp ${formatterNumber(record.gold_price_base || 0)}`,
    },
    {
      title: 'Harga Jual',
      dataIndex: 'gold_price_sell',
      key: 'gold_price_sell',
      width: 180,
      align: 'right',
      render: (_, record) =>
        `Rp ${formatterNumber(record.gold_price_sell || 0)}`,
    },
    {
      title: 'Harga Beli',
      dataIndex: 'gold_price_buy',
      key: 'gold_price_buy',
      width: 180,
      align: 'right',
      render: (_, record) =>
        `Rp ${formatterNumber(record.gold_price_buy || 0)}`,
    },
    {
      title: 'Create By',
      dataIndex: 'create_user_name',
      key: 'create_user_name',
      width: 180,
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
      width: 180,
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
            href={`/master/gold/price/${record.gold_price_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>

          <a
            className="btn-action"
            onClick={() => deleteData(record.gold_price_id)}
          >
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
      gold_price_source__icontains: value,
    });
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
      gold_price_source__icontains: '',
    });
    api.info({
      message: 'Data Gold Price',
      description: 'Data Gold Price Berhasil Dihapus',
      placement: 'bottomRight',
    });
  };

  const fetchAllData = async (url: string, params: any) => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    allRows = allRows.concat(firstResp.data.results || []);
    const totalCount = firstResp.data.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset },
      });
      allRows = allRows.concat(resp.data.results || []);
      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const storedUser =
        typeof window !== 'undefined'
          ? localStorage.getItem('user') || sessionStorage.getItem('user')
          : null;

      let exportedBy = '-';

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          exportedBy =
            parsedUser?.full_name ||
            parsedUser?.user_name ||
            parsedUser?.name ||
            parsedUser?.username ||
            '-';
        } catch {
          exportedBy = '-';
        }
      }

      const param = {
        format: 'json',
        offset: 0,
        limit: 10,
        gold_price_source__icontains: params.gold_price_source__icontains,
      };

      const rows = await fetchAllData(url, param);

      const dataToExport = rows.map((item: IGoldPrice, index: number) => ({
        No: index + 1,
        'Gold Price Source': item.gold_price_source,
        'Gold Price Weight': item.gold_price_weight || 0,
        'Gold Price Base': item.gold_price_base || 0,
        'Gold Price Sell': item.gold_price_sell || 0,
        'Gold Price Buy': item.gold_price_buy || 0,
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

      const worksheet = workbook.addWorksheet('Laporan Harga Emas');

      const header =
        dataToExport.length > 0
          ? Object.keys(dataToExport[0])
          : [
              'No',
              'Gold Price Source',
              'Gold Price Weight',
              'Gold Price Base',
              'Gold Price Sell',
              'Gold Price Buy',
              'Create By',
              'Create Time',
              'Update By',
            ];

      const lastColumnLetter = worksheet.getColumn(header.length).letter;

      // =====================================
      // Title
      // =====================================

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);

      const titleCell = worksheet.getCell('A1');

      titleCell.value = 'LAPORAN HARGA EMAS';

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

      // =====================================
      // Export Information
      // =====================================

      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${exportedBy}`;

      worksheet.getCell('A4').value = 'Diexport Pada';
      worksheet.getCell('B4').value = `: ${moment().format(
        'DD MMMM YYYY HH:mm:ss'
      )}`;

      worksheet.getCell('A5').value = 'Pencarian';
      worksheet.getCell('B5').value =
        `: ${params.gold_price_source__icontains || '-'}`;

      ['A3', 'A4', 'A5'].forEach((cell) => {
        worksheet.getCell(cell).font = {
          bold: true,
        };
      });

      worksheet.addRow([]);

      // =====================================
      // Header
      // =====================================

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

      // =====================================
      // Freeze Header
      // =====================================

      worksheet.views = [
        {
          state: 'frozen',
          ySplit: 7,
        },
      ];

      worksheet.autoFilter = {
        from: 'A7',
        to: `${lastColumnLetter}7`,
      };

      // =====================================
      // Data
      // =====================================

      dataToExport.forEach((row) => {
        const values = header.map((key) => row[key as keyof typeof row]);

        const newRow = worksheet.addRow(values);

        // Zebra row
        if (newRow.number % 2 === 0) {
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

            case 3:
              horizontal = 'right';
              cell.numFmt = '#,##0.####" gr"';
              break;

            case 4:
            case 5:
            case 6:
              horizontal = 'right';
              cell.numFmt = '"Rp" #,##0';
              break;

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
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // =====================================
      // Auto Width
      // =====================================

      worksheet.columns.forEach((column: any) => {
        let maxLength = 10;

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const value = cell.value ? cell.value.toString() : '';

          maxLength = Math.max(maxLength, value.length);
        });

        column.width = Math.min(maxLength + 3, 40);
      });

      // =====================================
      // Export
      // =====================================

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `laporan_harga_emas_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);

      api.error({
        message: 'Export Excel',
        description: 'Gagal export data harga emas',
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
            href={`/master/gold/price/form`}
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
          rowKey="gold_price_id"
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

export default GoldPricePageTable;
