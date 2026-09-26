import { ReactNode } from 'react';
import Header from './Header';
import ContextIndicator from './ContextIndicator';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideJourneyBar?: boolean;
}

export default function Layout({ children, title, subtitle, hideJourneyBar }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full min-w-0">
      {/* Universal Top Navigation Header (Full horizontal nav on desktop; compact header on mobile) */}
      <Header title={title} subtitle={subtitle} />

      {/* Active Context & Innovation Lifecycle Indicator */}
      {!hideJourneyBar && <ContextIndicator />}

      {/* Full-width Application Content (No sidebar margins anywhere) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 pb-24 md:pb-8">
        <div className="w-full min-w-0">
          {children}
        </div>
      </main>

      {/* Fixed Mobile Bottom Navigation Bar (Hidden on desktop md+) */}
      <BottomNav />
    </div>
  );
}
