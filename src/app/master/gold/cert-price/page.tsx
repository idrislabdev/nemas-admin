import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, AddOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import GoldTabPage from "@/@core/pages/master/gold/components/tab-page";
import GoldCertPricePageTable from "@/@core/pages/master/gold/gold-cert-price-page/table";
import Link from "next/link";

export default function GoldCertPricePage() {
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
                <li><FolderIcon /> Gold</li>
                <li><FolderOpenIcon /> Cert Price</li>
              </ul>
            </div>
          </div>
          <div className='container-body'>
            <div className='title-body'>
              <div className='logo-area'>
                <AboutOutlineIcon/>
              </div>
              <div className='text-area'>
                <h5>Halaman Gold</h5>
                <p>Manajemen Data Gold</p>
              </div>
            </div>
            <div className='main-body'>
                <GoldTabPage activeTab="cert_price" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/master/gold/cert-price/form`} className="btn btn-outline-neutral"><AddOutlineIcon />Add data</Link>
                    </div>
                    <GoldCertPricePageTable />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
