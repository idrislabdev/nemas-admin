import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import GoldTabPage from "@/@core/pages/master/gold/components/tab-page";
import GoldPageTable from "@/@core/pages/master/gold/gold-page/table";

export default function GoldPage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderOpenIcon /> Gold</li>
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
            <h5>Halaman Data Emas</h5>
            <p>Manajemen Data Emas</p>
          </div>
        </div>
        <div className='main-body'>
            <GoldTabPage activeTab="gold" />
            <div className="flex flex-col gap-[10px]">
                <GoldPageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
