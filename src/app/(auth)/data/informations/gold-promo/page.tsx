import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import InformationsTabPage from "@/@core/pages/data/informations/components/tab-page";
import GoldPromoPageTable from "@/@core/pages/data/informations/gold-promo/table";

export default function InformationPromoPage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Informasi</li>
            <li><FolderOpenIcon /> Promo Emas</li>
          </ul>
        </div>
        <ProfileDropdown />
      </div>
      <div className='container-body'>
        <div className='title-body'>
          <div className='logo-area'>
            <AboutOutlineIcon/>
          </div>
          <div className='text-area'>
            <h5>Halaman Promo Emas</h5>
            <p>Manajemen Data Promo Emas</p>
          </div>
        </div>
        <div className='main-body'>
            <InformationsTabPage activeTab="gold_promo" />
            <div className="flex flex-col gap-[10px] w-full h-full">
                <GoldPromoPageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
