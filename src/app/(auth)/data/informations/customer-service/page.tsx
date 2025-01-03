import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import InformationsTabPage from "@/@core/pages/data/informations/components/tab-page";
import InformationCustomerServicePageTable from "@/@core/pages/data/informations/customer-service/table";

export default function InformationCustomerServicePage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Information</li>
            <li><FolderOpenIcon /> Pelayanan Pelanggan</li>
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
            <h5>Halaman Pelayanan Pelanggan</h5>
            <p>Manajemen Data Pelayanan Pelanggan</p>
          </div>
        </div>
        <div className='main-body'>
            <InformationsTabPage activeTab="customer_service" />
            <div className="flex flex-col gap-[10px]">
                <InformationCustomerServicePageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
