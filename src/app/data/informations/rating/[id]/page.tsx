import MainSidebar from "@/@core/components/main-sidebar";
import { AboutOutlineIcon, ArrowLeftIcon, FolderIcon, FolderOpenIcon, UndoOutlineIcon } from "@/@core/my-icons";
import InformationsTabPage from "@/@core/pages/data/informations/components/tab-page";
import InformationRatingPageForm from "@/@core/pages/data/informations/rating/form";
import Link from "next/link";

export default async function InformationRatingForm({ params }: { params: Promise<{ id: string }>}) {
  const paramsId = (await params).id
  
  return (
    <main className='xadmin-page'>
      <MainSidebar />
      <section className='xadmin-section'>
        <div className='main-container'>
          <div className='container-header'>
            <div className='breadcrumb-info'>
              <ul>
                <li><ArrowLeftIcon /></li>
                <li><FolderIcon /> Home</li>
                <li><FolderIcon /> Information</li>
                <li><FolderOpenIcon /> Rating</li>
              </ul>
            </div>
          </div>
          <div className='container-body'>
            <div className='title-body'>
              <div className='logo-area'>
                <AboutOutlineIcon/>
              </div>
              <div className='text-area'>
                <h5>Halaman Rating</h5>
                <p>Manajemen Data Rating</p>
              </div>
            </div>
            <div className='main-body'>
                <InformationsTabPage activeTab="rating" />
                <div className="flex flex-col gap-[10px]">
                    <div className="flex justify-end">
                        <Link href={`/data/informations/rating`} className="btn btn-outline-neutral"><UndoOutlineIcon />Kembali</Link>
                    </div>
                    <InformationRatingPageForm paramsId={paramsId} />
                </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
