'use client';

import { IUser } from '@/@core/@types/interface';
import { useGlobals } from '@/@core/hoc/useGlobals';
import {
  BankNote01,
  BarChartSquare01,
  Building07,
  CoinsHand,
  CreditCard01,
  LogOut03,
  Printer,
  Settings01,
  Tag01,
  Truck01,
  User01,
} from '@untitled-ui/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const MainSidebar = () => {
  const pathname = usePathname();
  // const [user, setUser] = useState({name: "", email: ""});
  const { globals, saveGlobals } = useGlobals();
  const [stateDone, setStateDone] = useState(false);

  const logOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  //   useEffect(() => {
  //     const tempUser = typeof window !== 'undefined'  ? JSON.parse(localStorage.getItem("user") || "{}") : {name: "", email: ""}
  //     setUser(tempUser)
  //   },[])
  const checkMenu = (name: string) => {
    return globals.userLogin.menus.some((x) => x.name === name && x.accessible);
  };
  useEffect(() => {
    if (!stateDone) {
      const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');
      saveGlobals({ ...globals, userLogin: user });
      setStateDone(true);
    }
  }, [globals, saveGlobals, stateDone, setStateDone]);

  return (
    <>
      {globals.userLogin && globals.userLogin.menus && (
        <div className="main-sidebar">
          <div className="header-area">
            <Link href={'/'} className="header-info cursor-pointer">
              <Image
                src="/images/main/nemas-logo.png"
                alt="logo nemas"
                width={0}
                height={0}
                sizes="100%"
              />
              <label>Nemas Admin</label>
            </Link>
          </div>
          <div className="menu-area">
            <div className="list-menu">
              <ul>
                <li
                  className={`${pathname.split('/')[1] === '' ? 'active' : ''}`}
                >
                  <Link href="/">
                    <BarChartSquare01 />
                    Dashboard
                  </Link>
                </li>
                {checkMenu('Data Emas') && (
                  <li
                    className={`${
                      pathname.split('/')[1] === 'master' &&
                      pathname.split('/')[2] == 'gold'
                        ? 'active'
                        : ''
                    }`}
                  >
                    <Link href="/master/gold/stock-movement">
                      <Tag01 />
                      Data Emas
                    </Link>
                  </li>
                )}
                {checkMenu('Data Alamat') && (
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
                )}
                {checkMenu('Data Payment') && (
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
                )}
                {checkMenu('Data Delivery') && (
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
                )}
                {checkMenu('Informasi') && (
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
                )}
                <li
                  className={`${
                    pathname.split('/')[1] === 'transaksi' ? 'active' : ''
                  }`}
                >
                  <Link href="/transaksi/emas-fisik">
                    <CoinsHand />
                    Daftar Transaksi
                  </Link>
                </li>
                {checkMenu('Pengguna') && (
                  <li
                    className={`${
                      pathname.split('/')[1] === 'data' &&
                      pathname.split('/')[2] == 'pengguna'
                        ? 'active'
                        : ''
                    }`}
                  >
                    <Link href="/data/pengguna/aplikasi">
                      <User01 />
                      Pengguna
                    </Link>
                  </li>
                )}
                {checkMenu('Laporan') && (
                  <li
                    className={`${
                      pathname.split('/')[1] === 'laporan' ? 'active' : ''
                    }`}
                  >
                    <Link href="/laporan/stock">
                      <Printer />
                      Laporan
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="info-area">
            <div className="list-menu">
              <ul>
                {checkMenu('Pengaturan') && (
                  <>
                    <li
                      className={`${
                        pathname.split('/')[1] === 'pengaturan' ? 'active' : ''
                      }`}
                    >
                      <Link href={`/pengaturan/admin`}>
                        <Settings01 />
                        Pengaturan
                      </Link>
                    </li>
                    <hr />
                  </>
                )}
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
      )}
    </>
  );
};

export default MainSidebar;
