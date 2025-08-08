import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import PenggunaTabPage from '@/@core/pages/data/components/tab-page';
import DataPenggunaPageTable from '@/@core/pages/data/pengguna/aplikasi/table';

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
              <FolderIcon /> Pengguna
            </li>
            <li>
              <FolderOpenIcon /> Aplikasi
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
            <h5>Halaman Pengguna Aplikasi</h5>
            <p>Manajemen Data Pengguna Aplikasi</p>
          </div>
        </div>
        <div className="main-body">
          <PenggunaTabPage activeTab="aplikasi" />
          <div className="flex flex-col gap-[10px] w-full h-full">
            <DataPenggunaPageTable />
          </div>
        </div>
      </div>
    </div>
  );
}
