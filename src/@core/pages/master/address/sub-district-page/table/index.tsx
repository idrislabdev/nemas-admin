'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAddressSubDistrict, IUser } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileDownload02, SearchSm } from '@untitled-ui/icons-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import ModalLoading from '@/@core/components/modal/modal-loading';

const AddressSubDistrictPageTable = () => {
  const url = `/core/address/sub_district/`;
  const [dataTable, setDataTable] = useState<Array<IAddressSubDistrict>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    subdistrict_name__icontains: '',
  });

  const columns: ColumnsType<IAddressSubDistrict> = [
    {
      title: 'No',
      width: 70,
      dataIndex: 'district_id',
      key: 'district_id',
      fixed: 'left',
      align: 'center',
      render: (_, record, index) => index + params.offset + 1,
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
      subdistrict_name__icontains: value,
    });
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

      const param = {
        format: 'json',
        offset: 0,
        limit: 1000,
        subdistrict_name__icontains: '',
      };

      const resp = await axiosInstance.get(url, { params: param });
      const rows: IAddressSubDistrict[] = resp.data?.results || [];

      if (!rows.length) return;

      const dataToExport = rows.map(
        (item: IAddressSubDistrict, index: number) => ({
          No: index + 1,
          'District Name': item.district_name,
          'Subdistrict Name': item.subdistrict_name,
        })
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Subdistrict');

      const lastColumnLetter = 'C';

      /* ================= TITLE ================= */
      worksheet.mergeCells(`A1:${lastColumnLetter}1`);
      worksheet.getCell('A1').value = 'LAPORAN DATA SUBDISTRICT';
      worksheet.getCell('A1').font = { size: 14, bold: true };
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
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
          const isCenter = colNumber === 1; // No

          cell.alignment = {
            vertical: 'middle',
            horizontal: isCenter ? 'center' : 'left',
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      /* ================= TOTAL ================= */
      const totalRow = worksheet.addRow(['TOTAL', rows.length, '']);

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
      saveAs(
        new Blob([buffer]),
        `laporan_data_subdistrict_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
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
