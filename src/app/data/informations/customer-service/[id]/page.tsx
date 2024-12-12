import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon, UndoOutlineIcon } from "@/@core/my-icons";
import InformationsTabPage from "@/@core/pages/data/informations/components/tab-page";
import InformationCustomerServicePageForm from "@/@core/pages/data/informations/customer-service/form";
import Link from "next/link";

export default async function InformationCustomerServiceForm({ params }: { params: Promise<{ id: string }>}) {
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
                <li><FolderIcon /> Information</li>
                <li><FolderOpenIcon /> Customer Service</li>
              </ul>
            </div>
          </div>
          <div className='container-body'>
            <div className='title-body'>
              <div className='logo-area'>
                <AboutOutlineIcon/>
              </div>
              <div className='text-area'>
                <h5>Halaman Customer Service</h5>
                <p>Manajemen Data Customer Service</p>
              </div>
            </div>
            <div className='main-body'>
                <InformationsTabPage activeTab="customer_service" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/data/informations/customer-service`} className="btn btn-outline-neutral"><UndoOutlineIcon />Kembali</Link>
                    </div>
                    <InformationCustomerServicePageForm paramsId={paramsId} />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
