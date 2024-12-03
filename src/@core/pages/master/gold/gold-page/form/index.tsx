"use client"

import { IGold } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react'
import { Message, useToaster } from 'rsuite';

const GoldPageForm = () => {
    const [goldWeight, setGoldWeight] = useState("0");
    const [type, setType] = useState("");
    const [brand, setBrand] = useState("");
    const [certificateNumber, setCertficateNumber] = useState("");
    const toaster = useToaster();
    const [required, setRequired] = useState<IGold>({} as IGold);
    const message = (
        <Message showIcon type={'info'}>
          Data Gold Price Has Benn Saved
        </Message>
    );
    const onSave = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const body = {
            "gold_weight": parseInt(goldWeight.toString().replace(/\./g, '')),
            "type": type,
            "brand": brand,
            "certificate_number": certificateNumber,
            "create_user": user.name,
            "upd_user": user.name
        }
        setRequired({})
        try {
            await axiosInstance.post("/core/gold/create", body);
            await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
            clearForm();
        } catch (error) {
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IGold = err.response.data;
                setRequired(data)
            }
        }
        
    }
    
    useEffect(() => {
        console.log(required)
    }, [required])

    const clearForm = () => {
        setGoldWeight("");
        setType("");
        setBrand("");
        setCertficateNumber("");
    }

    return (
        <div className='form-input'>
            <div className='form-area'>
                <div className='input-area'>
                    <label>Gold Weight {required.gold_weight && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_weight?.toString()})</span>}</label>
                    <input value={goldWeight} onChange={e => setGoldWeight(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, "."))} className={`base ${required.gold_weight ? 'error' : ''}`} />
                </div>
                <div className='input-area'>
                    <label>Gold Type {required.type && <span className='text-red-500 text-[10px]/[14px] italic'>({required.type?.toString()})</span>}</label>
                    <input value={type} onChange={e => setType(e.target.value)} className={`base ${required.type ? 'error' : ''}`}  />
                </div>
                <div className='input-area'>
                    <label>Gold Brand {required.brand && <span className='text-red-500 text-[10px]/[14px] italic'>({required.brand?.toString()})</span>}</label>
                    <input value={brand} onChange={e => setBrand(e.target.value)} className={`base ${required.brand ? 'error' : ''}`} />
                </div>
                <div className='input-area'>
                    <label>Certificate Number {required.certificate_number && <span className='text-red-500 text-[10px]/[14px] italic'>({required.certificate_number?.toString()})</span>}</label>
                    <input value={certificateNumber} onChange={e => setCertficateNumber(e.target.value)}  className={`base ${required.certificate_number ? 'error' : ''}`} />
                </div>
            </div>
            <div className='form-button'>
                <button className='btn btn-outline-secondary'>Cancel</button>
                <button className='btn btn-primary' onClick={() => onSave()}>Save</button>
            </div>
        </div>
  )
}

export default GoldPageForm
