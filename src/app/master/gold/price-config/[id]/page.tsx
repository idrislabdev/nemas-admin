import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import GoldTabPage from "@/@core/pages/master/gold/components/tab-page";
import GoldPriceConfigPageForm from "@/@core/pages/master/gold/gold-price-config/form";
import { FlipBackward } from "@untitled-ui/icons-react";
import Link from "next/link";

export default async function GoldCertPriceForm({ params }: { params: Promise<{ id: string }>}) {
  const paramsId = (await params).id

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
                <li><FolderOpenIcon /> Price Config</li>
              </ul>
            </div>
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
                <GoldTabPage activeTab="price_config" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/master/gold/price-config`} className="btn btn-outline-neutral"><FlipBackward />Kembali</Link>
                    </div>
                    <GoldPriceConfigPageForm paramsId={paramsId}/>
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
