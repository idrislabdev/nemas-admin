import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import HistoryUserDetailTable from '@/@core/pages/laporan/history-user/detail';
import { Printer } from '@untitled-ui/icons-react';

export default async function PenggunaView({
  params,
}: {
  params: Promise<{ detail: string }>;
}) {
  const paramsId = (await params).detail;

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
                  <FolderIcon /> Laporan
                </li>
                <li>
                  <FolderIcon /> History User
                </li>
                <li>
                  <FolderOpenIcon /> Detail
                </li>
              </ul>
            </div>
            <ProfileDropdown />
          </div>
          <div className="container-body">
            <div className="title-body">
              <div className="logo-area">
                <Printer />
              </div>
              <div className="text-area">
                <h5>Halaman Laporan</h5>
                <p>Data History User</p>
              </div>
            </div>
            <div className="main-body">
              <hr />
              <div className="flex flex-col gap-[10px]">
                <HistoryUserDetailTable id={paramsId} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
