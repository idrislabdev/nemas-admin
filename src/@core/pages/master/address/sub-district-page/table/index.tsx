'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAddressSubDistrict } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileDownload02, SearchSm } from '@untitled-ui/icons-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import moment from 'moment';
import ModalLoading from '@/@core/components/modal/modal-loading';
import 'moment/locale/id';

moment.locale('id');

const AddressSubDistrictPageTable = () => {
  const url = `/core/address/sub_district/`;
  const [dataTable, setDataTable] = useState<Array<IAddressSubDistrict>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    search: '',
  });

  const columns: ColumnsType<IAddressSubDistrict> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'district_id',
      key: 'district_id',
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    {
      title: 'Nama Kecamatan',
      dataIndex: 'district_name',
      key: 'district_name',
    },
    {
      title: 'Nama Kelurahan / Desa',
      dataIndex: 'subdistrict_name',
      key: 'subdistrict_name',
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results || []);
      setTotal(resp.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch table data:', err);
    }
  }, [params, url]);

  const onChangePage = (page: number) => {
    setParams((prev) => ({ ...prev, offset: (page - 1) * prev.limit }));
  };

  const handleFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      search: value,
    }));
  };

  const fetchAllData = async (fetchUrl: string, currentParams: any) => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(fetchUrl, {
      params: { ...currentParams, limit, offset: 0 },
    });

    allRows = allRows.concat(firstResp.data.results || []);
    const totalCount = firstResp.data.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;
      const resp = await axiosInstance.get(fetchUrl, {
        params: { ...currentParams, limit, offset },
      });
      allRows = allRows.concat(resp.data.results || []);
      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

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

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData(url, {
        ...params,
        offset: 0,
        limit: 1000,
      });

      if (!rows.length) return;

      const dataToExport = rows.map(
        (item: IAddressSubDistrict, index: number) => ({
          No: index + 1,
          'Nama Kecamatan': item.district_name,
          'Nama Kelurahan / Desa': item.subdistrict_name,
        })
      );

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'System';
      workbook.company = 'System';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Data Subdistrict');

      const exportedBy = getExportedBy();
      const exportedAt = moment().format('DD MMMM YYYY HH:mm:ss');

      const totalColumns =
        dataToExport.length > 0 ? Object.keys(dataToExport[0]).length : 3;
      const lastColumnLetter = String.fromCharCode(64 + totalColumns);

      // =============================
      // Title
      // =============================
      worksheet.mergeCells(`A1:${lastColumnLetter}1`);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN DATA KELURAHAN / DESA';
      titleCell.font = {
        size: 16,
        bold: true,
        color: { argb: 'FF0057B7' },
      };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      // =============================
      // Export Info & Filter
      // =============================
      worksheet.getCell('A3').value = 'Dibuat Oleh';
      worksheet.getCell('B3').value = `: ${exportedBy}`;

      worksheet.getCell('A4').value = 'Diexport Pada';
      worksheet.getCell('B4').value = `: ${exportedAt}`;

      worksheet.getCell('A5').value = 'Pencarian';
      worksheet.getCell('B5').value = `: ${params.search || '-'}`;

      ['A3', 'A4', 'A5'].forEach((cell) => {
        worksheet.getCell(cell).font = { bold: true };
      });

      worksheet.addRow([]); // Baris kosong

      // =============================
      // Header
      // =============================
      const header = dataToExport.length
        ? Object.keys(dataToExport[0])
        : ['No', 'Nama Kecamatan', 'Nama Kelurahan / Desa'];

      const headerRow = worksheet.addRow(header);
      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' },
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
      // Freeze Header & Filter
      // =============================
      worksheet.views = [{ state: 'frozen', ySplit: 7 }];
      worksheet.autoFilter = {
        from: 'A7',
        to: `${lastColumnLetter}7`,
      };

      // =============================
      // Data
      // =============================
      dataToExport.forEach((row: any) => {
        const values = header.map((key) => row[key]);
        const newRow = worksheet.addRow(values);

        if (newRow.number % 2 === 1) {
          newRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FBFF' },
            };
          });
        }

        newRow.eachCell((cell, colNumber) => {
          const horizontal: ExcelJS.Alignment['horizontal'] =
            colNumber === 1 ? 'center' : 'left';

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
      // Auto Width
      // =============================
      worksheet.columns.forEach((column: any) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, (cell: any, rowNum: number) => {
          if (rowNum >= 7) {
            const value = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, value.length);
          }
        });
        column.width = Math.min(maxLength + 3, 40);
      });

      // =============================
      // Export File
      // =============================
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_data_subdistrict_${moment().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;

      saveAs(new Blob([buffer]), fileName);
    } catch (error) {
      console.error('Export data subdistrict failed:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
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
        </div>
      </div>

      <div className="flex flex-col  rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="subdistrict_id"
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
    </>
  );
};

export default AddressSubDistrictPageTable;
