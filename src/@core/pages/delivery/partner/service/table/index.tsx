"use client"
import { IDeliveryPartnerService } from '@/@core/@types/interface';
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
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
// import Image from 'next/image';
moment.locale('id')

const DeliveryPartnerServicePageTable = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/delivery_partner/service/?delivery_partner=${paramsId}`
    const [dataTable, setDataTable] = useState<Array<IDeliveryPartnerService>>([]);
    const [total, setTotal] = useState(0);
    const [openModalConfirm, setOpenModalConfirm ] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    const [isModalLoading, setIsModalLoading] = useState(false)
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains:"",
    });
    const [api, contextHolder] = notification.useNotification();
    const columns: ColumnsType<IDeliveryPartnerService>  = [
        { title: 'No', width: 70, dataIndex: 'payment_id', key: 'payment_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Nama', dataIndex: 'delivery_partner_service_name', key: 'delivery_partner_service_name'},
        { title: 'Code', dataIndex: 'delivery_partner_service_code', key: 'delivery_partner_code'},
        { title: 'Deskripsi', dataIndex: 'delivery_partner_service_description', key: 'delivery_partner_service_description', width: 150},
        { title: '', key: 'action', fixed: 'right', width:100,
          render: (_, record) =>
          (<div className='flex items-center gap-[5px] justify-center'>
            <Link href={`/delivery/partner/${record.delivery_partner}/service/${record.delivery_partner_service_id}`} className="btn-action"><Edit05 /></Link>
            <a className='btn-action' onClick={() => deleteData(record.delivery_partner_service_id)}><Trash01 /></a>
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
        await axiosInstance.delete(`/core/delivery_partner/service/${selectedId}`);
        setOpenModalConfirm(false)
        setParams({
            ...params,
            offset: 0,
            limit: 10,
            type__icontains: "",
         });
        api.info({
            message: 'Data Delivery Partner',
            description: "Data Delivery Partner Berhasil Dihapus",
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
        const dataToExport = rows.map((item: IDeliveryPartnerService, index:number) => ({
            'No' : index+1,
            'Nama': item.delivery_partner_service_name,
            'Code': item.delivery_partner_service_code,
            'Deskripsi': item.delivery_partner_service_description,
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        const colA = 5;
        const colB = 10;
        const colC = rows.reduce((w:number, r:IDeliveryPartnerService) => Math.max(w, r.delivery_partner_service_name ? r.delivery_partner_service_name.length : 10), 10);
        const colD = rows.reduce((w:number, r:IDeliveryPartnerService) => Math.max(w, r.delivery_partner_service_code ? r.delivery_partner_service_code.length : 10), 10);
        const colE = rows.reduce((w:number, r:IDeliveryPartnerService) => Math.max(w, r.delivery_partner_service_description ? r.delivery_partner_service_description.length : 10), 10);

        worksheet["!cols"] = [ { wch: colA }, { wch: colB }, { wch: colC }, { wch: colD }, { wch: colE }, { wch: 20 }  ]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'faq');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_delivery_partner.xlsx`)
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
                <Link href={`/delivery/partner/${paramsId}/service/form`} className="btn btn-outline-neutral"><Plus />Add data</Link>
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
                rowKey="payment_method_id"
            
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

export default DeliveryPartnerServicePageTable
