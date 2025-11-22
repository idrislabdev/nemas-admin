import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import GadaiEmasTablePage from '@/@core/pages/laporan/gadai-emas';
import { Printer } from '@untitled-ui/icons-react';

export default function LaporanPinjamanEmasPage() {
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
              <FolderOpenIcon /> Gadai Emas
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
            <p>Gadai Emas</p>
          </div>
        </div>
        <div className="main-body">
          <hr />
          <div className="flex flex-col gap-[10px]">
            <GadaiEmasTablePage />
          </div>
        </div>
      </div>
    </div>
  );
}
