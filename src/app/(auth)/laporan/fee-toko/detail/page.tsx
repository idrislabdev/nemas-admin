import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanTabFeeTokoPage from '@/@core/pages/laporan/components/tab-fee-toko';
import SellerCommissionListPage from '@/@core/pages/laporan/fee-toko/list';
import { Printer } from '@untitled-ui/icons-react';

export default function LaporanSalesOrderPage() {
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
              <FolderOpenIcon /> Rekapitulasi Fee Toko
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
            <p>Rekapitulasi Fee Toko</p>
          </div>
        </div>
        <div className="main-body">
          <LaporanTabFeeTokoPage activeTab="detail" />
          <div className="flex flex-col gap-[10px]">
            <SellerCommissionListPage />
          </div>
        </div>
      </div>
    </div>
  );
}
