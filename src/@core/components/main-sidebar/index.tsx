'use client';

import {
  BankNote01,
  Building07,
  CreditCard01,
  CreditCard02,
  LogOut03,
  Settings01,
  Tag01,
  Truck01,
} from '@untitled-ui/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const MainSidebar = () => {
  const pathname = usePathname();
  // const [user, setUser] = useState({name: "", email: ""});

  const logOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  //   useEffect(() => {
  //     const tempUser = typeof window !== 'undefined'  ? JSON.parse(localStorage.getItem("user") || "{}") : {name: "", email: ""}
  //     setUser(tempUser)
  //   },[])

  return (
    <div className="main-sidebar">
      <div className="header-area">
        <div className="header-info">
          <Image
            src="/images/main/nemas-logo.png"
            alt="logo nemas"
            width={0}
            height={0}
            sizes="100%"
          />
          <label>Nemas Admin</label>
        </div>
      </div>
      <div className="menu-area">
        <span className="label">Master</span>
        <div className="list-menu">
          <ul>
            <li
              className={`${
                pathname.split('/')[1] === 'master' &&
                pathname.split('/')[2] == 'gold'
                  ? 'active'
                  : ''
              }`}
            >
              <Link href="/master/gold">
                <Tag01 />
                Data Emas
              </Link>
            </li>
            <li
              className={`${
                pathname.split('/')[1] === 'master' &&
                pathname.split('/')[2] == 'address'
                  ? 'active'
                  : ''
              }`}
            >
              <Link href="/master/address/province">
                <Building07 />
                Data Alamat
              </Link>
            </li>
            <li
              className={`${
                pathname.split('/')[1] === 'payment' ? 'active' : ''
              }`}
            >
              <Link href="/payment/bank">
                <BankNote01 />
                Data Payment
              </Link>
            </li>
            <li
              className={`${
                pathname.split('/')[1] === 'delivery' ? 'active' : ''
              }`}
            >
              <Link href="/delivery/partner">
                <Truck01 />
                Data Delivery
              </Link>
            </li>
            <li
              className={`${
                pathname.split('/')[1] === 'data' &&
                pathname.split('/')[2] == 'informations'
                  ? 'active'
                  : ''
              }`}
            >
              <Link href="/data/informations/customer-service">
                <CreditCard01 />
                Informasi
              </Link>
            </li>
            <li
              className={`${
                pathname.split('/')[1] === 'data' &&
                pathname.split('/')[2] == 'pengguna'
                  ? 'active'
                  : ''
              }`}
            >
              <Link href="/data/pengguna">
                <CreditCard02 />
                Pengguna
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="info-area">
        <div className="list-menu">
          <ul>
            <li className={`${pathname.split('/')[1] === 'pengaturan'}`}>
              <Link href={`/pengaturan/admin`}>
                <Settings01 />
                Pengaturan
              </Link>
            </li>
            <hr />
            <li>
              <a onClick={() => logOut()}>
                <LogOut03 />
                Keluar
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MainSidebar;
