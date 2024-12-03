import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon, UndoOutlineIcon } from "@/@core/my-icons";
import GoldTabPage from "@/@core/pages/master/gold/components/tab-page";
import GoldCertPricePageForm from "@/@core/pages/master/gold/gold-cert-price-page/form";
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
                <GoldTabPage activeTab="price" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/master/gold/cert-price`} className="btn btn-outline-neutral"><UndoOutlineIcon />Back To</Link>
                    </div>
                    <GoldCertPricePageForm paramsId={paramsId}/>
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
