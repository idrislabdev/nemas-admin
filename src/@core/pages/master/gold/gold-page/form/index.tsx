"use client"

import { IGold } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useState } from 'react'
import { notification } from 'antd';
const GoldPageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/gold`
    const [goldWeight, setGoldWeight] = useState("0");
    const [type, setType] = useState("");
    const [brand, setBrand] = useState("");
    const [certificateNumber, setCertficateNumber] = useState("");
    const [required, setRequired] = useState<IGold>({} as IGold);
    const [api, contextHolder] = notification.useNotification();

    const onSave = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const body = {
            "gold_weight": parseFloat(goldWeight.toString().replace('.', '').replace(',', '.')),
            "type": type,
            "brand": brand,
            "certificate_number": certificateNumber,
            "create_user": user.name,
            "upd_user": user.name
        }
        setRequired({})
        try {
            let desc = '';
            if (paramsId == 'form') {
                await axiosInstance.post(`${url}/create`, body);
                desc = 'Data Gold Telah Disimpan'
                clearForm();
            } else {
                await axiosInstance.patch(`${url}/${paramsId}/`, body);
                desc = 'Data Gold Telah Diupdate'
            }
            api.info({
                message: 'Data Gold',
                description: desc,
                placement:'bottomRight',
            });
        } catch (error) {
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IGold = err.response.data;
                setRequired(data)
            }
        }
        
    }

    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}/`);
        const { data } = resp
        setGoldWeight(data.gold_weight.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
        setType(data.type);
        setBrand(data.brand);
        setCertficateNumber(data.certificate_number);
    }
    
    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })

    const clearForm = () => {
        setGoldWeight("");
        setType("");
        setBrand("");
        setCertficateNumber("");
    }

    return (
        <div className='form-input'>
            {contextHolder}
            <div className='form-area'>
                <div className='input-area'>
                    <label>Berat Emas (gr) {required.gold_weight && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_weight?.toString()})</span>}</label>
                    <div className='group-input prepend'>
                        <span className='prepend !top-[5px]'>gr</span>
                        <input 
                            value={goldWeight} 
                            onChange={e => setGoldWeight(e.target.value
                                .replace(/(?!\,)\D/g, '')
                                .replace(/(?<=\,,*)\,/g, '')
                                .replace(/(?<=\,\d\d).*/g, '')
                                .replace(/\B(?=(\d{3})+(?!\d))/g, '.'))} 
                            className={`base ${required.gold_weight ? 'error' : ''}`} 
                        />
                    </div>
                </div>
                <div className='input-area'>
                    <label>Tipe Emas {required.type && <span className='text-red-500 text-[10px]/[14px] italic'>({required.type?.toString()})</span>}</label>
                    <input value={type} onChange={e => setType(e.target.value)} className={`base ${required.type ? 'error' : ''}`}  />
                </div>
                <div className='input-area'>
                    <label>Merek Emas {required.brand && <span className='text-red-500 text-[10px]/[14px] italic'>({required.brand?.toString()})</span>}</label>
                    <input value={brand} onChange={e => setBrand(e.target.value)} className={`base ${required.brand ? 'error' : ''}`} />
                </div>
                <div className='input-area'>
                    <label>Nomor Sertifikat {required.certificate_number && <span className='text-red-500 text-[10px]/[14px] italic'>({required.certificate_number?.toString()})</span>}</label>
                    <input value={certificateNumber} onChange={e => setCertficateNumber(e.target.value)}  className={`base ${required.certificate_number ? 'error' : ''}`} />
                </div>
            </div>
            <div className='form-button'>
                <button className='btn btn-primary' onClick={() => onSave()}>Simpan</button>
            </div>
        </div>
  )
}

export default GoldPageForm
