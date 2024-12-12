import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon, UndoOutlineIcon } from "@/@core/my-icons";
import AddressTabPage from "@/@core/pages/master/address/components/tab-page";
import AddressProvincePageForm from "@/@core/pages/master/address/province-page/form";
import Link from "next/link";

export default function AddressProvinceForm() {
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
                <li><FolderIcon /> Address</li>
                <li><FolderOpenIcon /> Province</li>
              </ul>
            </div>
          </div>
          <div className='container-body'>
            <div className='title-body'>
              <div className='logo-area'>
                <AboutOutlineIcon/>
              </div>
              <div className='text-area'>
              <h5>Halaman Provinsi</h5>
              <p>Manajemen Data Provinsi</p>
              </div>
            </div>
            <div className='main-body'>
                <AddressTabPage activeTab="province" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/master/address/province`} className="btn btn-outline-neutral"><UndoOutlineIcon />Kembali</Link>
                    </div>
                    <AddressProvincePageForm />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
