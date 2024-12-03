import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon, UndoOutlineIcon } from "@/@core/my-icons";
import AddressCityPageForm from "@/@core/pages/master/address/city-page/form";
import AddressTabPage from "@/@core/pages/master/address/components/tab-page";
import Link from "next/link";

export default function AddressCityForm() {
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
                <li><FolderOpenIcon /> City</li>
              </ul>
            </div>
          </div>
          <div className='container-body'>
            <div className='title-body'>
              <div className='logo-area'>
                <AboutOutlineIcon/>
              </div>
              <div className='text-area'>
              <h5>Halaman City</h5>
              <p>Manajemen Data City</p>
              </div>
            </div>
            <div className='main-body'>
                <AddressTabPage activeTab="city" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/master/address/city`} className="btn btn-outline-neutral"><UndoOutlineIcon />Back To</Link>
                    </div>
                    <AddressCityPageForm />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
