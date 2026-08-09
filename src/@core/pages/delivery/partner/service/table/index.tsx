/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import { IDeliveryPartnerService, IUser } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  Edit05,
  FileDownload02,
  Plus,
  SearchSm,
  Trash01,
} from '@untitled-ui/icons-react';
import Link from 'next/link';
import { notification } from 'antd';
import ExcelJS from 'exceljs';
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
import { saveAs } from 'file-saver';
import { UndoOutlineIcon } from '@/@core/my-icons';

moment.locale('id');

const DeliveryPartnerServicePageTable = (props: { paramsId: string }) => {
  const { paramsId } = props;
  const url = `/core/delivery_partner/service/?delivery_partner=${paramsId}`;
  const [dataTable, setDataTable] = useState<Array<IDeliveryPartnerService>>(
    []
  );
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
  const columns: ColumnsType<IDeliveryPartnerService> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'payment_id',
      key: 'payment_id',
      fixed: 'left',
      align: 'center',
      render: (_, record, index) => index + params.offset + 1,
    },
    {
      title: 'Nama',
      dataIndex: 'delivery_partner_service_name',
      key: 'delivery_partner_service_name',
    },
    {
      title: 'Code',
      dataIndex: 'delivery_partner_service_code',
      key: 'delivery_partner_code',
    },
    {
      title: 'Deskripsi',
      dataIndex: 'delivery_partner_service_description',
      key: 'delivery_partner_service_description',
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
            href={`/delivery/partner/${record.delivery_partner}/service/${record.delivery_partner_service_id}`}
            className="btn-action"
          >
            <Edit05 />
          </Link>
          <a
            className="btn-action"
            onClick={() => deleteData(record.delivery_partner_service_id)}
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
      search: value,
    });
  };

  const deleteData = (id: number | undefined) => {
    if (id) {
      setSelectedId(id);
      setOpenModalConfirm(true);
    }
  };

  const confirmDelete = async () => {
    await axiosInstance.delete(`/core/delivery_partner/service/${selectedId}`);
    setOpenModalConfirm(false);
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      search: '',
    });
    api.info({
      message: 'Data Delivery Partner',
      description: 'Data Delivery Partner Berhasil Dihapus',
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

    const totalCount = firstResp.data.count || firstResp.data.results.length;
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

      let user: IUser | Record<string, any> = {};
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        user = {};
      }

      const exportParams: any = { ...params, offset: 0, limit: 1000 };
      if (!exportParams.search) delete exportParams.search;

      const rows = await fetchAllData(url, exportParams);

      if (!rows || rows.length === 0) {
        console.warn('Tidak ada data untuk diekspor.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = (user as IUser)?.name || 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Delivery Partner Service');
      const totalColumns = 4;

      // =============================
      // TITLE & METADATA (Row 1 - 6)
      // =============================
      worksheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN DELIVERY PARTNER SERVICE';
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF0057B7' } };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${(user as IUser)?.name || '-'}`;

      worksheet.getCell('A4').value = 'Tanggal Export';
      worksheet.getCell('B4').value =
        `: ${moment().format('DD-MM-YYYY HH:mm')}`;

      worksheet.getCell('A5').value = 'Total Data';
      worksheet.getCell('B5').value = `: ${rows.length}`;

      worksheet.getCell('A6').value = 'Periode';
      worksheet.getCell('B6').value = `: -`;

      ['A3', 'A4', 'A5', 'A6'].forEach((cell) => {
        worksheet.getCell(cell).font = { bold: true };
      });

      worksheet.addRow([]); // Baris kosong (Row 7)

      // =============================
      // HEADER TABEL (Row 8)
      // =============================
      const header = ['No', 'Nama', 'Code', 'Deskripsi'];

      const headerRow = worksheet.addRow(header);
      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' }, // Biru Utama
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // =============================
      // DATA ROWS (Row 9+)
      // =============================
      rows.forEach((item: IDeliveryPartnerService, index: number) => {
        const rowValues = [
          index + 1,
          item.delivery_partner_service_name || '-',
          item.delivery_partner_service_code || '-',
          item.delivery_partner_service_description || '-',
        ];

        const newRow = worksheet.addRow(rowValues);

        // Zebra Striping
        if (index % 2 === 1) {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FBFF' },
            };
          });
        }

        newRow.eachCell((cell, colNumber) => {
          let horizontal: ExcelJS.Alignment['horizontal'] = 'left';

          if (colNumber === 1) {
            horizontal = 'center';
          }

          cell.alignment = { horizontal, vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // =============================
      // FREEZE, FILTER & AUTO WIDTH
      // =============================
      worksheet.views = [{ state: 'frozen', ySplit: 8 }];
      worksheet.autoFilter = {
        from: { row: 8, column: 1 },
        to: { row: 8, column: totalColumns },
      };

      worksheet.columns.forEach((column: any, colIdx: number) => {
        let maxLength = header[colIdx]?.length || 10;

        column.eachCell({ includeEmpty: true }, (cell: any, rowNum: number) => {
          if (rowNum >= 8) {
            const val = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, val.length);
          }
        });

        // Perlakuan khusus Kolom A agar tidak bentrok dengan label metadata
        if (colIdx === 0) {
          column.width = Math.max(maxLength + 4, 20);
        } else {
          column.width = Math.min(maxLength + 4, 35);
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `delivery_partner_service_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (error) {
      console.error(error);
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
          <div className="flex gap-[4px] items-center justify-end">
            <Link
              href={`/delivery/partner`}
              className="btn btn-outline-neutral"
            >
              <UndoOutlineIcon /> Kembali
            </Link>
          </div>
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
          <Link
            href={`/delivery/partner/${paramsId}/service/form`}
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
          rowKey="payment_method_id"
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

export default DeliveryPartnerServicePageTable;
