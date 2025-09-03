import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanTabPage from '@/@core/pages/laporan/components/tab-page';
import LaporanStockView from '@/@core/pages/laporan/stock';
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
              <FolderOpenIcon /> Stock
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
            <p>Data Stock Emas Digital dan Fisik</p>
          </div>
        </div>
        <div className="main-body">
          <LaporanTabPage activeTab="stock" />
          <div className="flex flex-col gap-[10px]">
            <LaporanStockView />
          </div>
        </div>
      </div>
    </div>
  );
}
