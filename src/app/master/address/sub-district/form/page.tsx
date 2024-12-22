import MainSidebar from "@/@core/components/main-sidebar";
import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon, UndoOutlineIcon } from "@/@core/my-icons";
import AddressTabPage from "@/@core/pages/master/address/components/tab-page";
import AddressSubDistrictPageForm from "@/@core/pages/master/address/sub-district-page/form";
import Link from "next/link";

export default function AddressSubDistrictForm() {
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
                <li><FolderOpenIcon /> Sub District</li>
              </ul>
            </div>
            <ProfileDropdown />
          </div>
          <div className='container-body'>
            <div className='title-body'>
              <div className='logo-area'>
                <AboutOutlineIcon/>
              </div>
              <div className='text-area'>
              <h5>Halaman Sub District</h5>
              <p>Manajemen Data Sub District</p>
              </div>
            </div>
            <div className='main-body'>
                <AddressTabPage activeTab="sub_district" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/master/address/sub-district`} className="btn btn-outline-neutral"><UndoOutlineIcon />Kembali</Link>
                    </div>
                    <AddressSubDistrictPageForm />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
