"use client"

import { ChevronDown, LogOut03, User01 } from '@untitled-ui/icons-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const ProfileDropdown = () => {
    const router = useRouter();
    const [show, setShow] = useState(false)
    const profileMenu = useRef<HTMLAnchorElement>(null);

    const logOut = () => {
        localStorage.clear();
        router.push("/")
    }

    useEffect(() => {
        function assertIsNode(e: EventTarget | null): asserts e is Node {
            if (!e || !("nodeType" in e)) {
                throw new Error(`Node expected`);
            }
        }
        
        function handleClick(event : MouseEvent) {
            assertIsNode(event.target);
            if (profileMenu.current && !profileMenu.current.contains(event.target)) {
                setShow(false);
            }
        }
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, [show]);
    return (
        <div className="profile-menu">
            <a className="profile-detail" ref={profileMenu} onClick={() => setShow(!show)}>
                <div className="detail-thumb">
                    <Image 
                        src='/images/profile-default.png' 
                        alt='profile image' 
                        width={0} 
                        height={0} 
                        sizes='100%'
                    />
                    <span>User Admin</span>
                </div>
                <span className={`my-icon icon-sm text-gray-500 transition-all duration-500 ${show ? 'transform rotate-180' : ''}`}><ChevronDown /></span>
            </a>
            <ul className={`profile-dropdown ${show ? 'show' : ''}`}>
                <li><a><span className='my-icon icon-sm'><User01 /></span>Profil</a></li>
                <hr/>
                <li><a onClick={() => logOut()}><span className='my-icon icon-sm'><LogOut03 /></span>Keluar</a></li>
            </ul>
        </div>
  )
}

export default ProfileDropdown