'use client';

import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import DashboardPage from '@/@core/pages/dashboard';
import { PresentationChart01 } from '@untitled-ui/icons-react';

const Home = () => {
  return (
    <div className="main-container">
      <div className="container-header">
        <div className="breadcrumb-info">
          <ul>
            <li>
              <ArrowLeftIcon />
            </li>
            <li>
              <FolderIcon /> Home
            </li>
            <li>
              <FolderOpenIcon /> Dashboard
            </li>
          </ul>
        </div>
      </div>
      <div className="container-body">
        <div className="title-body">
          <div className="logo-area">
            <PresentationChart01 />
          </div>
          <div className="text-area">
            <h5>Halaman Home</h5>
            <p>Dashboard Nemas</p>
          </div>
        </div>
        <hr />
        <div className="main-body">
          <DashboardPage />
        </div>
      </div>
    </div>
  );
};

export default Home;
