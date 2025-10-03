import ProfileDropdown from '@/@core/components/profile-dropdown';
import { ArrowLeftIcon, FolderIcon, FolderOpenIcon } from '@/@core/my-icons';
import ComEmasFisikDeliveryPage from '@/@core/pages/transaksi/emas-fisik/delivery';
import { CoinsHand } from '@untitled-ui/icons-react';

export default async function TransaksiEmasFisikDelivery({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const paramsId = (await params).view;

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
                  <FolderIcon /> Transaksi
                </li>
                <li>
                  <FolderIcon /> Penjualan Emas Fisik
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
                <CoinsHand />
              </div>
              <div className="text-area">
                <h5>Halaman Transaksi</h5>
                <p>Penjualan Emas Fisik</p>
              </div>
            </div>
            <div className="main-body">
              <div className="flex flex-col gap-[10px] w-full h-full">
                <ComEmasFisikDeliveryPage paramsId={paramsId} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
