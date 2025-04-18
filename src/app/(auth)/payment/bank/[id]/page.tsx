import ProfileDropdown from "@/@core/components/profile-dropdown";
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import PaymentBankPageForm from "@/@core/pages/payment/bank/form";
import PaymentTabPage from "@/@core/pages/payment/components/tab-page";
import { BankNote01, FlipBackward } from "@untitled-ui/icons-react";
import Link from "next/link";

export default async function PaymentbankForm({ params }: { params: Promise<{ id: string }>}) {
  const paramsId = (await params).id
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Information</li>
            <li><FolderOpenIcon /> Data Bank</li>
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
            <h5>Halaman Bank</h5>
            <p>Manajemen Data Bank</p>
          </div>
        </div>
        <div className='main-body'>
            <PaymentTabPage activeTab="bank" />
            <div className="flex flex-col gap-[10px]">
                <div className="flex justify-end">
                    <Link href={`/payment/bank`} className="btn btn-outline-neutral"><FlipBackward />Kembali</Link>
                </div>
                <PaymentBankPageForm paramsId={paramsId} />
            </div>
        </div>
      </div>
    </div>
  );
}
