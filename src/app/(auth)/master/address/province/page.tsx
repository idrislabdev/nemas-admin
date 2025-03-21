import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import AddressTabPage from "@/@core/pages/master/address/components/tab-page";
import AddressProvincePageTable from "@/@core/pages/master/address/province-page/table";

export default function AddressProvincePage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Address</li>
            <li><FolderOpenIcon /> Province</li>
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
            <h5>Halaman Provinsi</h5>
            <p>Manajemen Data Provinsi</p>
          </div>
        </div>
        <div className='main-body'>
            <AddressTabPage activeTab="province" />
            <div className="flex flex-col gap-[10px]">
                <AddressProvincePageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
