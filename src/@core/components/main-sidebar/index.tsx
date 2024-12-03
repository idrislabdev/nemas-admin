"use client"

import { AboutOutlineIcon, BuildingOutlineIcon, UserListOutlineIcon, UserOutlineIcon } from '@/@core/my-icons'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const MainSidebar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState({name: "", email: ""});

  useEffect(() => {
    const tempUser = typeof window !== 'undefined'  ? JSON.parse(localStorage.getItem("user") || "{}") : {name: "", email: ""}
    setUser(tempUser)
  },[])

  return (
    <div className='main-sidebar'>
        <div className='header-area'>
            <div className='header-info'>
                <Image src='/images/main/nemas-logo.png' alt='logo nemas' width={0} height={0} sizes='100%'/>
                <div className='info-detail'>
                    <label>Nemas Admin</label>
                    <span>Company</span>
                </div>
            </div>
        </div>
        <div className='menu-area'>
            <span className='label'>Master</span>
            <div className='list-menu'>
                <ul>
                    <li className={`${pathname.split("/")[1] === 'master' && pathname.split("/")[2] == 'gold' ? 'active' : ''}`}><Link href='/master/gold'><AboutOutlineIcon />Gold</Link></li>
                    <li className={`${pathname.split("/")[1] === 'master' && pathname.split("/")[2] == 'address' ? 'active' : ''}`}><Link href='/master/address/province'><BuildingOutlineIcon />Address</Link></li>
                </ul>
            </div>
            <hr />
            <span className='label'>Data</span>
            <div className='list-menu'>
                <ul>
                    <li><Link href='/data/informations/customer-service'><UserListOutlineIcon />Information</Link></li>
                    <li><Link href=''><UserListOutlineIcon />Users</Link></li>
                    
                </ul>
            </div>
        </div>
        <div className='info-area'>
            <div className='user-info'>
                <span><UserOutlineIcon /></span>
                <div className='info-detail'>
                    <label>{user.name}</label>
                    <span>{user.email}</span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default MainSidebar
