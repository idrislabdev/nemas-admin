import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import AddressTabPage from "@/@core/pages/master/address/components/tab-page";
import AddressSubDistrictPageTable from "@/@core/pages/master/address/sub-district-page/table";

export default function AddressSubDistrictPage() {
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
                <li><FolderOpenIcon /> Sub District</li>
              </ul>
            </div>
          </div>
          <div className='container-body'>
            <div className='title-body'>
              <div className='logo-area'>
                <AboutOutlineIcon/>
              </div>
              <div className='text-area'>
                <h5>Halaman Sub District</h5>
                <p>Manajemen Data Sub District</p>
              </div>
            </div>
            <div className='main-body'>
                <AddressTabPage activeTab="sub_district" />
                <div className="flex flex-col gap-[10px]">
                    <AddressSubDistrictPageTable />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
