import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanTabGadaiPage from '@/@core/pages/laporan/components/tab-gadai-page';
import GadaiEmasRekapTablePage from '@/@core/pages/laporan/gadai-emas/rekap';
import { Printer } from '@untitled-ui/icons-react';

export default function LaporanPinjamanEmasRekapPage() {
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
              <FolderOpenIcon /> Rekapitulasi Gadai Aktif / User
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
            <p>Rekapitulasi Gadai Aktif / User</p>
          </div>
        </div>
        <div className="main-body">
          <LaporanTabGadaiPage activeTab="rekap" />
          <div className="flex flex-col gap-[10px]">
            <GadaiEmasRekapTablePage />
          </div>
        </div>
      </div>
    </div>
  );
}
