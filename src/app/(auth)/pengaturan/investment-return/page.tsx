import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import PengaturanTabpage from '@/@core/pages/pengaturan/components/tab-page';
import InvestmentReturnPageTable from '@/@core/pages/pengaturan/investment-return/table';

export default function PenggunaPage() {
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
              <FolderIcon /> Pengaturan
            </li>
            <li>
              <FolderOpenIcon /> Investment Return
            </li>
          </ul>
        </div>
        <ProfileDropdown />
      </div>
      <div className="container-body">
        <div className="title-body">
          <div className="logo-area">
            <AboutOutlineIcon />
          </div>
          <div className="text-area">
            <h5>Halaman Investment Return</h5>
            <p>Manajemen Investment Return</p>
          </div>
        </div>
        <div className="main-body">
          <PengaturanTabpage activeTab="investment_return" />
          <div className="flex flex-col gap-[10px] w-full h-full">
            <InvestmentReturnPageTable />
          </div>
        </div>
      </div>
    </div>
  );
}
