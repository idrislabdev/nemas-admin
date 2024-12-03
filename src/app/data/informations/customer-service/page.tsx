import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, AddOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import InformationsTabPage from "@/@core/pages/data/informations/components/tab-page";
import InformationCustomerServicePageTable from "@/@core/pages/data/informations/customer-service/table";
import Link from "next/link";

export default function InformationCustomerServicePage() {
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
                        <Link href={`/data/informations/customer-service/form`} className="btn btn-outline-neutral"><AddOutlineIcon />Add data</Link>
                    </div>
                    <InformationCustomerServicePageTable />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
