"use client"
import { IEducational } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import { PencilOutlineIcon, SearchIcon, TrashOutlineIcon } from '@/@core/my-icons'
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react'
import { Message, Pagination, useToaster } from 'rsuite';

const InformationEducataionalPageTable = () => {
    const url = `/core/information/educational/`
    const [dataTable, setDataTable] = useState<Array<IEducational>>([]);

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
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Information Name</th>
                        <th>Information Notes</th>
                        <th>Information URL</th>
                        <th>Information Background</th>
                        <th className='text-center'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        dataTable.map((item:IEducational, index:number) => (
                            <tr key={index}>
                                <td>{index+1}</td>
                                <td>{item.information_name}</td>
                                <td>{item.information_notes}</td>
                                <td>{item.information_url}</td>
                                <td>{item.information_background}</td>
                                <td className='text-center'>
                                    <div className='flex items-center gap-[5px] justify-center'>
                                        <a className='btn-action' onClick={() => deleteData(item.information_educational_id)}><TrashOutlineIcon /></a>
                                        <Link href={`/data/informations/customer-service/${item.information_educational_id}`} className="btn-action"><PencilOutlineIcon /></Link>
                                    </div>
                                </td>
                            </tr>
                    ))

                    }
                </tbody>
            </table>
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

export default InformationEducataionalPageTable
