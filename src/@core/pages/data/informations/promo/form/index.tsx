"use client"

import axiosInstance from '@/@core/utils/axios';
import Link from 'next/link';
import React, { useState } from 'react'
import { Message, useToaster } from 'rsuite';

const InformationPromoPageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/information/promo`
    const [promoCode, setPromoCode] = useState("");
    const [levelingUser, setLevelingUser] = useState("");
    const [promoName, setPromoName] = useState("");
    const [promoUrl, setPromoUrl] = useState("");
    const [promoStartDate, setPromoStartDate] = useState("");
    const [promoEndDate, setPromoEndDate] = useState("");
    const [promoTag, setPromoTag] = useState("");
    const [promoUrlBackground, setPromoUrlBackground] = useState("");
    const [promoDiskon, setPromoDiskon] = useState("");
    const [promoCashback, setPromoCashback] = useState("");
    const [promoCashbackTipeUser, setPromoCashbackTipeUser] = useState("");
    const [merchantCashback, setMerchantCasbhack] = useState("");

    const toaster = useToaster();
    const [messageString, setMessageString] = useState("");
    const message = (
        <Message showIcon type={'info'}>
          {messageString}
        </Message>
    );
    const onSave = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}")

        const body = {
            "promo_code": promoCode,
            "leveling_user": levelingUser,
            "promo_name": promoName,
            "promo_url": promoUrl,
            "promo_start_date": promoStartDate,
            "promo_end_date": promoEndDate,
            "promo_tag": promoTag,
            "promo_url_background": promoUrlBackground,
            "promo_diskon": promoDiskon,
            "promo_cashback": promoCashback,
            "promo_cashback_tipe_user": promoCashbackTipeUser,
            "merchant_cashback": merchantCashback,
            "create_user": user.name,
            "upd_user": user.name
        }
      
        if (paramsId == 'form') {
            await axiosInstance.post(`${url}/create/`, body);
            await setMessageString("Data Promo Has Ben Saved")
            await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
            clearForm();
        } else {
            await axiosInstance.patch(`${url}/${paramsId}`, body);
            await setMessageString("Data Promo Has Ben Update")
            await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
        }
    }

    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}`);
        const { data } = resp

        console.log(data)
    }

    const clearForm = () => {

    }

    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })
    return (
        <div className='form-input'>
            <div className='flex items-center gap-[10px]'>
                <div className='form-area w-1/2'>
                    <div className='input-area'>
                        <label>Promo Code</label>
                        <input value={promoCode} onChange={e => setPromoCode(e.target.value)} className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Leveling User</label>
                        <input value={levelingUser} onChange={e => setLevelingUser(e.target.value)} className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Promo Name</label>
                        <input value={promoName} onChange={e => setPromoName(e.target.value)} className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Promo URL</label>
                        <input value={promoUrl} onChange={e => setPromoUrl(e.target.value)} className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Promo Start Date</label>
                        <input value={promoStartDate} onChange={e => setPromoStartDate(e.target.value)} type='date' className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Promo End Date</label>
                        <input value={promoEndDate} onChange={e => setPromoEndDate(e.target.value)} type='date' className='base' />
                    </div>
                </div>

                <div className='form-area w-1/2'>
                    <div className='input-area'>
                        <label>Promo Tag</label>
                        <input value={promoTag} onChange={e => setPromoTag(e.target.value)} type='text' className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Promo URL Background</label>
                        <input value={promoUrlBackground} onChange={e => setPromoUrlBackground(e.target.value)} type='text' className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Promo Diskon</label>
                        <input value={promoDiskon} onChange={e => setPromoDiskon(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} type='text' className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Promo Cashback</label>
                        <input value={promoCashback} onChange={e => setPromoCashback(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} type='text' className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Promo Cashback Tipe User</label>
                        <input value={promoCashbackTipeUser} onChange={e => setPromoCashbackTipeUser(e.target.value)} type='text' className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Merchant Cashback</label>
                        <input value={merchantCashback} onChange={e => setMerchantCasbhack(e.target.value)} type='text' className='base' />
                    </div>
                </div>
            </div>
        
            <div className='form-button'>
                <Link href={`/ data/informations/promo`} className='btn btn-outline-secondary'>Cancel</Link>
                <button className='btn btn-primary' onClick={() => onSave()}>Simpan</button>
            </div>
        </div>
    )
}

export default InformationPromoPageForm
