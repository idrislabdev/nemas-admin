import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon, UndoOutlineIcon } from "@/@core/my-icons";
import AddressTabPage from "@/@core/pages/master/address/components/tab-page";
import AddressPostalCodePageForm from "@/@core/pages/master/address/postal-code-page/form";
import Link from "next/link";

export default function AddressPostalCodeForm() {
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
                <li><FolderOpenIcon /> Postal Code</li>
              </ul>
            </div>
          </div>
          <div className='container-body'>
            <div className='title-body'>
              <div className='logo-area'>
                <AboutOutlineIcon/>
              </div>
              <div className='text-area'>
              <h5>Halaman Postal Code</h5>
              <p>Manajemen Data Postal Code</p>
              </div>
            </div>
            <div className='main-body'>
                <AddressTabPage activeTab="postal_code" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/master/address/postal-code`} className="btn btn-outline-neutral"><UndoOutlineIcon />Back To</Link>
                    </div>
                    <AddressPostalCodePageForm />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
