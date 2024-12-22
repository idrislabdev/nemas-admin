"use client"

import { Building07, CreditCard01, CreditCard02, LogOut03, Settings01, Tag01 } from '@untitled-ui/icons-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

const MainSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    // const [user, setUser] = useState({name: "", email: ""});

    const logOut = () => {
        localStorage.clear();
        router.push("/")
    }

//   useEffect(() => {
//     const tempUser = typeof window !== 'undefined'  ? JSON.parse(localStorage.getItem("user") || "{}") : {name: "", email: ""}
//     setUser(tempUser)
//   },[])

  return (
    <div className='main-sidebar'>
        <div className='header-area'>
            <div className='header-info'>
                <Image src='/images/main/nemas-logo.png' alt='logo nemas' width={0} height={0} sizes='100%'/>
                <label>Nemas Admin</label>
            </div>
        </div>
        <div className='menu-area'>
            <span className='label'>Master</span>
            <div className='list-menu'>
                <ul>
                    <li className={`${pathname.split("/")[1] === 'master' && pathname.split("/")[2] == 'gold' ? 'active' : ''}`}><Link href='/master/gold'><Tag01 />Data Emas</Link></li>
                    <li className={`${pathname.split("/")[1] === 'master' && pathname.split("/")[2] == 'address' ? 'active' : ''}`}><Link href='/master/address/province'><Building07 />Data Alamat</Link></li>
                    <li><Link href='/data/informations/customer-service'><CreditCard01 />Informasi</Link></li>
                    <li><Link href=''><CreditCard02 />Pengguna</Link></li>
                </ul>
            </div>
        </div>
        <div className='info-area'>
            <div className='list-menu'>
                <ul>
                    <li><a><Settings01 />Pengaturan</a></li>
                    <hr />
                    <li><a onClick={() => logOut()}><LogOut03 />Keluar</a></li>
                </ul>
            </div>
        </div>
    </div>
  )
}

export default MainSidebar
