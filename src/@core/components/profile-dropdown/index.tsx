'use client';

import { IUser } from '@/@core/@types/interface';
import ModalChangePassword from '@/@core/components/modal/modal-change-password';
import { ChevronDown, Key01, LogOut03 } from '@untitled-ui/icons-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

const ProfileDropdown = () => {
  const [show, setShow] = useState(false);
  const [openModalPassword, setOpenModalPassword] = useState(false);
  const profileMenu = useRef<HTMLAnchorElement>(null);
  const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');
  const logOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  useEffect(() => {
    function assertIsNode(e: EventTarget | null): asserts e is Node {
      if (!e || !('nodeType' in e)) {
        throw new Error(`Node expected`);
      }
    }

    function handleClick(event: MouseEvent) {
      assertIsNode(event.target);
      if (profileMenu.current && !profileMenu.current.contains(event.target)) {
        setShow(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [show]);
  return (
    <>
      <div className="profile-menu">
        <a
          className="profile-detail"
          ref={profileMenu}
          onClick={() => setShow(!show)}
        >
          <div className="detail-thumb">
            <Image
              src="/images/profile-default.png"
              alt="profile image"
              width={0}
              height={0}
              sizes="100%"
            />
            <span>{user.name}</span>
          </div>
          <span
            className={`my-icon icon-sm text-gray-500 transition-all duration-500 ${show ? 'transform rotate-180' : ''}`}
          >
            <ChevronDown />
          </span>
        </a>
        <ul className={`profile-dropdown ${show ? 'show' : ''}`}>
          <li>
            <a onClick={() => setOpenModalPassword(true)}>
              <span className="my-icon icon-sm">
                <Key01 />
              </span>
              Ganti Password
            </a>
          </li>
          <hr />
          <li>
            <a onClick={() => logOut()}>
              <span className="my-icon icon-sm">
                <LogOut03 />
              </span>
              Keluar
            </a>
          </li>
        </ul>
      </div>
      <ModalChangePassword
        isModalOpen={openModalPassword}
        setIsModalOpen={setOpenModalPassword}
      />
    </>
  );
};

export default ProfileDropdown;
