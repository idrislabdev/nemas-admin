'use client';

import { Lock2Icon, UserIcon } from '@/@core/my-icons';
import axiosInstance from '@/@core/utils/axios';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from '@untitled-ui/icons-react';

const LoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password || loading) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/users/token/', {
        identifier: email,
        password,
      });

      const data = response.data;

      if (!data?.access || !data?.refresh) {
        throw new Error('Token login tidak lengkap');
      }

      // Simpan access dan refresh token
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Ambil profile menggunakan access token
      const profileResponse = await axiosInstance.get('/users/me/');
      const profile = profileResponse.data;

      if (profile.role_name === 'Admin') {
        localStorage.setItem('user', JSON.stringify(profile));

        router.replace('/');
        return;
      }

      // Bukan Admin
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      setError('Email Atau Password Tidak Valid');
    } catch (error) {
      console.error(error);

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      setError('Email Atau Password Tidak Valid');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onLogin();
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) {
      return;
    }

    axiosInstance
      .get('/users/me/')
      .then((response) => {
        const profile = response.data;

        if (profile.role_name === 'Admin') {
          localStorage.setItem('user', JSON.stringify(profile));
          router.replace('/');
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      });
  }, [router]);

  return (
    <div className="login-container">
      <div className="left-subcontainer">
        <div className="logo-subcontainer">
          {/* <TrivIcon color={'#318AC6'}/> */}
        </div>

        <div className="title-subcontainer">
          <h1 className="select-none">Selamat Datang</h1>

          <p className="select-none">
            Silahkan Login Untuk Masuk Halaman Admin
          </p>
        </div>

        <div className="form-subcontainer">
          {error !== '' && (
            <label className="bg-red-500 text-white text-[14px]/[17px] h-[40px] flex flex-col justify-center items-center rounded-[4px]">
              {error}
            </label>
          )}

          <div className="group-input prepend-append">
            <span className="append">
              <UserIcon />
            </span>

            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="color-1"
              placeholder="email"
              disabled={loading}
            />
          </div>

          <div className="group-input prepend-append">
            <span className="append">
              <Lock2Icon />
            </span>

            <span className="prepend">
              <a
                className="cursor-pointer"
                onClick={() => !loading && setType(!type)}
              >
                {!type && <EyeOff />}
                {type && <Eye />}
              </a>
            </span>

            <input
              type={!type ? 'password' : 'text'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="color-1"
              placeholder="Password"
              disabled={loading}
            />
          </div>

          <div className="button-flex">
            <button
              onClick={onLogin}
              disabled={email === '' || password === '' || loading}
              className="disabled:!bg-blue-300"
            >
              {loading ? 'Loading...' : 'Log In'}
            </button>
          </div>
        </div>
      </div>

      <div className="right-subcontainer">
        <div className="image-subcontainer">
          <Image
            src="/images/login/bg-login.png"
            alt="login-picture"
            width={0}
            height={0}
            sizes="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
