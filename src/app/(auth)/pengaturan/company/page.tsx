import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import CompanyConfigTable from '@/@core/pages/pengaturan/company/table';
import PengaturanTabpage from '@/@core/pages/pengaturan/components/tab-page';

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
              <FolderOpenIcon /> Pengaturan
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
            <h5>Halaman Perusahaan</h5>
            <p>Manajemen Data Perusahaan</p>
          </div>
        </div>
        <div className="main-body">
          <PengaturanTabpage activeTab="company_config" />
          <div className="flex flex-col gap-[10px] w-full h-full">
            <CompanyConfigTable />
          </div>
        </div>
      </div>
    </div>
  );
}
