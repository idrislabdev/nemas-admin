import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
  UndoOutlineIcon,
} from '@/@core/my-icons';
import InformationsTabPage from '@/@core/pages/data/informations/components/tab-page';
import GoldPromoPageForm from '@/@core/pages/data/informations/gold-promo/form';
import Link from 'next/link';

export default async function InformationPromoForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsId = (await params).id;

  return (
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
              <FolderIcon /> Information
            </li>
            <li>
              <FolderOpenIcon /> Promo Emas
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
            <h5>Halaman Promo Emas</h5>
            <p>Manajemen Data Promo Emas</p>
          </div>
        </div>
        <div className="main-body">
          <InformationsTabPage activeTab="gold_promo" />
          <div className="flex flex-col gap-[10px]">
            <div className="flex justify-end">
              <Link
                href={`/data/informations/gold-promo`}
                className="btn btn-outline-neutral"
              >
                <UndoOutlineIcon />
                Kembali
              </Link>
            </div>
            <GoldPromoPageForm paramsId={paramsId} />
          </div>
        </div>
      </div>
    </div>
  );
}
