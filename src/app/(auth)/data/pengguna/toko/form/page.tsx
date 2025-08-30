import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
  UndoOutlineIcon,
} from '@/@core/my-icons';
import PenggunaTabPage from '@/@core/pages/data/components/tab-page';
import PenggunaTokoPageForm from '@/@core/pages/data/pengguna/toko/form';
import Link from 'next/link';

export default function AddressCityForm() {
  return (
    <main className="xadmin-page">
      <section className="xadmin-section">
        <div className="main-container">
          <div className="container-header">
            <div className="breadcrumb-info">
              <ul>
                <li>
                  <ArrowLeftIcon />
                </li>
                <li>
                  <FolderIcon /> Home
                </li>
                <li>
                  <FolderIcon /> Pengaturan
                </li>
                <li>
                  <FolderOpenIcon /> Admin
                </li>
              </ul>
            </div>
            <ProfileDropdown />
          </div>
          <div className="container-body">
            <div className="title-body">
              <div className="logo-area">
                <AboutOutlineIcon />
              </div>
              <div className="text-area">
                <h5>Halaman Pengguna Toko</h5>
                <p>Manajemen Data Pengguna Toko</p>
              </div>
            </div>
            <div className="main-body">
              <PenggunaTabPage activeTab="toko" />
              <div className="flex flex-col gap-[10px]">
                <div className="flex justify-end">
                  <Link
                    href={`/data/pengguna/toko`}
                    className="btn btn-outline-neutral"
                  >
                    <UndoOutlineIcon />
                    Kembali
                  </Link>
                </div>
                <PenggunaTokoPageForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
