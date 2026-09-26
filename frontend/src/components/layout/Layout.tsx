import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ContextIndicator from './ContextIndicator';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  hideJourneyBar?: boolean;
}

export default function Layout({ children, title, subtitle, hideJourneyBar }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar (hidden lg:flex on desktop, completely hidden on mobile) */}
      <Sidebar />

      {/* Main Content Area (100% width on mobile, ml-64 on desktop) */}
      <div className="flex-1 ml-0 lg:ml-64 flex flex-col h-full min-h-screen w-full min-w-0 max-w-full overflow-x-hidden">
        <Header
          title={title}
          subtitle={subtitle}
        />
        {!hideJourneyBar && <ContextIndicator />}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 lg:pb-6 w-full min-w-0">
          <div className="max-w-7xl mx-auto w-full min-w-0 animate-in">
            {children}
          </div>
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation (lg:hidden) */}
      <BottomNav />
    </div>
  );
}
