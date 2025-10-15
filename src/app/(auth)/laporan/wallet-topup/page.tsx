import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanTabPage from '@/@core/pages/laporan/components/tab-page';
import LaporanTopupPage from '@/@core/pages/laporan/top-up';
import { Printer } from '@untitled-ui/icons-react';

export default function LaporanStockPage() {
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
              <FolderOpenIcon /> TopUp Saldo
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
            <p>TopUp Saldo</p>
          </div>
        </div>
        <div className="main-body">
          <LaporanTabPage activeTab="wallet_topup" />
          <div className="flex flex-col gap-[10px]">
            <LaporanTopupPage />
          </div>
        </div>
      </div>
    </div>
  );
}
