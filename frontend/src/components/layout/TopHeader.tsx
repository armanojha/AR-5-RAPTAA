import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AVATAR_URL } from './Sidebar';

interface TopHeaderProps {
  pageTitle: string;
  onMenuOpen: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ pageTitle, onMenuOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [avatarError, setAvatarError] = React.useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate('/explorer');
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-[260px] right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 z-40 px-space-md lg:px-space-lg flex items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-sm lg:gap-space-lg flex-1 max-w-2xl min-w-0">
        <button
          type="button"
          onClick={onMenuOpen}
          className="lg:hidden p-1.5 rounded hover:bg-surface-container-low text-on-surface"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="hidden sm:flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant shrink-0">
          <span className="material-symbols-outlined text-[16px] text-outline">satellite</span>
          <span>CIVITRACE</span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold">{pageTitle}</span>
        </div>

        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-14 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
            placeholder="Search 124 projects, corridor IDs, coordinates, or alerts..."
            type="text"
          />
          <span className="hidden sm:inline-block absolute right-2 top-1/2 -translate-y-1/2 font-label-sm text-label-sm bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/30 text-on-surface-variant">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-space-sm lg:gap-space-md shrink-0">
        <div className="hidden xl:flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-low border border-outline-variant/30">
          <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
          <span className="font-label-md text-label-md text-on-surface font-medium">
            Sentinel-2 &amp; Cartosat-3 (Q3-Q4 2024)
          </span>
          <span className="material-symbols-outlined text-[14px] text-outline">arrow_drop_down</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-low border border-outline-variant/30">
          <div className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
          <span className="font-label-sm text-label-sm text-on-surface font-medium">
            Live Sensor Telemetry: Active
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            title="View Project Alerts"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="flex items-center gap-1.5 bg-primary text-on-primary font-label-md text-label-md px-space-sm py-1.5 rounded hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          <span className="hidden sm:inline">Quick Export</span>
        </button>

        {!avatarError ? (
          <img
            alt="Profile"
            className="hidden sm:block w-8 h-8 rounded-full object-cover shrink-0 border border-outline-variant/40"
            src={AVATAR_URL}
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="hidden sm:flex w-8 h-8 rounded-full bg-primary/15 text-primary items-center justify-center font-label-md font-bold shrink-0">
            AT
          </div>
        )}
      </div>
    </header>
  );
};
