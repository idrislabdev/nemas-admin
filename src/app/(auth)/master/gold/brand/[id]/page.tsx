import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
  UndoOutlineIcon,
} from '@/@core/my-icons';
import BrandPageForm from '@/@core/pages/master/gold/brand/form';
import GoldTabPage from '@/@core/pages/master/gold/components/tab-page';
import Link from 'next/link';

export default async function BrandForm({
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
              <FolderIcon /> Gold
            </li>
            <li>
              <FolderOpenIcon /> Cert Price
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
            <h5>Halaman Data Emas</h5>
            <p>Manajemen Data Brand</p>
          </div>
        </div>
        <div className="main-body">
          <GoldTabPage activeTab="brand" />
          <div className="flex flex-col gap-[10px]">
            <div className="flex justify-end">
              <Link
                href={`/master/gold/brand`}
                className="btn btn-outline-neutral"
              >
                <UndoOutlineIcon />
                Kembali
              </Link>
            </div>
            <BrandPageForm paramsId={paramsId} />
          </div>
        </div>
      </div>
    </div>
  );
}
