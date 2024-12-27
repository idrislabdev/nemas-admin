"use client"
import { IAddressDistrict } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react'
import { Pagination, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import {  FileDownload02, SearchSm, } from '@untitled-ui/icons-react';
import * as XLSX from "xlsx";
import ModalLoading from '@/@core/components/modal/modal-loading';

const AddressDistrictPageTable = () => {
    const url = `/core/address/district/`
    const [dataTable, setDataTable] = useState<Array<IAddressDistrict>>([]);
    const [total, setTotal] = useState(0);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains:"",
    });
    const columns: ColumnsType<IAddressDistrict>  = [
        { title: 'No', width: 70, dataIndex: 'district_id', key: 'district_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Nama Kabupaten / Kota', dataIndex: 'city_name', key: 'city_name'},
        { title: 'Nama Kecamatan', dataIndex: 'district_name', key: 'district_name'},
    ];

    const fetchData = useCallback(async () => {
        const resp = await axiosInstance.get(url, { params });
        setDataTable(resp.data.results)
        setTotal(resp.data.count)
    },[params, url])

    const onChangePage = async (val:number) => {
        setParams({...params, offset:(val-1)*params.limit})
    }

    const handleFilter = (value:string) => {
        setParams({
           ...params,
           offset: 0,
           limit: 10,
           type__icontains: value,
        });
     };
     
    const exportData = async () => {
        setIsModalLoading(true)
        const param = {
            format: 'json',
            offset: 0,
            limit: 50,
            type__icontains:"",
        }
        const resp = await axiosInstance.get(url, { params:param });
        const rows = resp.data.results;
        const dataToExport = rows.map((item: IAddressDistrict, index:number) => ({
            'No' : index+1,
            'City Name': item.city_name,
            'District Name': item.district_name,
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);

        worksheet["!cols"] = [ { wch: 5 }, { wch: 25 }, { wch: 25 }]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'district');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_district.xlsx`)
        setIsModalLoading(false)
    }
    
    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
        <>
            <div className='flex items-center justify-between'>
                <div className='group-input prepend-append'>
                    <span className='append'><SearchSm /></span>
                    <input 
                        type='text' 
                        className='color-1 base' 
                        placeholder='cari data'
                        onChange={debounce(
                            (event) => handleFilter(event.target.value),
                            1000
                        )}
                    />
                </div>
                <div className='flex items-center gap-[4px]'>
                    <button className='btn btn-primary' onClick={exportData}><FileDownload02 />Export Excel</button>
                </div>
            </div>
            <div className='flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]'>
                <Table
                    columns={columns}
                    dataSource={dataTable}
                    size='small'
                    scroll={{ x: 'max-content', y: 550}}
                    pagination={false}
                    className='table-basic'
                    rowKey='city_id'
                
                />
                <div className='flex justify-end p-[12px]'>
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
                textInfo='Harap tunggu, data sedang diunduh' 
            />
       </>
    )
}

export default AddressDistrictPageTable
