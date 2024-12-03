'use client';

import MainSidebar from "@/@core/components/main-sidebar";
import withAuthPage from "@/@core/hoc/withAuthPage";
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon, HomeOutlineIcon } from "@/@core/my-icons";

const Home = () => {
  return (
    <main className='xadmin-page'>
      <MainSidebar />
      <section className='xadmin-section'>
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
      </section>
    </main>
  );
}

export default withAuthPage(Home)
