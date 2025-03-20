"use client"

import { IGold } from '@/@core/@types/interface';
// import axiosInstance from '@/@core/utils/axios';
import React, { useState } from 'react'
import { notification } from 'antd';
import CurrencyInput from 'react-currency-input-field';
import UploadGoldForm from '@/@core/components/forms/upload-gold-form';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
const GoldPageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/gold`
    const [goldWeight, setGoldWeight] = useState("0");
    const [type, setType] = useState("Bar");
    const [brand, setBrand] = useState("Marga Gold");
    const [certificateNumber, setCertficateNumber] = useState("");
    const [required, setRequired] = useState<IGold>({} as IGold);
    const [api, contextHolder] = notification.useNotification();
    const [isModalLoading, setIsModalLoading] = useState(false)

    const [goldImage1, setGoldImage1] = useState("");
    const [goldImage2, setGoldImage2] = useState("");
    const [goldImage3, setGoldImage3] = useState("");
    const [goldImage4, setGoldImage4] = useState("");
    const [goldImage5, setGoldImage5] = useState("");

    const [image1, setImage1] = useState<File | null>(null)
    const [image2, setImage2] = useState<File | null>(null)
    const [image3, setImage3] = useState<File | null>(null)
    const [image4, setImage4] = useState<File | null>(null)
    const [image5, setImage5] = useState<File | null>(null)
    
    // const axiosInstance = axios.create({
    //     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    //     timeout: 200000
    // })
    
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
        setIsModalLoading(true)
        setRequired({})
        try {
            let desc = '';
            if (paramsId == 'form') {
                const resp = await axiosInstance.post(`${url}/create`, body);
                const { data } = resp
                desc = 'Data Gold Telah Disimpan'

                if (image1 != null)
                    await uploadFile1(data.gold_id)
                if (image2 != null)
                    await uploadFile2(data.gold_id)
                if (image3 != null)
                    await uploadFile3(data.gold_id)
                if (image4 != null)
                    await uploadFile4(data.gold_id)
                if (image5 != null)
                    await uploadFile5(data.gold_id)

                clearForm();
            } else {
                await axiosInstance.patch(`${url}/${paramsId}/`, body);
                if (image1 != null)
                    await uploadFile1(paramsId)
                if (image2 != null)
                    await uploadFile2(paramsId)
                if (image3 != null)
                    await uploadFile3(paramsId)
                if (image4 != null)
                    await uploadFile4(paramsId)
                if (image5 != null)
                    await uploadFile5(paramsId)
                desc = 'Data Gold Telah Diupdate'
            }
            setIsModalLoading(false)
            api.info({
                message: 'Data Gold',
                description: desc,
                placement:'bottomRight',
            });
        } catch (error) {
            setIsModalLoading(false)
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
        setGoldImage1(data.gold_image_1);
        setGoldImage2(data.gold_image_2);
        setGoldImage3(data.gold_image_3);
        setGoldImage4(data.gold_image_4);
        setGoldImage5(data.gold_image_5);
        setCertficateNumber(data.certificate_number);
    }

    const uploadFile1 = async(id:string) => {
        if (image1 != null) {
            const body = new FormData();
            body.append('file', image1)
            body.append('gold_image_code', "image1")
            await axiosInstance.post(`${url}/upload/${id}/`, body);
        }
    }

    const uploadFile2 = async(id:string) => {
        if (image2 != null) {
            const body = new FormData();
            body.append('file', image2)
            body.append('gold_image_code', "image2")
            await axiosInstance.post(`${url}/upload/${id}/`, body);
        }
    }

    const uploadFile3 = async(id:string) => {
        if (image3 != null) {
            const body = new FormData();
            body.append('file', image3)
            body.append('gold_image_code', "image3")
            await axiosInstance.post(`${url}/upload/${id}/`, body);
        }
    }

    const uploadFile4 = async(id:string) => {
        if (image4 != null) {
            const body = new FormData();
            body.append('file', image4)
            body.append('gold_image_code', "image4")
            await axiosInstance.post(`${url}/upload/${id}/`, body);
        }
    }

    const uploadFile5 = async(id:string) => {
        if (image5 != null) {
            const body = new FormData();
            body.append('file', image5)
            body.append('gold_image_code', "image5")
            await axiosInstance.post(`${url}/upload/${id}/`, body);
        }
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
        <>
            <div className='form-input'>
                {contextHolder}
                <div className='form-area'>
                    <div className='flex gap-[20px]'>
                        <div className='input-area w-1/5'>
                            <label>Foto 1</label>
                            <UploadGoldForm 
                                index={1}
                                withFile={false} 
                                label='' 
                                isOptional={true}  
                                initFile={image1}
                                initUrl={goldImage1}
                                onChange={val => setImage1(val)} 
                            />
                        </div>
                        <div className='input-area w-1/5'>
                            <label>Foto 2</label>
                            <UploadGoldForm 
                                index={2}
                                withFile={false} 
                                label='' 
                                isOptional={true}  
                                initFile={image2}
                                initUrl={goldImage2}
                                onChange={val => setImage2(val)} 
                            />
                        </div>
                        <div className='input-area w-1/5'>
                            <label>Foto 3</label>
                            <UploadGoldForm 
                                index={3}
                                withFile={false} 
                                label='' 
                                isOptional={true}  
                                initFile={image3}
                                initUrl={goldImage3}
                                onChange={val => setImage3(val)} 
                            />
                        </div>
                        <div className='input-area w-1/5'>
                            <label>Foto 4</label>
                            <UploadGoldForm 
                                index={4}
                                withFile={false} 
                                label='' 
                                isOptional={true}  
                                initFile={image4}
                                initUrl={goldImage4}
                                onChange={val => setImage4(val)} 
                            />
                        </div><div className='input-area w-1/5'>
                            <label>Foto 5</label>
                            <UploadGoldForm 
                                index={5}
                                withFile={false} 
                                label='' 
                                isOptional={true}  
                                initFile={image5}
                                initUrl={goldImage5}
                                onChange={val => setImage5(val)} 
                            />
                        </div>
                    </div>
                    <hr className='my-[20px]'/>
                    <div className='input-area'>
                        <label>Berat Emas (gr) {required.gold_weight && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_weight?.toString()})</span>}</label>
                        <div className='group-input prepend'>
                            <span className='prepend !top-[5px]'>gr</span>
                            <CurrencyInput
                                value={goldWeight}
                                decimalsLimit={2}
                                decimalSeparator="," groupSeparator="." 
                                onValueChange={(value) => setGoldWeight(value ? value : "0")}
                                className={`base ${required.gold_weight ? 'error' : ''}`}  
                            />
                        </div>
                    </div>
                    <div className='input-area'>
                        <label>Tipe Emas {required.type && <span className='text-red-500 text-[10px]/[14px] italic'>({required.type?.toString()})</span>}</label>
                        <select className={`base ${required.type ? 'error' : ''}`} defaultValue={type} onChange={e => setType(e.target.value)} >
                            <option value={'Bar'}>Bar</option>
                            <option value={'Min Bar'}>Mint Bar</option>
                        </select>
                    </div>
                    <div className='input-area'>
                        <label>Merek Emas {required.brand && <span className='text-red-500 text-[10px]/[14px] italic'>({required.brand?.toString()})</span>}</label>
                        <select className={`base ${required.type ? 'error' : ''}`} defaultValue={brand} onChange={e => setBrand(e.target.value)} >
                            <option value={'Marga Gold'}>Marva Gold</option>
                            <option value={'Antam'}>Antam</option>
                        </select>
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
            <ModalLoading 
                isModalOpen={isModalLoading} 
                textInfo='Harap tunggu, data sedang diproses' 
            />
        </>
  )
}

export default GoldPageForm
