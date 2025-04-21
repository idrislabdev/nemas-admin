import ProfileDropdown from "@/@core/components/profile-dropdown";
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import DeliveryTabPage from "@/@core/pages/delivery/components/tab-page";
import DeliveryPartnerPageTable from "@/@core/pages/delivery/partner/table";
import { Truck01 } from "@untitled-ui/icons-react";

export default function DeliveryPartnerPage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Delivery</li>
            <li><FolderOpenIcon /> Data Partner</li>
          </ul>
        </div>
        <ProfileDropdown />
      </div>
      <div className='container-body'>
        <div className='title-body'>
          <div className='logo-area'>
            <Truck01/>
          </div>
          <div className='text-area'>
            <h5>Halaman Delivery</h5>
            <p>Manajemen Data Delivery Partner</p>
          </div>
        </div>
        <div className='main-body'>
            <DeliveryTabPage activeTab="partner" />
            <div className="flex flex-col gap-[10px]">
                <DeliveryPartnerPageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
