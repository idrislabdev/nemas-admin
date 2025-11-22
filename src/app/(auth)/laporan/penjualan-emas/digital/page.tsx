import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanTabPenjualanPage from '@/@core/pages/laporan/components/tab-penjualan-page';
import LaporanGoldSellDigitalPage from '@/@core/pages/laporan/gold-sell';
import { Printer } from '@untitled-ui/icons-react';

export default function LaporanWalletPage() {
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
              <FolderIcon /> Laporan
            </li>
            <li>
              <FolderOpenIcon /> Penjualan Emas Digital
            </li>
          </ul>
        </div>
        <ProfileDropdown />
      </div>
      <div className="container-body">
        <div className="title-body">
          <div className="logo-area">
            <Printer />
          </div>
          <div className="text-area">
            <h5>Halaman Laporan</h5>
            <p>Penjualan Emas Digital</p>
          </div>
        </div>
        <div className="main-body">
          <LaporanTabPenjualanPage activeTab="digital" />
          <div className="flex flex-col gap-[10px]">
            <LaporanGoldSellDigitalPage />
          </div>
        </div>
      </div>
    </div>
  );
}
