import React from 'react';
import { NavLink } from 'react-router-dom';

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
    badge: { text: 'HERO', variant: 'hero' },
  },
  { label: 'Milestone Verification', to: '/milestones', icon: 'verified' },
  { label: 'Financial Analysis', to: '/financials', icon: 'payments' },
];

const INTELLIGENCE_ITEMS: NavItem[] = [
  {
    label: 'Project Alerts',
    to: '/alerts',
    icon: 'warning',
    badge: { text: '9', variant: 'error' },
  },
  { label: 'Risk Assessment', to: '/risk', icon: 'gpp_maybe' },
  { label: 'Reports & Documents', to: '/reports', icon: 'description' },
];

const SYSTEM_ITEMS: NavItem[] = [
  { label: 'Settings', icon: 'settings', disabled: true },
  { label: 'Help & Support', icon: 'help', disabled: true },
];

const LOGO_URL =
  'https://lh3.googleusercontent.com/aida/ALJJyrC5k-9ffVn4fqLd_vEDxO495ALLRmnzxzZVk3eAv_eJpZTapRENhbNXzObMzUHutKcfd5TJMnxizrvQZNsDIc3mXQVFGO3lnwwNvZhfNCOnwVozgGXSh8T9Rz5PMMEDZxB5sjumnUUJvCj-wne5yoCJHkSdKcJH9Z4LJO8yJezE1YkSxZkjctgMNt-njeUMru0e2o26siK319lf8fprK7WNZl13Mfy-OwKZKPR1xyQwqg';

export const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCibKIAb5VH7LFkz_V18oFWOTU0Y3TOV5JEqWGUU0mxIdxahCPyM31471tKKfCY5_MyS-1lUCs_aNvArCQ5WiVSdwtH357mqESGVoUBqpokFCzsxHsnxUfZFlg1SJWuQ_hBtliepMfFv8fhyHPrrhDQ1BNlTcJ3woyGK2mITU8Yos5F2j8eW-umGm2ZqzuaLTRc_lTsVvR3vmW7jdGPiXf7vyC08sVYSwrTspgAwCzo';

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [logoError, setLogoError] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);

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
                <span className="bg-error text-on-error font-label-sm text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shrink-0">
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
              {!logoError ? (
                <img
                  alt="CIVITRACE Orbit Logo"
                  className="h-8 w-auto object-contain shrink-0"
                  src={LOGO_URL}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="h-8 w-8 rounded bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
                </div>
              )}
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate">
                  CIVITRACE
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider truncate">
                  INFRASTRUCTURE INTELLIGENCE
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
            {renderNavSection('INTELLIGENCE', INTELLIGENCE_ITEMS)}
            {renderNavSection('SYSTEM', SYSTEM_ITEMS)}
          </div>
        </div>

        <div className="p-space-md border-t border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm p-space-xs rounded bg-surface-container-low">
            <div className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse shrink-0" />
            <span className="font-label-sm text-label-sm text-on-surface truncate">
              ISRO &amp; Sentinel-2 Sync: LIVE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline truncate">Workspace</span>
            <span className="font-label-sm text-label-sm font-semibold text-primary truncate">
              NHAI/MoRTH
            </span>
          </div>
          <div className="flex items-center gap-space-sm pt-space-xs border-t border-outline-variant/10">
            {!avatarError ? (
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-outline-variant/40"
                src={AVATAR_URL}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-label-md font-bold shrink-0">
                AT
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-lg text-label-lg font-semibold text-on-surface truncate">
                Dr. Aris Thorne
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                Lead Geospatial Analyst
              </span>
            </div>
          </div>
          <div className="pt-space-xs flex justify-between items-center">
            <span className="font-label-sm text-[9px] text-outline uppercase tracking-wider">
              HACKATHON DEMO v2.4
            </span>
            <span className="material-symbols-outlined text-[14px] text-outline">terminal</span>
          </div>
        </div>
      </aside>
    </>
  );
};
