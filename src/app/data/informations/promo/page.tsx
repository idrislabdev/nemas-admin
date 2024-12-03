import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, AddOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import InformationsTabPage from "@/@core/pages/data/informations/components/tab-page";
import InformationPromoPageTable from "@/@core/pages/data/informations/promo/table";
import Link from "next/link";

export default function InformationPromoPage() {
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
                <li><FolderIcon /> Information</li>
                <li><FolderOpenIcon /> Promo</li>
              </ul>
            </div>
          </div>
          <div className='container-body'>
            <div className='title-body'>
              <div className='logo-area'>
                <AboutOutlineIcon/>
              </div>
              <div className='text-area'>
                <h5>Halaman Promo</h5>
                <p>Manajemen Data Promo</p>
              </div>
            </div>
            <div className='main-body'>
                <InformationsTabPage activeTab="promo" />
                <div className="flex flex-col gap-[10px] w-full h-full">
                    <div className="flex justify-end">
                        <Link href={`/data/informations/promo/form`} className="btn btn-outline-neutral"><AddOutlineIcon />Add data</Link>
                    </div>
                    <InformationPromoPageTable />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
