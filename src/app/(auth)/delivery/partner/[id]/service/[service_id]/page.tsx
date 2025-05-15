import ProfileDropdown from "@/@core/components/profile-dropdown";
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import DeliveryTabPage from "@/@core/pages/delivery/components/tab-page";
import DeliveryPartnerServicePageForm from "@/@core/pages/delivery/partner/service/form";
import { Truck01 } from "@untitled-ui/icons-react";

export default async  function DeliveryPartnerServiceFormPage({ params }: { params: Promise<{ id: string, service_id: string }>}) {
  const paramsId = (await params).id
  const paramsServiceId = (await params).service_id
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Delivery</li>
            <li><FolderIcon /> Data Partner</li>
            <li><FolderOpenIcon /> Service</li>
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
            <h5>Halaman Service Partner</h5>
            <p>Manajemen Data Delivery Service Partner</p>
          </div>
        </div>
        <div className='main-body'>
            <DeliveryTabPage activeTab="partner" />
            <div className="flex flex-col gap-[10px]">
                <DeliveryPartnerServicePageForm paramsId={paramsId} paramsServiceId={paramsServiceId} />
            </div>
        </div>
      </div>
    </div>
  );
}
