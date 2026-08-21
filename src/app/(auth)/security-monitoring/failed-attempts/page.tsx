import ProfileDropdown from '@/@core/components/profile-dropdown';
import {
  AboutOutlineIcon,
  ArrowLeftIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@/@core/my-icons';
import SystemConfigTab from '@/@core/pages/system-config/components/tab-page';
import FailedAttemptPageTable from '@/@core/pages/system-config/failed-attempt/table';

export default function FailedAttempPage() {
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
              <FolderOpenIcon /> Security Monitoring
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
            <h5>Riwayat Percobaan Gagal</h5>
            <p>Monitoring riwayat percobaan login yang gagal pada pengguna</p>
          </div>
        </div>

        <div className="main-body">
          <SystemConfigTab activeTab="failed_attempts" />

          <div className="flex flex-col gap-[10px] w-full h-full">
            <FailedAttemptPageTable />
          </div>
        </div>
      </div>
    </div>
  );
}
