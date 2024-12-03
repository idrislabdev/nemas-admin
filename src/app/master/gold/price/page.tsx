import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, AddOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import GoldTabPage from "@/@core/pages/master/gold/components/tab-page";
import GoldPricePageTable from "@/@core/pages/master/gold/gold-price-page/table";
import Link from "next/link";

export default function GoldPage() {
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
                <li><FolderOpenIcon /> Price</li>
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
                <GoldTabPage activeTab="price" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/master/gold/price/form`} className="btn btn-outline-neutral"><AddOutlineIcon />Add data</Link>
                    </div>
                    <GoldPricePageTable />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
