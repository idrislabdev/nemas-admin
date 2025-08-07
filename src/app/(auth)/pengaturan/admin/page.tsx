import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import AdminPageTable from '@/@core/pages/pengaturan/admin/table';
import PengaturanTabpage from '@/@core/pages/payment/components/tab-page';

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
            <h5>Halaman Admin</h5>
            <p>Manajemen Data Admin</p>
          </div>
        </div>
        <div className="main-body">
          <PengaturanTabpage activeTab="admin" />
          <div className="flex flex-col gap-[10px] w-full h-full">
            <AdminPageTable />
          </div>
        </div>
      </div>
    </div>
  );
}
