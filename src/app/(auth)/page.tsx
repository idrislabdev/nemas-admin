'use client';

import { ArrowLeftIcon, FolderIcon, FolderOpenIcon, HomeOutlineIcon } from "@/@core/my-icons";

const Home = () => {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderOpenIcon /> Dashboard</li>
          </ul>
        </div>
      </div>
      <div className='container-body'>
        <div className='title-body'>
          <div className='logo-area'>
            <HomeOutlineIcon />
          </div>
          <div className='text-area'>
            <h5>Halaman Home</h5>
            <p>Dashboard Aplikasi</p>
          </div>
        </div>
        <div className='main-body'>
        </div>
      </div>
    </div>
  );
}

export default Home
