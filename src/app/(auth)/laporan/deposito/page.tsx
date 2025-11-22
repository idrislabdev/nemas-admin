import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanTabDepositoPage from '@/@core/pages/laporan/components/tab-deposito-page';
import LaporanGoldInvestment from '@/@core/pages/laporan/deposito';
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
              <FolderOpenIcon /> Deposito
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
            <p>Deposito</p>
          </div>
        </div>
        <div className="main-body">
          <LaporanTabDepositoPage activeTab="gold_investment" />
          <div className="flex flex-col gap-[10px]">
            <LaporanGoldInvestment />
          </div>
        </div>
      </div>
    </div>
  );
}
