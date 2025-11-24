import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import LaporanTab3rdPage from '@/@core/pages/laporan/components/tab-3rd-page';
import Vendor3rdParty from '@/@core/pages/laporan/vendor-3rd/list';
import { Printer } from '@untitled-ui/icons-react';

export default function LaporanVendor3rdPage() {
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
              <FolderOpenIcon /> Vendor 3rd Party
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
            <p>Vendor 3rd Party</p>
          </div>
        </div>
        <div className="main-body">
          <LaporanTab3rdPage activeTab="list" />
          <div className="flex flex-col gap-[10px]">
            <Vendor3rdParty />
          </div>
        </div>
      </div>
    </div>
  );
}
