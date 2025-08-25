import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
  UndoOutlineIcon,
} from '@/@core/my-icons';
import PengaturanTabpage from '@/@core/pages/payment/components/tab-page';
import AdminFeePageForm from '@/@core/pages/pengaturan/admin-fee/form';
import Link from 'next/link';

export default async function AddressCityForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsId = (await params).id;
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
                  <FolderOpenIcon /> Admin Fee
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
                <h5>Halaman Admin Fee</h5>
                <p>Manajemen Admin Fee</p>
              </div>
            </div>
            <div className="main-body">
              <PengaturanTabpage activeTab="admin_fee" />
              <div className="flex flex-col gap-[10px]">
                <div className="flex justify-end">
                  <Link
                    href={`/pengaturan/admin-fee`}
                    className="btn btn-outline-neutral"
                  >
                    <UndoOutlineIcon />
                    Kembali
                  </Link>
                </div>
                <AdminFeePageForm paramsId={paramsId} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
