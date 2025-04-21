"use client"

import { IDeliveryPartner } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import Link from 'next/link';
import React, { useState } from 'react'
import { notification } from 'antd';
import ModalLoading from '@/@core/components/modal/modal-loading';

const DeliveryPartnerPageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/delivery_partner`
    const [deliveryPartnerName, setDeliveryPartnerName] = useState("");
    const [deliveryPartnerCode, setDeliveryPartnerCode] = useState("");
    const [deliveryPartnerDescription, setDeliveryPartnerDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    
    const [required, setRequired] = useState<IDeliveryPartner>({} as IDeliveryPartner);
    const [api, contextHolder] = notification.useNotification();
    const [isModalLoading, setIsModalLoading] = useState(false)

    const onSave = async () => {
        const body = {
            "delivery_partner_name": deliveryPartnerName,
            "delivery_partner_code": deliveryPartnerCode,
            "delivery_partner_description": deliveryPartnerDescription,
            "is_active": isActive
        }
        setRequired({})
        setIsModalLoading(true)
        try {
            let desc = "";
            if (paramsId == 'form') {
                desc = 'Data method Telah Disimpan'
                await axiosInstance.post(`${url}/create`, body);
                clearForm();
            } else {
                desc = 'Data method Telah Diupdate'
                await axiosInstance.patch(`${url}/${paramsId}`, body);
            }
            setIsModalLoading(false)
            api.info({
                message: 'Data method',
                description: desc,
                placement:'bottomRight',
            });
        } catch (error) {
            setIsModalLoading(false)
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IDeliveryPartner = err.response.data;
                setRequired(data)
            }
        }
        
    }
    
    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}`);
        const { data } = resp
        setDeliveryPartnerName(data.delivery_partner_name)
        setDeliveryPartnerCode(data.delivery_partner_code)
        setDeliveryPartnerDescription(data.delivery_partner_description)
        setIsActive(data.is_active)
    }

    const clearForm = () => {
        setDeliveryPartnerName("")
        setDeliveryPartnerCode("")
        setDeliveryPartnerDescription("")
        setIsActive(true)
    }

    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })
    return (
        <>
            {contextHolder}
            <div className='form-input'>
                <div className='form-area'>
                    <div className='input-area'>
                        <label>
                            Nama {required.delivery_partner_name && <span className='text-red-500 text-[10px]/[14px] italic'>({required.delivery_partner_name?.toString()})</span>}
                        </label>
                        <input 
                            value={deliveryPartnerName} 
                            onChange={e => setDeliveryPartnerName(e.target.value)} 
                            className={`base ${required.delivery_partner_name ? 'error' : ''}`}  
                        />
                    </div>
                    <div className='input-area'>
                        <label>
                            Kode {required.delivery_partner_code && <span className='text-red-500 text-[10px]/[14px] italic'>({required.delivery_partner_code?.toString()})</span>}
                        </label>
                        <input 
                            value={deliveryPartnerCode} 
                            onChange={e => setDeliveryPartnerCode(e.target.value)} 
                            className={`base ${required.delivery_partner_code ? 'error' : ''}`}  
                        />
                    </div>
                    <div className='input-area'>
                        <label>
                            Deskripsi {required.delivery_partner_description && <span className='text-red-500 text-[10px]/[14px] italic'>({required.delivery_partner_description?.toString()})</span>}
                        </label>
                        <textarea value={deliveryPartnerDescription} onChange={e => setDeliveryPartnerDescription(e.target.value)} className='base' />
                    </div>
                </div>
                <div className='form-button'>
                    <Link href={`/delivery/partner`} className='btn btn-outline-secondary'>Cancel</Link>
                    <button className='btn btn-primary' onClick={() => onSave()}>Simpan</button>
                </div>
            </div>
            <ModalLoading 
                isModalOpen={isModalLoading} 
                textInfo='Harap tunggu, data sedang diproses' 
            />
        </>
    )
}

export default DeliveryPartnerPageForm
