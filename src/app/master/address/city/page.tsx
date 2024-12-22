import MainSidebar from "@/@core/components/main-sidebar";
import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import AddressCityPageTable from "@/@core/pages/master/address/city-page/table";
import AddressTabPage from "@/@core/pages/master/address/components/tab-page";

export default function AddressCityPage() {
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
                <li><FolderOpenIcon /> City</li>
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
                <h5>Halaman City</h5>
                <p>Manajemen Data City</p>
              </div>
            </div>
            <div className='main-body'>
                <AddressTabPage activeTab="city" />
                <div className="flex flex-col gap-[10px]">
                    <AddressCityPageTable />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
