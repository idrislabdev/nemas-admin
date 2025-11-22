import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanGoldDigitalPage from '@/@core/pages/laporan/gold-buy';
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
              <FolderOpenIcon /> Pembelian Emas Digital
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
            <p>Pembelian Emas Digital</p>
          </div>
        </div>
        <div className="main-body">
          <hr />
          <div className="flex flex-col gap-[10px]">
            <LaporanGoldDigitalPage />
          </div>
        </div>
      </div>
    </div>
  );
}
