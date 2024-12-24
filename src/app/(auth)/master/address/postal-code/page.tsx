import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import AddressTabPage from "@/@core/pages/master/address/components/tab-page";
import AddressPostalCodePageTable from "@/@core/pages/master/address/postal-code-page/table";

export default function AddressPostalCodePage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Address</li>
            <li><FolderOpenIcon /> Kode Pos</li>
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
            <h5>Halaman Kode Pos</h5>
            <p>Manajemen Data Kode Pos</p>
          </div>
        </div>
        <div className='main-body'>
            <AddressTabPage activeTab="postal_code" />
            <div className="flex flex-col gap-[10px]">
                {/* <div className="flex justify-end">
                    <Link href={`/master/address/postal-code/form`} className="btn btn-outline-neutral"><AddOutlineIcon />Add data</Link>
                </div> */}
                <AddressPostalCodePageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
