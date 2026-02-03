import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanLabaRugi from '@/@core/pages/laporan/laba-rugi';
import { Printer } from '@untitled-ui/icons-react';

export default function LaporanLabaRugiPage() {
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
              <FolderOpenIcon /> Pendapatan
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
            <p>Pendapatan</p>
          </div>
        </div>
        <div className="main-body">
          <div className="flex flex-col gap-[10px]">
            <LaporanLabaRugi />
          </div>
        </div>
      </div>
    </div>
  );
}
