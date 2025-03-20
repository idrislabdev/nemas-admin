import ProfileDropdown from "@/@core/components/profile-dropdown";
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import PaymentTabPage from "@/@core/pages/payment/components/tab-page";
import PaymentMethodPageForm from "@/@core/pages/payment/payment-method/form";
import { BankNote01, FlipBackward } from "@untitled-ui/icons-react";
import Link from "next/link";

export default async function PaymentMethodForm({ params }: { params: Promise<{ id: string }>}) {
  const paramsId = (await params).id
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Information</li>
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
            <PaymentTabPage activeTab="payment_methhod" />
            <div className="flex flex-col gap-[10px]">
                <div className="flex justify-end">
                    <Link href={`/payment/payment-method`} className="btn btn-outline-neutral"><FlipBackward />Kembali</Link>
                </div>
                <PaymentMethodPageForm paramsId={paramsId} />
            </div>
        </div>
      </div>
    </div>
  );
}
