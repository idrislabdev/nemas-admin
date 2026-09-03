import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import PengaturanTabpage from '@/@core/pages/pengaturan/components/tab-page';
import UserTierPageTable from '@/@core/pages/pengaturan/user-tier/table';

export default function UserTierPage() {
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
              <FolderOpenIcon /> User Tier
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
            <h5>Halaman Pengaturan User Tier</h5>
            <p>Manajemen Pengaturan User Tier</p>
          </div>
        </div>
        <div className="main-body">
          <PengaturanTabpage activeTab="user_tier" />
          <div className="flex flex-col gap-[10px]">
            <UserTierPageTable />
          </div>
        </div>
      </div>
    </div>
  );
}
