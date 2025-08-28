import Modal from 'rsuite/Modal';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Input, Select } from 'antd';
import axiosInstance from '@/@core/utils/axios';
import { IBank, IUserBank } from '@/@core/@types/interface';

const ModalBank = (props: {
        isModalOpen:boolean, 
        setIsModalOpen: Dispatch<SetStateAction<boolean>>,
        userBank:  IUserBank, 
        setUserBank: Dispatch<SetStateAction<IUserBank>>,
        setRefresData: Dispatch<SetStateAction<boolean>>,
        userId: string
    }) => {
    const { isModalOpen, setIsModalOpen, userBank, setUserBank, setRefresData, userId} = props
    const [options, setOptions] = useState<Array<IBank>>([])

    const save = async () => {
        const body = userBank;
        await axiosInstance.put(`users/admin/${userId}/bank`, body);
        setRefresData(true)
        setIsModalOpen(false)
    }

    const fetchData = useCallback(async () => {
        const resp = await axiosInstance.get(`/core/payment/bank/?offset=0&limit=200`);
        setOptions(resp.data.results)
    },[])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
        <Modal size="xs" dialogClassName="my-modal" backdropClassName="my-modal-backdrop" backdrop="static" keyboard={false} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Modal.Header>
                <Modal.Title>Update Data Bank</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='flex flex-col gap-[8px]'>
                    <div className='flex flex-col gap-[4px]'>
                        <label>Bank</label>
                        <Select
                            value={userBank.bank_account_code}
                            showSearch
                            size='small'
                            className="w-full select-base"
                            options={options?.map(
                                (option) => {
                                    return {
                                        value: option.bank_code,
                                        label: option.bank_name,
                                    };
                                }
                            )}
                            optionFilterProp="label"
                            onChange={e => setUserBank({...userBank, bank_account_code: e})}
                        />
                    </div>
                    <div className='flex flex-col gap-[4px]'>
                        <label>Nomor Rekening</label>
                        <Input 
                            value={userBank.bank_account_number}
                            type='text' 
                            size='small'
                            onChange={(e) => setUserBank({...userBank, bank_account_number: e.target.value})} 
                        />
                    </div>
                    <div className='flex flex-col gap-[4px]'>
                        <label>Atas Nama Rekening</label>
                        <Input 
                            value={userBank.bank_account_holder_name}
                            type='text' 
                            size='small'
                            onChange={(e) => setUserBank({...userBank, bank_account_holder_name: e.target.value})} 
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className='flex gap-2 justify-end'>
                    <button className='btn btn-outline-primary' onClick={() => setIsModalOpen(false)}>Batal</button>
                    <button className='btn btn-primary' onClick={() => save()}>Simpan</button>
                </div>
            </Modal.Footer>
      </Modal>
  )
}

export default ModalBank
