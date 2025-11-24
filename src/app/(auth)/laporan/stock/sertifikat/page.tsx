import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanTabStockPage from '@/@core/pages/laporan/components/tab-stock-page';
import SertifikatListPage from '@/@core/pages/laporan/stock/sertifikat-list';
import { Printer } from '@untitled-ui/icons-react';

export default function LaporanStockSertifikatPage() {
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
              <FolderOpenIcon /> Stock Sertifikat
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
            <p>Data Stock Sertifikat</p>
          </div>
        </div>
        <div className="main-body">
          <LaporanTabStockPage activeTab="stock_sertifikat" />
          <div className="flex flex-col gap-[10px]">
            <SertifikatListPage />
          </div>
        </div>
      </div>
    </div>
  );
}
