"use client"
import { IGold, IGoldStockMovement } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react'
import { Pagination, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FileDownload02, Plus, SearchSm } from '@untitled-ui/icons-react';
import Link from 'next/link';
import * as XLSX from "xlsx";
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id')

const GoldStockMovementPageTable = () => {
    const url = `/gold-transaction/gold-stock/movement/`
    const [dataTable, setDataTable] = useState<Array<IGoldStockMovement>>([]);
    const [total, setTotal] = useState(0);
    const [isModalLoading, setIsModalLoading] = useState(false)
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains:"",
    });
    const columns: ColumnsType<IGoldStockMovement>  = [
        { title: 'No', width: 70, dataIndex: 'gold_id', key: 'gold_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Tipe', dataIndex: 'transaction_type', key: 'transaction_type', width:120},
        { title: 'Berat Emas (gr)', dataIndex: 'weight', key: 'weight', width: 150, fixed: 'left',
            render: (_, record) => (`${parseFloat(record.weight ? record.weight.toString() : '')} gr`)
        },
        { title: 'Catatan', dataIndex: 'note', key: 'note', width:120},
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
        const dataToExport = rows.map((item: IGold, index:number) => ({
            'No' : index+1,
            'Gold Weight': item. gold_weight,
            'Type': item.type,
            'Brand': item.brand,
            'Certificate Number': item.certificate_number,
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        const colA = 5;
        const colB = 10;
        const colC = rows.reduce((w:number, r:IGold) => Math.max(w, r.type ? r.type.length : 10), 10);
        const colD = rows.reduce((w:number, r:IGold) => Math.max(w, r.brand ? r.brand.length : 10), 10);

        worksheet["!cols"] = [ { wch: colA }, { wch: colB }, { wch: colC }, { wch: colD }, { wch: 20 }  ]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'gold');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_gold.xlsx`)
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
                    <Link href={`/master/gold/stock-movement/update`} className="btn btn-outline-neutral"><Plus />Add data</Link>
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
                    rowKey="gold_id"
                
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

export default GoldStockMovementPageTable
