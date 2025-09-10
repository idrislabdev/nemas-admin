import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import PengaturanTabpage from '@/@core/pages/pengaturan/components/tab-page';
import GoldPriceConfigPageTable from '@/@core/pages/pengaturan/gold-price-config/table';

export default function GoldCertPricePage() {
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
              <FolderOpenIcon /> Harga Emas
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
            <h5>Halaman Pengaturan Harga</h5>
            <p>Manajemen Pengatauran Harga Emas</p>
          </div>
        </div>
        <div className="main-body">
          <PengaturanTabpage activeTab="price_config" />
          <div className="flex flex-col gap-[10px]">
            <GoldPriceConfigPageTable />
          </div>
        </div>
      </div>
    </div>
  );
}
