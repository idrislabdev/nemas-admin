import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import TransaksiTabPage from '@/@core/pages/transaksi/components/tab-page';
import DaftarReturnEmasPage from '@/@core/pages/transaksi/return';
import { Coins01 } from '@untitled-ui/icons-react';

export default function ReturnPage() {
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
              <FolderIcon /> Transaksi
            </li>
            <li>
              <FolderOpenIcon /> Return
            </li>
          </ul>
        </div>
        <ProfileDropdown />
      </div>
      <div className="container-body">
        <div className="title-body">
          <div className="logo-area">
            <Coins01 />
          </div>
          <div className="text-area">
            <h5>Halaman Transaksi</h5>
            <p>Return</p>
          </div>
        </div>
        <div className="main-body">
          <TransaksiTabPage activeTab="return" />
          <div className="flex flex-col gap-[10px]">
            <DaftarReturnEmasPage />
          </div>
        </div>
      </div>
    </div>
  );
}
