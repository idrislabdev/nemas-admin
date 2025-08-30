import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import PengaturanTabpage from '@/@core/pages/pengaturan/components/tab-page';
import AdminFeePageTable from '@/@core/pages/pengaturan/admin-fee/table';

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
              <FolderOpenIcon /> Admin Fee
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
            <h5>Halaman Admin Fee</h5>
            <p>Manajemen Admin Fee</p>
          </div>
        </div>
        <div className="main-body">
          <PengaturanTabpage activeTab="admin_fee" />
          <div className="flex flex-col gap-[10px] w-full h-full">
            <AdminFeePageTable />
          </div>
        </div>
      </div>
    </div>
  );
}
