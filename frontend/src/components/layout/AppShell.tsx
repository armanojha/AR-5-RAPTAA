import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Telemetry Operations',
  '/explorer': 'Project Explorer',
  '/evidence': 'Satellite Evidence',
  '/milestones': 'Milestone Verification',
  '/financials': 'Financial Analysis',
  '/alerts': 'Project Alerts',
  '/risk': 'Risk Assessment',
  '/reports': 'Reports & Documents',
};

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { pathname } = useLocation();
  const pageTitle = ROUTE_TITLES[pathname] ?? 'Telemetry Operations';

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pl-0 lg:pl-[260px] min-h-screen flex flex-col">
        <TopHeader pageTitle={pageTitle} onMenuOpen={() => setSidebarOpen(true)} />
        <main className="w-full pt-16 bg-surface min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
