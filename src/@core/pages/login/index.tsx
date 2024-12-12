"use client";

import { Lock2Icon, UserIcon } from '@/@core/my-icons'
import axiosInstance from '@/@core/utils/axios';
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from '@untitled-ui/icons-react';

const LoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [type, setType] = useState(false)
    const [error, setError] = useState('');

    const onLogin = async () => {
        setError('');
        const body = {
            "identifier": email,
            "password": password
        }
        axiosInstance.post("/users/token/", body).
        then((response) => {
            const data = response.data;
            if (data) {
                localStorage.setItem("token", data.access)
                router.push("/")
            }

        })
        .catch((error) => {
            console.log(error)
            // setError(error.response.data.error);
            setError("Email Or Password Not Valid");
        });
    }

    useEffect(() => {
        const token = typeof window !== 'undefined'  ? localStorage.getItem("token") : undefined;
        if (token) {
            axiosInstance.get(`/users/me/`)
            .then(() => {
                router.replace("/")
            });
        }
    })
    return (
        <div className='login-container'>
            <div className='left-subcontainer'>
                <div className='logo-subcontainer'>
                    {/* <TrivIcon color={'#318AC6'}/> */}
                </div>
                <div className='title-subcontainer'>
                    <h1 className='select-none'>Selamat Datang</h1>
                    <p className='select-none'>Silahkan Login Untuk Masuk Halaman Admin</p>
                </div>
                <div className='form-subcontainer'>
                    {error !== '' &&  <label className='bg-red-500 text-white text-[14px]/[17px] h-[40px] flex flex-col justify-center items-center rounded-[4px]'>{error}</label>}
                    <div className='group-input prepend-append'>
                        <span className='append'><UserIcon /></span>
                        <input type='text' value={email} onChange={e => setEmail(e.target.value)} className='color-1' placeholder='email'/>
                    </div>
                    <div className='group-input prepend-append'>
                        <span className='append'><Lock2Icon /></span>
                        <span className='prepend'>
                            <a className='cursor-pointer' onClick={() => setType(!type)}>
                                {!type && <EyeOff /> }
                                {type && <Eye /> }
                            </a>
                        </span>
                        <input type={type ? 'password' : 'text'} value={password} onChange={e => setPassword(e.target.value)} className='color-1' placeholder='Password'/>
                    </div>
                    <div className='button-flex'>
                        <button onClick={() => onLogin()} disabled={email === '' || password === ''} className='disabled:!bg-blue-300'>Log In</button>
                    </div>
                </div>
            </div>
            <div className='right-subcontainer'>
                <div className='image-subcontainer'>
                    <Image src='/images/login/login-picture.png' alt='login-picture' width={0} height={0} sizes='100%'/>
                </div>
            </div>
        </div>
    )
}

export default LoginForm
