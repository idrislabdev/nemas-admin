import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import PaymentBankgPageTable from "@/@core/pages/payment/bank/table";
import PaymentTabPage from "@/@core/pages/payment/components/tab-page";

export default function PaymentBanksPage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Payment</li>
            <li><FolderOpenIcon /> Data Bank</li>
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
            <h5>Halaman Bank</h5>
            <p>Manajemen Data Bank</p>
          </div>
        </div>
        <div className='main-body'>
            <PaymentTabPage activeTab="bank" />
            <div className="flex flex-col gap-[10px]">
                <PaymentBankgPageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
