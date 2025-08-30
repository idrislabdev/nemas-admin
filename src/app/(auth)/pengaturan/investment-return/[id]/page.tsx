import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
  UndoOutlineIcon,
} from '@/@core/my-icons';
import PengaturanTabpage from '@/@core/pages/pengaturan/components/tab-page';
import InvestmentReturnPageForm from '@/@core/pages/pengaturan/investment-return/form';
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
                  <FolderOpenIcon /> Investment Return
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
                <h5>Halaman Investment Return</h5>
                <p>Manajemen Investment Return</p>
              </div>
            </div>
            <div className="main-body">
              <PengaturanTabpage activeTab="investment_return" />
              <div className="flex flex-col gap-[10px]">
                <div className="flex justify-end">
                  <Link
                    href={`/pengaturan/investment-return`}
                    className="btn btn-outline-neutral"
                  >
                    <UndoOutlineIcon />
                    Kembali
                  </Link>
                </div>
                <InvestmentReturnPageForm paramsId={paramsId} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
