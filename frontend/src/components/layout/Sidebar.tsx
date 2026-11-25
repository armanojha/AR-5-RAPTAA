import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDrishtiData } from '../../data/DrishtiContext';

export interface NavItem {
  label: string;
  to?: string;
  icon: string;
  badge?: {
    text: string;
    variant: 'hero' | 'error';
  };
  disabled?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const WORKSPACE_ITEMS: NavItem[] = [
  { label: 'Overview', to: '/', icon: 'radar' },
  { label: 'Project Explorer', to: '/explorer', icon: 'explore' },
  {
    label: 'Satellite Evidence',
    to: '/evidence',
    icon: 'satellite_alt',
    badge: { text: 'EO LAB', variant: 'hero' },
  },
  { label: 'Milestone Verification', to: '/milestones', icon: 'verified' },
  { label: 'Financial Analysis', to: '/financials', icon: 'payments' },
];

const SYSTEM_ITEMS: NavItem[] = [
  { label: 'Settings', icon: 'settings', disabled: true },
  { label: 'Help & Support', icon: 'help', disabled: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { data } = useDrishtiData();
  const alertCount = data?.alerts.length ?? 41;

  const intelligenceItems: NavItem[] = [
    {
      label: 'Project Alerts',
      to: '/alerts',
      icon: 'warning',
      badge: { text: String(alertCount), variant: 'error' },
    },
    { label: 'Risk & Track C', to: '/risk', icon: 'gpp_maybe' },
    { label: 'Reports & Documents', to: '/reports', icon: 'description' },
  ];

  const renderNavSection = (title: string, items: NavItem[]) => (
    <div className="space-y-space-xs">
      <div className="px-space-sm pb-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline">
        {title}
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          if (item.disabled || !item.to) {
            return (
              <div
                key={item.label}
                title="Not part of current hackathon prototype"
                className="flex items-center justify-between px-space-sm py-1.5 rounded text-outline/70 cursor-not-allowed font-body-sm text-body-sm"
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="font-label-sm text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-container-low text-outline">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center justify-between px-space-sm py-1.5 rounded transition-colors bg-surface-container text-primary font-headline-sm'
                  : 'flex items-center justify-between px-space-sm py-1.5 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-sm text-body-sm'
              }
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <span className="material-symbols-outlined text-[18px] shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge?.variant === 'hero' && (
                <span className="bg-primary text-on-primary font-label-sm text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold shrink-0">
                  {item.badge.text}
                </span>
              )}
              {item.badge?.variant === 'error' && (
                <span className="bg-error text-on-error font-label-sm text-[10px] min-w-[18px] h-4 px-1 flex items-center justify-center rounded-full font-bold shrink-0">
                  {item.badge.text}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[1px] z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between select-none transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 px-space-lg flex items-center justify-between gap-space-sm border-b border-outline-variant/20 bg-surface-container-lowest">
            <NavLink to="/" onClick={onClose} className="flex items-center gap-space-sm min-w-0">
              <div className="h-8 w-8 rounded bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate">
                  DRISHTI
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider truncate">
                  SATELLITE INFRASTRUCTURE AI
                </span>
              </div>
            </NavLink>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-surface-container-low text-on-surface-variant"
              aria-label="Close navigation menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-space-md py-space-md space-y-space-lg">
            {renderNavSection('WORKSPACE', WORKSPACE_ITEMS)}
            {renderNavSection('INTELLIGENCE', intelligenceItems)}
            {renderNavSection('SYSTEM', SYSTEM_ITEMS)}
          </div>
        </div>

        <div className="p-space-md border-t border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm p-space-xs rounded bg-surface-container-low">
            <div className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse shrink-0" />
            <span className="font-label-sm text-label-sm text-on-surface truncate">
              Sentinel-1/2 + OSM: VERIFIED
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline truncate">Corridors</span>
            <span className="font-label-sm text-label-sm font-semibold text-primary truncate">
              NHAI / RVNL / BSRDC
            </span>
          </div>
          <div className="flex items-center gap-space-sm pt-space-xs border-t border-outline-variant/10">
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-label-md font-bold shrink-0">
              EO
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-lg text-label-lg font-semibold text-on-surface truncate">
                Drishti Audit Cell
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                Verify-First Governance
              </span>
            </div>
          </div>
          <div className="pt-space-xs flex justify-between items-center">
            <span className="font-label-sm text-[9px] text-outline uppercase tracking-wider">
              3-CORRIDOR REAL EO v2.4
            </span>
            <span className="material-symbols-outlined text-[14px] text-outline">terminal</span>
          </div>
        </div>
      </aside>
    </>
  );
};
