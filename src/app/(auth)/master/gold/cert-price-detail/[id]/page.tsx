import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import GoldTabPage from "@/@core/pages/master/gold/components/tab-page";
import GoldCertDetailPageForm from "@/@core/pages/master/gold/gold-cert-detail-page/form";
import { FlipBackward } from "@untitled-ui/icons-react";
import Link from "next/link";

export default async function GoldCertDetailForm({ params }: { params: Promise<{ id: string }>}) {
  const paramsId = (await params).id

  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Gold</li>
            <li><FolderOpenIcon /> Cert Price</li>
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
            <h5>Halaman Data Emas</h5>
            <p>Manajemen Data Gold</p>
          </div>
        </div>
        <div className='main-body'>
            <GoldTabPage activeTab="cert_price_detail" />
            <div className="flex flex-col gap-[10px]">
                <div className="flex justify-end">
                    <Link href={`/master/gold/cert-price-detail`} className="btn btn-outline-neutral"><FlipBackward />Kembali</Link>
                </div>
                <GoldCertDetailPageForm paramsId={paramsId}/>
            </div>
        </div>
      </div>
    </div>
  );
}
