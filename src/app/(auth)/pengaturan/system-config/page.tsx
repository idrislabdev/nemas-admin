import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import SystemConfigEditable from '@/@core/pages/pengaturan/system-config/table';
import PengaturanTabpage from '@/@core/pages/pengaturan/components/tab-page';

export default function SystemConfigPage() {
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
            <h5>Konfigurasi Sistem</h5>
            <p>Manajemen Konfigurasi Sistem</p>
          </div>
        </div>

        <div className="main-body">
          <PengaturanTabpage activeTab="system_config" />

          <div className="flex flex-col gap-[10px] w-full h-full">
            <SystemConfigEditable />
          </div>
        </div>
      </div>
    </div>
  );
}
