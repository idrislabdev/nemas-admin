import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import InformationsTabPage from "@/@core/pages/data/informations/components/tab-page";
import InformationRatingPageTable from "@/@core/pages/data/informations/rating/table";

export default function InformationRatingPage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Information</li>
            <li><FolderOpenIcon /> Rating</li>
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
            <h5>Halaman Rating</h5>
            <p>Manajemen Data Rating</p>
          </div>
        </div>
        <div className='main-body'>
            <InformationsTabPage activeTab="rating" />
            <div className="flex flex-col gap-[10px] h-full">
                <InformationRatingPageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
