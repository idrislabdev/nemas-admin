import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import InformationsTabPage from "@/@core/pages/data/informations/components/tab-page";
import InformationEducataionalPageTable from "@/@core/pages/data/informations/educational/table";

export default function InformationEducationalPage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Informasi</li>
            <li><FolderOpenIcon /> FaQ</li>
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
            <h5>Halaman FaQ</h5>
            <p>Manajemen Data FaQ</p>
          </div>
        </div>
        <div className='main-body'>
            <InformationsTabPage activeTab="educational" />
            <div className="flex flex-col gap-[10px]">
                <InformationEducataionalPageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
