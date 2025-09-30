import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import TransaksiTabPage from '@/@core/pages/transaksi/components/tab-page';
import ComEmasFisikPage from '@/@core/pages/transaksi/emas-fisik';
import { CoinsHand } from '@untitled-ui/icons-react';

export default function DeliveryOrderPage() {
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
              <FolderOpenIcon /> Penjualan Emas Fisik
            </li>
          </ul>
        </div>
        <ProfileDropdown />
      </div>
      <div className="container-body">
        <div className="title-body">
          <div className="logo-area">
            <CoinsHand />
          </div>
          <div className="text-area">
            <h5>Halaman Transaksi</h5>
            <p>Penjualan Emas Fisik</p>
          </div>
        </div>
        <div className="main-body">
          <TransaksiTabPage activeTab="emas_fisik" />
          <div className="flex flex-col gap-[10px]">
            <ComEmasFisikPage />
          </div>
        </div>
      </div>
    </div>
  );
}
