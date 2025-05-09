"use client"
import { IGoldPrice } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react'
import { Pagination, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import Link from 'next/link';
import { Edit05, FileDownload02, Plus, SearchSm, Trash01 } from '@untitled-ui/icons-react';
import { notification } from 'antd';
import * as XLSX from "xlsx";
import ModalLoading from '@/@core/components/modal/modal-loading';
import { formatterNumber } from '@/@core/utils/general';

const GoldPricePageTable = () => {
    const url = `/core/gold/price/`
    const [dataTable, setDataTable] = useState<Array<IGoldPrice>>([]);
    const [total, setTotal] = useState(0);
    const [isModalLoading, setIsModalLoading] = useState(false)
    const [openModalConfirm, setOpenModalConfirm ] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        gold_price_source__icontains:"",
    });
    const [api, contextHolder] = notification.useNotification();
    const columns: ColumnsType<IGoldPrice>  = [
        { title: 'No', width: 70, dataIndex: 'gold_price_id', key: 'gold_price_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Asal Harga emas', dataIndex: 'gold_price_source', key: 'gold_price_source', width: 200},
        { title: 'Satuan (gr)', dataIndex: 'gold_price_weight', key: 'gold_price_weight', width: 200,
             render: (_, record) => (`${formatterNumber(record.gold_price_weight ? record.gold_price_weight : 0)} gr`)
        },
        { title: 'Harga Dasar', dataIndex: 'gold_price_base', key: 'gold_price_base', width: 200,
            render: (_, record) => (`Rp${formatterNumber(record.gold_price_base ? record.gold_price_base : 0)}`)
        },
        { title: 'Harga Jual', dataIndex: 'gold_price_sell', key: 'gold_price_sell', width: 200,
            render: (_, record) => (`Rp${formatterNumber(record.gold_price_sell ? record.gold_price_sell : 0)}`)
        },
        { title: 'Harga Beli', dataIndex: 'gold_price_buy', key: 'gold_price_buy', width: 200,
            render: (_, record) => (`Rp${formatterNumber(record.gold_price_buy ? record.gold_price_buy : 0)}`)
        },
        { title: '', key: 'action', fixed: 'right', width:100,
          render: (_, record) =>
          (<div className='flex items-center gap-[5px] justify-center'>
            <Link href={`/master/gold/price/${record.gold_price_id}`} className="btn-action"><Edit05 /></Link>
            <a className='btn-action' onClick={() => deleteData(record.gold_price_id)}><Trash01 /></a>
        </div>)
        },
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
           gold_price_source__icontains: value,
        });
     };
     
     const deleteData = (id:number|undefined) => {
        if (id) {
            setSelectedId(id)
            setOpenModalConfirm(true)
        }
    }
    
    const confirmDelete = async () => {
        await axiosInstance.delete(`${url}${selectedId}/`);
        setOpenModalConfirm(false)
        setParams({
            ...params,
            offset: 0,
            limit: 10,
            gold_price_source__icontains: "",
         });
         api.info({
            message: 'Data Gold Price',
            description: "Data Gold Price Berhasil Dihapus",
            placement:'bottomRight',
        });
    }

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
        const dataToExport = rows.map((item: IGoldPrice, index:number) => ({
            'No' : index+1,
            'Gold Price Source': item.gold_price_source,
            'Gold Price Weight': item.gold_price_weight,
            'Gold Price Base': item.gold_price_base,
            'Gold Price Sell': item.gold_price_sell,
            'Gold Price Buy	': item.gold_price_buy,
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);

        worksheet["!cols"] = [ { wch: 5 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 } , { wch: 20 } ]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'gold price');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_gold_price.xlsx`)
        setIsModalLoading(false)
    }
    
    useEffect(() => {
        fetchData()
    }, [fetchData])
    return (
        <>
            {contextHolder}
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
                    <Link href={`/master/gold/price/form`} className="btn btn-outline-neutral"><Plus />Add data</Link>
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
                    rowKey="gold_price_id"
                
                />
                <div className='flex justify-end'>
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
                content='Hapus Data Ini?'
                onConfirm={confirmDelete}
            />
            <ModalLoading 
                isModalOpen={isModalLoading} 
                textInfo='Harap tunggu, data sedang diunduh' 
            />
        </>
  )
}

export default GoldPricePageTable
