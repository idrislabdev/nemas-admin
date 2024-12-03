"use client"
import { IGoldPrice } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import { PencilOutlineIcon, SearchIcon, TrashOutlineIcon } from '@/@core/my-icons'
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react'
import { Pagination } from 'rsuite';
import { Message, useToaster } from 'rsuite';

const GoldPricePageTable = () => {
    const url = `/core/gold/price/`
    const [dataTable, setDataTable] = useState<Array<IGoldPrice>>([]);
    const [activePage, setActivePage] = React.useState(1);
    const [total, setTotal] = useState(0);
    const [openModalConfirm, setOpenModalConfirm ] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        gold_price_source__icontains:"",
    });
    const toaster = useToaster();
    const message = (
        <Message showIcon type={'info'}>
          Data Gold Price Berhasil Dihapus
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
        await setOpenModalConfirm(false)
        setParams({
            ...params,
            offset: 0,
            limit: 10,
            gold_price_source__icontains: "",
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
                        <th>Gold Price Source</th>
                        <th>Gold Price Weight</th>
                        <th>Gold Price Base</th>
                        <th>Gold Price Sell</th>
                        <th>Gold Price Buy</th>
                        <th className='text-center'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        dataTable.map((item:IGoldPrice, index:number) => (
                            <tr key={index}>
                                <td>{index+1}</td>
                                <td>{item.gold_price_source}</td>
                                <td>{item.gold_price_weight}</td>
                                <td>{item.gold_price_base}</td>
                                <td>{item.gold_price_sell}</td>
                                <td>{item.gold_price_buy}</td>
                                <td className='text-center'>
                                    <div className='flex items-center gap-[5px] justify-center'>
                                        <a className='btn-action' onClick={() => deleteData(item.gold_price_id)}><TrashOutlineIcon /></a>
                                        <a className='btn-action'><PencilOutlineIcon /></a>
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
                content='Delete This Data?'
                onConfirm={confirmDelete}
            />
        </>
  )
}

export default GoldPricePageTable
