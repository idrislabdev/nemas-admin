import ProfileDropdown from "@/@core/components/profile-dropdown";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon } from "@/@core/my-icons";
import InformationsTabPage from "@/@core/pages/data/informations/components/tab-page";
import InformationEducationalPageForm from "@/@core/pages/data/informations/educational/form";
import { FlipBackward } from "@untitled-ui/icons-react";
import Link from "next/link";

export default async function InformationEducationalForm({ params }: { params: Promise<{ id: string }>}) {
  const paramsId = (await params).id
  return (
    <div className='main-container'>
      <div className='container-header'>
        <div className='breadcrumb-info'>
          <ul>
            <li><ArrowLeftIcon /></li>
            <li><FolderIcon /> Home</li>
            <li><FolderIcon /> Information</li>
            <li><FolderOpenIcon /> FaQ</li>
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
            <h5>Halaman FaQ</h5>
            <p>Manajemen Data FaQ</p>
          </div>
        </div>
        <div className='main-body'>
            <InformationsTabPage activeTab="educational" />
            <div className="flex flex-col gap-[10px]">
                <div className="flex justify-end">
                    <Link href={`/data/informations/educational`} className="btn btn-outline-neutral"><FlipBackward />Kembali</Link>
                </div>
                <InformationEducationalPageForm paramsId={paramsId} />
            </div>
        </div>
      </div>
    </div>
  );
}
