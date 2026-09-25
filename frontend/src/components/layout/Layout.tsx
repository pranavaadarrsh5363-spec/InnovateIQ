import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ContextIndicator from './ContextIndicator';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  hideJourneyBar?: boolean;
}

export default function Layout({ children, title, subtitle, hideJourneyBar }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        {!hideJourneyBar && <ContextIndicator />}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
