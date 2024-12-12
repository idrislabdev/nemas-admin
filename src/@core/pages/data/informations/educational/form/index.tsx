"use client"

import axiosInstance from '@/@core/utils/axios';
import Link from 'next/link';
import React, { useState } from 'react'
import { Message, useToaster } from 'rsuite';

const InformationEducationalPageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/information/educational`
    const [informationName, setInformationName] = useState("");
    const [informationUrl, setInformationUrl] = useState("");
    const [informationNotes, setInformationNotes] = useState("");
    const [informationBackground, setInformationBackgrounnd] = useState("");
    const toaster = useToaster();
    const [messageString, setMessageString] = useState("");
    const message = (
        <Message showIcon type={'info'}>
          {messageString}
        </Message>
    );
    const onSave = async () => {
        const body = {
            "information_name": informationName,
            "information_notes": informationNotes,
            "information_url": informationUrl,
            "information_background": informationBackground,
        }
      
        if (paramsId == 'form') {
            await axiosInstance.post(`${url}/create/`, body);
            await setMessageString("Data Educational Has Ben Saved")
            await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
            clearForm();
        } else {
            await axiosInstance.patch(`${url}/${paramsId}`, body);
            await setMessageString("Data Educational Has Ben Update")
            await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
        }
    }

    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}`);
        const { data } = resp
        setInformationName(data.information_name)
        setInformationUrl(data.information_url)
        setInformationNotes(data.information_notes)
        setInformationBackgrounnd(data.information_background)
    }

    const clearForm = () => {
        setInformationName("");
        setInformationUrl("");
        setInformationNotes("");
        setInformationBackgrounnd("");
    }

    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })
    return (
        <div className='form-input'>
            <div className='form-area'>
                <div className='input-area'>
                    <label>Information Name</label>
                    <input value={informationName} onChange={e => setInformationName(e.target.value)} className='base' />
                </div>
                <div className='input-area'>
                    <label>Information Notes</label>
                    <input value={informationNotes} onChange={e => setInformationNotes(e.target.value)} className='base' />
                </div>
                <div className='input-area'>
                    <label>Information URL</label>
                    <input value={informationUrl} onChange={e => setInformationUrl(e.target.value)} className='base' />
                </div>
                <div className='input-area'>
                    <label>Information Background</label>
                    <input value={informationBackground} onChange={e => setInformationBackgrounnd(e.target.value)} className='base' />
                </div>
            </div>
            <div className='form-button'>
                <Link href={`/ data/informations/educational`} className='btn btn-outline-secondary'>Cancel</Link>
                <button className='btn btn-primary' onClick={() => onSave()}>Simpan</button>
            </div>
        </div>
    )
}

export default InformationEducationalPageForm
