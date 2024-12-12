"use client"

import { IGoldPriceConfig } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useState } from 'react'
import { notification } from 'antd';

const GoldPriceConfigPageForm = (props: {paramsId:string}) => {
        const { paramsId } = props
    const url = `/core/gold/price_config`
    const [required, setRequired] = useState<IGoldPriceConfig>({} as IGoldPriceConfig);
    const [gpcCode, setGpcCode] = useState("");
    const [gpcDescription, setGpcDescription] = useState("");
    const [goldPriceWeight, setGoldPriceWeight] = useState("");
    const [goldPriceSettingModelBuyWeekday, setGoldPriceSettingModelBuyWeekday] = useState("");
    const [goldPriceSettingModelSellWeekday, setGoldPriceSettingModelSellWeekday] = useState("");
    const [goldPriceSettingModelBuyWeekend, setGoldPriceSettingModelBuyWeekend] = useState("");
    const [goldPriceSettingModelSellWeekend, setGoldPriceSettingModelSellWeekend] = useState("");
    const [gpcActive, setGpcActive] = useState('active');
    const [api, contextHolder] = notification.useNotification();

    const handleChangeActive = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setGpcActive(event.target.value)
    }

    const onSave = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const body = {
            "gpc_code": gpcCode,
            "gpc_description": gpcDescription,
            "gold_price_weight": parseInt(goldPriceWeight.toString().replace(/\./g, '')),
            "gold_price_setting_model_buy_weekday": goldPriceSettingModelBuyWeekday,
            "gold_price_setting_model_sell_weekday": goldPriceSettingModelSellWeekday,
            "gold_price_setting_model_buy_weekend": goldPriceSettingModelBuyWeekend,
            "gold_price_setting_model_sell_weekend": goldPriceSettingModelSellWeekend,
            "gpc_active": gpcActive === 'active' ? true : false,
            "create_user": user.name,
            "upd_user": user.name
        }
        setRequired({})
        try {
            let desc = '';
            if (paramsId == 'form') {
                await axiosInstance.post(`${url}/create`, body);
                desc = 'Data Gold Price Config Telah Disimpan'
                clearForm();
            } else {
                await axiosInstance.patch(`${url}/${paramsId}/`, body);
                desc = 'Data Gold Price Config Telah Diupdate'
            }
            api.info({
                message: 'Data Gold Price Config',
                description: desc,
                placement:'bottomRight',
            });
        } catch (error) {
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IGoldPriceConfig = err.response.data;
                setRequired(data)
            }
        }

    }

    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}/`);
        const { data } = resp
        setGpcCode(data.gpc_code);
        setGpcDescription(data.gpc_description);
        setGoldPriceSettingModelBuyWeekday(data.gold_price_setting_model_buy_weekday);
        setGoldPriceSettingModelSellWeekday(data.gold_price_setting_model_sell_weekday);
        setGoldPriceSettingModelBuyWeekend(data.gold_price_setting_model_buy_weekend);
        setGoldPriceSettingModelSellWeekend(data.gold_price_setting_model_sell_weekend);
        setGoldPriceWeight(data.gold_price_weight);
        setGpcActive(data.gpc_active ? "active" : "not_active")
    }
    
    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })

    const clearForm = () => {
        setGpcCode("");
        setGpcDescription("");
        setGoldPriceSettingModelBuyWeekday("");
        setGoldPriceSettingModelSellWeekday("");
        setGoldPriceSettingModelBuyWeekend("");
        setGoldPriceSettingModelSellWeekend("");
        setGoldPriceWeight("");
        setGpcActive("active")
    }

    return (
        <div className='form-input'>
            {contextHolder}
            <div className='flex items-start gap-[10px]'>
                <div className='form-area w-1/2'>
                    <div className='input-area'>
                        <label>Kode {required.gpc_code && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gpc_code?.toString()})</span>}</label>
                        <input 
                            value={gpcCode} 
                            onChange={e => setGpcCode(e.target.value)}  
                            className={`base ${required.gpc_code ? 'error' : ''}`} 
                        />
                    </div>
                    <div className='input-area'>
                        <label>Deskripsi {required.gpc_description && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gpc_description?.toString()})</span>}</label>
                        <input 
                            value={gpcDescription} 
                            onChange={e => setGpcDescription(e.target.value)} 
                            className={`base ${required.gpc_description ? 'error' : ''}`} 
                        />
                    </div>
                    {/* <div className='input-area'>
                        <label>Price Weight {required.gold_price_weight && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_weight?.toString()})</span>}</label>
                        <input 
                            value={goldPriceWeight} 
                            onChange={e => setGoldPriceWeight(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} 
                            className={`base ${required.gold_price_weight ? 'error' : ''}`} 
                        />
                    </div> */}
                    <div className='input-area'>
                        <label>Harga Beli (Hari Kerja) {required.gold_price_setting_model_buy_weekday && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_setting_model_buy_weekday?.toString()})</span>}</label>
                        <input 
                            value={goldPriceSettingModelBuyWeekday} 
                            onChange={e => setGoldPriceSettingModelBuyWeekday(e.target.value)}  
                            className={`base ${required.gold_price_setting_model_buy_weekday ? 'error' : ''}`}  
                        />
                    </div>
                    <div className='input-area'>
                        <label>Harga Jual (Hari Kerja) {required.gold_price_setting_model_sell_weekday && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_setting_model_sell_weekday?.toString()})</span>}</label>
                        <input 
                            value={goldPriceSettingModelSellWeekday} 
                            onChange={e => setGoldPriceSettingModelSellWeekday(e.target.value)} 
                            className={`base ${required.gold_price_setting_model_sell_weekday ? 'error' : ''}`}   
                        />
                    </div>
                </div>
                <div className='form-area  w-1/2'>
                    <div className='input-area'>
                        <label>Harga Beli (Hari Libur) {required.gold_price_setting_model_buy_weekend && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_setting_model_buy_weekend?.toString()})</span>}</label>
                        <input 
                            value={goldPriceSettingModelBuyWeekend} 
                            onChange={e => setGoldPriceSettingModelBuyWeekend(e.target.value)} 
                            className={`base ${required.gold_price_setting_model_buy_weekend ? 'error' : ''}`}   
                        />
                    </div>
                    <div className='input-area'>
                        <label>Harga Jual (Hari Libur) {required.gold_price_setting_model_sell_weekend && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_setting_model_sell_weekend?.toString()})</span>}</label>
                        <input 
                            value={goldPriceSettingModelSellWeekend} 
                            onChange={e => setGoldPriceSettingModelSellWeekend(e.target.value)}  
                            className={`base ${required.gold_price_setting_model_sell_weekend ? 'error' : ''}`}  
                        />
                    </div>
                    <div className='input-area'>
                        <label>Status {required.gpc_active && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gpc_active?.toString()})</span>}</label>
                        <select className='base' defaultValue={gpcActive} onChange={handleChangeActive}>
                            <option value={'active'}>Aktif</option>
                            <option value={'not_active'}>Tidak Aktif</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className='form-button'>
                <button className='btn btn-primary' onClick={() => onSave()}>Simpan</button>
            </div>
        </div>
    )
}

export default GoldPriceConfigPageForm
