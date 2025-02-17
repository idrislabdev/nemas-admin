import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import DataPenggunaPageTable from "@/@core/pages/data/pengguna/table";

export default function PenggunaPabge() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderOpenIcon /> Pengguna</li>
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
            <h5>Halaman Pengguna</h5>
            <p>Manajemen Data Pengguna</p>
          </div>
        </div>
        <div className='main-body'>
            <div className="flex flex-col gap-[10px] w-full h-full">
                <DataPenggunaPageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
