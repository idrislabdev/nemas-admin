import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import GoldTabPage from "@/@core/pages/master/gold/components/tab-page";
import GoldStockMovementPageTable from "@/@core/pages/master/gold/stock-movement/table";

export default function GoldStockMovementPage() {
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderOpenIcon /> Gold</li>
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
            <h5>Halaman Pergerakan Stok Emas</h5>
            <p>Manajemen Pergerakan Stok Emas</p>
          </div>
        </div>
        <div className='main-body'>
            <GoldTabPage activeTab="stock_movement" />
            <div className="flex flex-col gap-[10px]">
                <GoldStockMovementPageTable />
            </div>
        </div>
      </div>
    </div>
  );
}
