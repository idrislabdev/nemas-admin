import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import PenggunaTabPage from '@/@core/pages/data/components/tab-page';
import DataPenggunaTokoPageTable from '@/@core/pages/data/pengguna/toko/table';

export default function PenggunaTokoPage() {
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
              <FolderOpenIcon /> Toko
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
            <h5>Halaman Pengguna</h5>
            <p>Manajemen Data Pengguna Toko</p>
          </div>
        </div>
        <div className="main-body">
          <PenggunaTabPage activeTab="toko" />
          <div className="flex flex-col gap-[10px] w-full h-full">
            <DataPenggunaTokoPageTable />
          </div>
        </div>
      </div>
    </div>
  );
}
