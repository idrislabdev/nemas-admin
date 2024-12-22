import MainSidebar from "@/@core/components/main-sidebar";
import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import AddressTabPage from "@/@core/pages/master/address/components/tab-page";
import AddressDistrictPageTable from "@/@core/pages/master/address/district-page/table";

export default function AddressDistrictPage() {
  return (
    <main className='xadmin-page'>
      <MainSidebar />
      <section className='xadmin-section'>
        <div className='main-container'>
          <div className='container-header'>
            <div className='breadcrumb-info'>
              <ul>
                <li><ArrowLeftIcon /></li>
                <li><FolderIcon /> Home</li>
                <li><FolderIcon /> Address</li>
                <li><FolderOpenIcon /> District</li>
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
                <h5>Halaman District</h5>
                <p>Manajemen Data District</p>
              </div>
            </div>
            <div className='main-body'>
                <AddressTabPage activeTab="district" />
                <div className="flex flex-col gap-[10px]">
                    <AddressDistrictPageTable />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
