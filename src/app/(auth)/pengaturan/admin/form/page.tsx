import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
  UndoOutlineIcon,
} from '@/@core/my-icons';
import PengaturanTabpage from '@/@core/pages/payment/components/tab-page';
import AdminPageForm from '@/@core/pages/pengaturan/admin/form';
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
                <h5>Halaman Admin</h5>
                <p>Manajemen Data Admin</p>
              </div>
            </div>
            <div className="main-body">
              <PengaturanTabpage activeTab="admin" />
              <div className="flex flex-col gap-[10px]">
                <div className="flex justify-end">
                  <Link
                    href={`/pengaturan/admin`}
                    className="btn btn-outline-neutral"
                  >
                    <UndoOutlineIcon />
                    Kembali
                  </Link>
                </div>
                <AdminPageForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
