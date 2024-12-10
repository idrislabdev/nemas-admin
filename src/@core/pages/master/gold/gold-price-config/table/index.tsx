"use client"
import { IGoldPriceConfig } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react'
import { Pagination, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Edit05, FileDownload02, Plus, SearchSm, Trash01 } from '@untitled-ui/icons-react';
import Link from 'next/link';
import { notification } from 'antd';
import * as XLSX from "xlsx";

const GoldPriceConfigPageTable = () => {
    const url = `/core/gold/price_config/`
    const [dataTable, setDataTable] = useState<Array<IGoldPriceConfig>>([]);
    const [total, setTotal] = useState(0);
    const [openModalConfirm, setOpenModalConfirm ] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains:"",
    });
    const [api, contextHolder] = notification.useNotification();
    const columns: ColumnsType<IGoldPriceConfig>  = [
        { title: 'No', width: 70, dataIndex: 'gpc_id', key: 'gpc_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Code', dataIndex: 'gpc_code', key: 'gpc_code', width: 150},
        { title: 'Description', dataIndex: 'gpc_description', key: 'gpc_description', width: 150},
        { title: 'Price Weight', dataIndex: 'gold_price_weight', key: 'gold_price_weight', width: 150},
        { title: 'Price Buy Weekday', dataIndex: 'gold_price_setting_model_buy_weekday', key: 'gold_price_setting_model_buy_weekday', width: 150},
        { title: 'Price Sell Weekday', dataIndex: 'gold_price_setting_model_sell_weekday', key: 'gold_price_setting_model_sell_weekday', width: 150},
        { title: 'Price Buy Weekend', dataIndex: 'gold_price_setting_model_buy_weekend', key: 'gold_price_setting_model_buy_weekend', width: 150},
        { title: 'Price Sell Weekend', dataIndex: 'gold_price_setting_model_sell_weekend', key: 'gold_price_setting_model_sell_weekend', width: 150},
        { title: 'Status', dataIndex: 'gpc_active', key: 'gpc_active', width: 150, 
            render: (_, record) =>
                (record.gpc_active ? 'Active' : 'Not Active')
        },
        { title: 'Created By', dataIndex: 'create_user', key: 'create_user', width: 150},
        { title: 'Updated By', dataIndex: 'upd_user', key: 'upd_user', width: 150},
        { title: '', key: 'action', fixed: 'right', 
          render: (_, record) =>
          (<div className='flex items-center gap-[5px] justify-center'>
            <a className='btn-action' onClick={() => deleteData(record.gpc_id)}><Trash01 /></a>
            <Link href={`/master/gold/price-config/${record.gpc_id}`} className="btn-action"><Edit05 /></Link>
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
           type__icontains: value,
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
            type__icontains: "",
         });
        api.info({
            message: 'Data Gold Cert Price',
            description: "Data Gold Cert Price Berhasil Dihapus",
            placement:'bottomRight',
        });
    }

    const exportData = async () => {
        const param = {
            format: 'json',
            offset: 0,
            limit: 1000,
            type__icontains:"",
        }
        const resp = await axiosInstance.get(url, { params:param });
        const rows = resp.data.results;
        const dataToExport = rows.map((item: IGoldPriceConfig, index:number) => ({
            'No' : index+1,
            'Code': item.gpc_code,
            'Description': item.gpc_description,
            'Price Weight': item.gold_price_weight,
            'Price Buy Weekday': item.gold_price_setting_model_buy_weekday,
            'Price Sell Weekday': item.gold_price_setting_model_sell_weekday,
            'Price Buy Weekend': item.gold_price_setting_model_buy_weekend,
            'Price Sell Weekend': item.gold_price_setting_model_sell_weekend,
            'Status': item.gpc_active ? 'Active' : 'Not Active',
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);

        worksheet["!cols"] = [ { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 10 } ]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'price config');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_price_config.xlsx`)
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
                        placeholder='search data'
                        onChange={debounce(
                            (event) => handleFilter(event.target.value),
                            1000
                        )}
                    />
                </div>
                <div className='flex items-center gap-[4px]'>
                    <button className='btn btn-primary' onClick={exportData}><FileDownload02 />Export Excel</button>
                    <Link href={`/master/gold/price-config/form`} className="btn btn-outline-neutral"><Plus />Add data</Link>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={dataTable}
                size='small'
                scroll={{ x: 'max-content', y: 570 }}
                pagination={false}
                className='table-basic'
                rowKey="gpc_id"
            />
            <div className='flex justify-end'>
                <Pagination 
                    onChange={onChangePage} 
                    pageSize={params.limit}  
                    total={total} 
                    showSizeChanger={false}
                />
            </div>
            <ModalConfirm 
                isModalOpen={openModalConfirm} 
                setIsModalOpen={setOpenModalConfirm} 
                content='Hapus Data Ini?'
                onConfirm={confirmDelete}
            />
       </>
  )
}

export default GoldPriceConfigPageTable
