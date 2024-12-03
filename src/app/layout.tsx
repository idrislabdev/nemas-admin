import '@/styles/xadmin.css'
import '@/styles/components/main-sidebar.css'
import '@/styles/components/table.css'
import '@/styles/components/tab.css'
import '@/styles/components/forms.css'
import "@/styles/components/modals.css";
import 'rsuite/useToaster/styles/index.css';
import 'rsuite/Message/styles/index.css';
import 'rsuite/Pagination/styles/index.css';
import 'rsuite/Modal/styles/index.css';
import 'rsuite/Animation/styles/index.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
