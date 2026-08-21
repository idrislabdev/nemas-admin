/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import axiosInstance from '../utils/axios';

const withAuthPage = (Pages: any) => {
  const WrappedComponent = (props: any) => {
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let mounted = true;

      const fetchUser = async () => {
        const accessToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('access_token')
            : null;

        const refreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('refresh_token')
            : null;

        /**
         * Tidak ada token sama sekali.
         */
        if (!accessToken || !refreshToken) {
          router.replace('/login');
          return;
        }

        try {
          /**
           * axiosInstance akan:
           *
           * 1. Menggunakan access token
           * 2. Jika 401 → refresh token
           * 3. Mendapatkan access token baru
           * 4. Retry request ini
           */
          const response = await axiosInstance.get('/users/me/');

          if (!mounted) {
            return;
          }

          const user = response.data;

          localStorage.setItem('user', JSON.stringify(user));

          setLoading(false);
        } catch (error) {
          console.error('Auth check failed:', error);

          if (!mounted) {
            return;
          }

          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');

          router.replace('/login');
        }
      };

      fetchUser();

      return () => {
        mounted = false;
      };
    }, [router]);

    if (loading) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
          <div className="loading">
            <div className="loading__bar w-11" />
          </div>
        </div>
      );
    }

    return <Pages {...props} />;
  };

  WrappedComponent.displayName = `withAuthPage(${
    Pages.displayName || Pages.name
  })`;

  return WrappedComponent;
};

export default withAuthPage;
