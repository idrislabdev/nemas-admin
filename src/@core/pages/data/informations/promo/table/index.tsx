"use client"
import { IPromo } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import { PencilOutlineIcon, SearchIcon, TrashOutlineIcon } from '@/@core/my-icons'
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import moment from 'moment';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react'
import { Message, Pagination, useToaster } from 'rsuite';

const InformationPromoPageTable = () => {
    const url = `/core/information/promo/`
    const [dataTable, setDataTable] = useState<Array<IPromo>>([]);

    const [activePage, setActivePage] = React.useState(1);
    const [total, setTotal] = useState(0);
    const [openModalConfirm, setOpenModalConfirm ] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains:"",
    });
    const toaster = useToaster();
    const message = (
        <Message showIcon type={'info'}>
          Data Educational Dihapus
        </Message>
    );

    const fetchData = useCallback(async () => {
        const resp = await axiosInstance.get(url, { params });
        setDataTable(resp.data.results)
        setTotal(resp.data.count)
    },[params, url])

    const onChangePage = async (val:number) => {
        setActivePage(val)
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
     
     const deleteData = (id:number) => {
        setSelectedId(id)
        setOpenModalConfirm(true)
    }
    
    const confirmDelete = async () => {
        await axiosInstance.delete(`${url}${selectedId}`);
        await setOpenModalConfirm(false)
        setParams({
            ...params,
            offset: 0,
            limit: 10,
            type__icontains: "",
         });
        await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
    }
    
    useEffect(() => {
        fetchData()
    }, [fetchData])
    

    return (
        <>
            <div className='group-input prepend-append'>
                <span className='append'><SearchIcon /></span>
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
            <div className='overflow-y-auto h-full'>
                <table className='table-fixed'>
                    <thead>
                        <tr>
                            <th className='w-[50px]'>No</th>
                            <th className='w-[100px]'>Code</th>
                            <th className='w-[150px]'>Leveling User</th>
                            <th className='w-[150px]'>Name</th>
                            <th className='w-[200px]'>URL</th>
                            <th className='w-[120px]'>Start Date</th>
                            <th className='w-[120px]'>End Date</th>
                            <th className='w-[120px]'>Tag</th>
                            <th className='w-[150px]'>URL Background</th>
                            <th className='w-[100px]'>Diskon</th>
                            <th className='w-[100px]'>Cashback</th>
                            <th className='w-[200px]'>Cashback Tipe User</th>
                            <th className='w-[200px]'>Merchant Cashback</th>
                            <th className='w-[150px]'>Crated At</th>
                            <th className='w-[150px]'>Crated By</th>
                            <th className='w-[150px]'>Updated At</th>
                            <th className='w-[150px]'>Updated By</th>
                            <th className='text-center w-[100px]'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            dataTable.map((item:IPromo, index:number) => (
                                <tr key={index}>
                                    <td>{index+1}</td>
                                    <td>{item.promo_code}</td>
                                    <td>{item.leveling_user}</td>
                                    <td>{item.promo_name}</td>
                                    <td>{item.promo_url}</td>
                                    <td>{moment(item.promo_start_date).format("DD-MM-YYYY")}</td>
                                    <td>{moment(item.promo_end_date).format("DD-MM-YYYY")}</td>
                                    <td>{item.promo_tag}</td>
                                    <td>{item.promo_url_background}</td>
                                    <td>{item.promo_diskon}</td>
                                    <td>{item.promo_cashback}</td>
                                    <td>{item.promo_cashback_tipe_user}</td>
                                    <td>{item.merchant_cashback}</td>
                                    <td>{moment(item.promo_end_date).format("HH:mm")}</td>
                                    <td>{item.createuser}</td>
                                    <td>{moment(item.updtime).format("HH:mm")}</td>
                                    <td>{item.upduser}</td>
                                    <td className='text-center'>
                                        <div className='flex items-center gap-[5px] justify-center'>
                                            <a className='btn-action' onClick={() => deleteData(item.information_promo_id)}><TrashOutlineIcon /></a>
                                            <Link href={`/data/informations/promo/${item.information_promo_id}`} className="btn-action"><PencilOutlineIcon /></Link>
                                        </div>
                                    </td>
                                </tr>
                        ))

                        }
                    </tbody>
                </table>
            </div>
            <div className='flex justify-end'>
                <Pagination 
                        prev={true}
                        next={true}
                        first={true}
                        last={true}
                        total={total} 
                        limit={params.limit} 
                        activePage={activePage} 
                        maxButtons={5}
                        onChangePage={e => onChangePage(e)} 
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

export default InformationPromoPageTable
