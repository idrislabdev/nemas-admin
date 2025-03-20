import ProfileDropdown from "@/@core/components/profile-dropdown";
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import PaymentTabPage from "@/@core/pages/payment/components/tab-page";
import PaymentMethodPageTable from "@/@core/pages/payment/payment-method/table";
import { BankNote01 } from "@untitled-ui/icons-react";

export default function PaymentBanksPage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Payment</li>
            <li><FolderOpenIcon /> Data Method</li>
          </ul>
        </div>
        <ProfileDropdown />
      </div>
      <div className='container-body'>
        <div className='title-body'>
          <div className='logo-area'>
            <BankNote01/>
          </div>
          <div className='text-area'>
            <h5>Halaman Method</h5>
            <p>Manajemen Data Method</p>
          </div>
        </div>
        <div className='main-body'>
            <PaymentTabPage activeTab="payment_method" />
            <div className="flex flex-col gap-[10px]">
                <PaymentMethodPageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
