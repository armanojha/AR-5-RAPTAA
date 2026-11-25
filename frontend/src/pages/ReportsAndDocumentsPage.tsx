import React from 'react';

const THUMB_A_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB8AuPE8L6mfJBoKWdvSlednBPHqO8Bq3VSaqf_9jT8Q8nngULXSkRZRkz3YOQkb00mZfUUA2TSE7HaL3Xsdxq2HG9F5W4Q2Sp5MOK6l7mvmF-IsDCTz-Vqq0AM8-uHf3feNIEDU8MV2-vIpKcS-JC5LT3Qv6HtVlU3NVfzl9dPry3lOL1W91SymMAMEYVdFFxmh4ipPF33Rhb_ys5c1Ci1_320cpDLkaOJKHjjRCSV';

const THUMB_B_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD8lv4ovHOGmRJKmBZP9KIVr0axfzx_UjCm5fnWWN5dQ4v7iNNZyZTglDQT9GsyA_HLPBeCuf99-E7uQNJfgCs84KMIRN8Ijc4P1xUl1IbuPA9fvYyJAVkPSDjdMAhYFYNF5ehr-MkX2Yyv5S0SzsmTUEiz5lqsKcVbeBZmA1tMXKDPAXzUO--LIn-YXjmebBvwwvziqEXTXDvdM0XK93atsyxy8Qy4kYyVChKfnzgS';

const THUMB_C_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAEM7P4NhwVZBW8hch0Y5semTJF5xwr7lvBv1tNJqma1nLE0F7rtPMx_HO3X7SyplCwri7AP9jWC-PjKWvtXVLxPX4Wjv6ICVgyGz-hK9_sPpxxsiSSBHobZuQiVOzFvFgKSwdWUAulsP-lDUp2mB3gqMmc1GUimJLhbIGihH3NuGitC08VD4y6wpvPPPcqkCZm25LDfSYaqqJEqvJ0RGAbHd6UVyXvkrc8DLhhpDQF';

const CORRIDOR_STRIP_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDSP-Cd-1_hgm-2TvJA5IUQYNfGcaAgO8aVhKERso7GC5XjDCLsyYExpsc8_j5IggElcLgwRwUZIHdoGDsKrO3apqnn96CPxK31UNWn84B7A3X9EhhRSH1AJ2Lonk1zywvranckqYs32zJgXKLoi4_ohmxUZp8FojQh3cCbL7m0-hgQI46ZHbqFW2bk00BtLtD-xnIUKh9FscBcle6_QqCCnvE-uYo6SGSCMx0iAHVN';

type ReportTab = 'all' | 'dossiers' | 'bulletins' | 'notices';

export const ReportsAndDocumentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<ReportTab>('all');
  const [toast, setToast] = React.useState<{
    visible: boolean;
    title: string;
    desc: string;
    icon: string;
  }>({
    visible: false,
    title: '',
    desc: '',
    icon: 'verified',
  });

  const triggerToast = (title: string, desc: string, icon = 'verified') => {
    setToast({ visible: true, title, desc, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Command Ribbon & Header Context */}
      <section className="px-space-md sm:px-space-xl pt-space-lg pb-space-md bg-surface-container-lowest shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div>
            <div className="flex flex-wrap items-center gap-space-sm mb-1">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                ISO-19115 GIS COMPLIANT
              </span>
              <span className="text-outline-variant">•</span>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                STATUTORY LEGAL ARCHIVE
              </span>
              <span className="text-outline-variant">•</span>
              <span className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                CAG DISPATCH GATEWAY CONNECTED
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Project Intelligence Reports &amp; Forensic Dossiers
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl mt-0.5">
              Certified audit dossiers combining multi-temporal satellite imagery, GIS change vectors, milestone
              discrepancy ledgers, and statutory recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={() =>
                triggerToast(
                  'Compiling High-Res Dossier PDF',
                  'Preparing printable vector report layout for CT-2024-DME-04B.',
                  'picture_as_pdf'
                )
              }
              className="flex items-center gap-1.5 px-space-md py-1.5 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Certified PDF</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-space-md py-1.5 bg-surface-container text-on-surface rounded font-label-md text-label-md hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">data_object</span>
              <span>GeoJSON / SHP</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-space-md py-1.5 bg-surface-container text-on-surface rounded font-label-md text-label-md hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">layers</span>
              <span>GeoTIFF Layers</span>
            </button>
            <button
              type="button"
              className="p-1.5 bg-surface-container-low text-on-surface-variant rounded hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Dossier Library Filter Tabs & Metadata Stats Strip */}
        <div className="mt-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={
                activeTab === 'all'
                  ? 'px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-medium whitespace-nowrap shadow-sm'
                  : 'px-space-md py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors whitespace-nowrap'
              }
            >
              All Reports (42)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dossiers')}
              className={
                activeTab === 'dossiers'
                  ? 'px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-medium whitespace-nowrap shadow-sm flex items-center gap-1.5'
                  : 'px-space-md py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors whitespace-nowrap flex items-center gap-1.5'
              }
            >
              <span>Certified Audit Dossiers (14)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulletins')}
              className={
                activeTab === 'bulletins'
                  ? 'px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-medium whitespace-nowrap shadow-sm'
                  : 'px-space-md py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors whitespace-nowrap'
              }
            >
              Monthly Monitoring Bulletins (20)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notices')}
              className={
                activeTab === 'notices'
                  ? 'px-space-md py-1.5 rounded-full bg-error text-on-error font-label-md text-label-md font-medium whitespace-nowrap shadow-sm flex items-center gap-1'
                  : 'px-space-md py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-error font-label-md text-label-md transition-colors whitespace-nowrap flex items-center gap-1'
              }
            >
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span>High-Priority Investigation Notices (8)</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-tertiary">verified_user</span>
              Cryptographic Nonce Verified
            </span>
            <span className="text-outline-variant">|</span>
            <span className="font-code-md text-code-md text-primary font-medium">REV: 2024.10-DOSS-V4</span>
          </div>
        </div>
      </section>

      {/* Main Report Workspace: 2-Column Split */}
      <div className="px-space-md sm:px-space-xl py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* LEFT SIDEBAR: Audit Navigation, Integrity Chain, Quick Switcher */}
        <aside className="lg:col-span-3 space-y-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                ACTIVE AUDIT RECORD
              </span>
              <span className="font-label-sm text-[9px] px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-semibold tracking-wider">
                DEFICIT FLAGGED
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                CT-2024-DME-04B
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Delhi-Mumbai Expressway (Pkg 4B, Ch. 172+000 to 204+000)
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span className="text-outline">Corridor Length:</span>
                <span className="font-medium text-on-surface">32.0 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Contractor:</span>
                <span className="font-medium text-on-surface truncate max-w-[140px]">Apex Infra-EPC JV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Oversight Body:</span>
                <span className="font-medium text-on-surface">NHAI Vigilance Div.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Sensor Passes:</span>
                <span className="font-code-md text-primary">Cartosat-3 / Sentinel-2</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-sm">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block">
              DOSSIER INDEX
            </span>
            <nav className="space-y-1 font-body-sm text-body-sm">
              <a
                className="flex items-center justify-between px-2 py-1.5 rounded bg-surface-container-low text-primary font-medium transition-colors"
                href="#section-1"
              >
                <span className="flex items-center gap-2">
                  <span className="font-code-md text-label-sm">§ 1.0</span>
                  <span>Executive Determination</span>
                </span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
              <a
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors"
                href="#section-2"
              >
                <span className="flex items-center gap-2">
                  <span className="font-code-md text-label-sm">§ 2.0</span>
                  <span>Spatial Satellite Vectors</span>
                </span>
                <span className="font-label-sm text-outline">3 items</span>
              </a>
              <a
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors"
                href="#section-3"
              >
                <span className="flex items-center gap-2">
                  <span className="font-code-md text-label-sm">§ 3.0</span>
                  <span>Milestone Discrepancy Ledger</span>
                </span>
                <span className="font-label-sm text-error font-medium">7 MS</span>
              </a>
              <a
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors"
                href="#section-4"
              >
                <span className="flex items-center gap-2">
                  <span className="font-code-md text-label-sm">§ 4.0</span>
                  <span>Explainable AI (XAI) Model</span>
                </span>
                <span className="font-label-sm text-tertiary font-medium">99.4% c.i.</span>
              </a>
              <a
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors"
                href="#section-5"
              >
                <span className="flex items-center gap-2">
                  <span className="font-code-md text-label-sm">§ 5.0</span>
                  <span>Statutory Sanctions Matrix</span>
                </span>
                <span className="font-label-sm text-outline">3 Directives</span>
              </a>
              <a
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors"
                href="#section-6"
              >
                <span className="flex items-center gap-2">
                  <span className="font-code-md text-label-sm">§ 6.0</span>
                  <span>Digital Signatures &amp; Seals</span>
                </span>
                <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span>
              </a>
            </nav>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl space-y-space-xs text-on-surface">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">fingerprint</span>
              <span className="font-label-md text-label-md font-semibold">Immutable Hash Register</span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant">
              Cryptographically locked to National Remote Sensing Centre (NRSC) archive nodes.
            </p>
            <div className="bg-surface-container-lowest p-2 rounded font-code-md text-[10px] text-on-surface-variant break-all leading-tight selection:bg-primary-fixed">
              SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
            <div className="flex items-center justify-between font-label-sm text-[10px] text-outline pt-1">
              <span>TS: 2024-10-18T09:41:22Z</span>
              <span className="text-tertiary font-medium">Valid / Block #849201</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block">
              RECENT INVESTIGATIONS
            </span>
            <div className="space-y-2 pt-1 font-body-sm">
              <div className="p-2 rounded bg-surface hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex justify-between items-center text-label-sm">
                  <span className="font-code-md font-medium text-primary">CT-2024-BHR-09A</span>
                  <span className="text-tertiary font-semibold">Cleared (98.1%)</span>
                </div>
                <div className="text-[11px] text-on-surface truncate font-medium">
                  Ganga Bridge Approach Expressway
                </div>
              </div>
              <div className="p-2 rounded bg-surface hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex justify-between items-center text-label-sm">
                  <span className="font-code-md font-medium text-primary">CT-2024-KRL-03</span>
                  <span className="text-error font-semibold">Severe Delay (-34%)</span>
                </div>
                <div className="text-[11px] text-on-surface truncate font-medium">
                  Kochi Coastal Bypass Package 2
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN: Printed Forensic Document Presentation (9 cols) */}
        <div className="lg:col-span-9 bg-surface-container-lowest rounded-xl shadow-md p-space-lg md:p-space-2xl space-y-space-2xl selection:bg-secondary-container">
          {/* Document Masthead */}
          <div className="space-y-space-md pb-space-lg">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-14 h-14 rounded bg-primary flex items-center justify-center text-on-primary shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[32px]">satellite_alt</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm tracking-widest text-primary uppercase font-semibold">
                    CENTRAL INFRASTRUCTURE ORBITAL AUDIT DIVISION
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    CIVITRACE FORENSIC SATELLITE AUDIT DOSSIER
                  </h2>
                  <p className="font-label-md text-label-md text-on-surface-variant font-medium">
                    STATUTORY COMPLIANCE DOSSIER — REF: CT-2024-DME-04B
                  </p>
                </div>
              </div>
              <div className="p-space-sm bg-surface-container-low rounded-lg text-right flex flex-col justify-center min-w-[200px]">
                <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                  DOCUMENT STATUS
                </span>
                <span className="font-headline-sm text-headline-sm text-error font-bold flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  IRREGULARITY
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">
                  Formal Referral to CAG/NHAI Vigilance
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm p-space-md bg-surface-container-low rounded-lg font-body-sm text-body-sm">
              <div>
                <span className="block font-label-sm text-label-sm text-outline uppercase">
                  PROJECT &amp; CORRIDOR
                </span>
                <span className="font-semibold text-on-surface">Delhi-Mumbai Expressway</span>
                <span className="block font-code-md text-[11px] text-on-surface-variant">
                  Pkg 4B (Ch. 172 to 204)
                </span>
              </div>
              <div>
                <span className="block font-label-sm text-label-sm text-outline uppercase">COMMISSIONING BODY</span>
                <span className="font-semibold text-on-surface">NHAI Vigilance Div.</span>
                <span className="block text-[11px] text-on-surface-variant">Ref: VIG-2024-8842</span>
              </div>
              <div>
                <span className="block font-label-sm text-label-sm text-outline uppercase">SATELLITE BASELINE</span>
                <span className="font-semibold text-on-surface">Cartosat-3 / Sentinel-1/2</span>
                <span className="block font-code-md text-[11px] text-on-surface-variant">
                  Pass A: 12 Mar | B: 14 Oct &apos;24
                </span>
              </div>
              <div>
                <span className="block font-label-sm text-label-sm text-outline uppercase">SPATIAL RESOLUTION</span>
                <span className="font-semibold text-on-surface">0.5m Panchromatic</span>
                <span className="block font-code-md text-[11px] text-on-surface-variant">
                  10m Multispectral VNIR
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1 */}
          <section className="space-y-space-md scroll-mt-20" id="section-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-code-md text-label-sm font-bold">
                  1
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Executive Summary &amp; Audit Determination
                </h3>
              </div>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-error-container text-on-error-container font-semibold uppercase">
                DEFICIT: 26.7%
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              The Civitrace Orbital Intelligence Engine executed a dual-temporal high-precision change-detection audit
              over a continuous 32.0 km alignment of the Delhi-Mumbai Expressway Package 4B. By cross-referencing
              multi-angle multispectral imagery (Pass A: 12 March 2024 vs Pass B: 14 October 2024) against Interim
              Payment Certificate #14 (IPC-14) filed by the concessionaire, the system identifies an unresolvable
              structural deficit.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-1">
              <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    PHYSICAL DEFICIT
                  </span>
                  <span className="material-symbols-outlined text-error text-[20px]">trending_down</span>
                </div>
                <div className="my-space-sm">
                  <div className="font-display-lg text-display-lg text-error font-bold leading-none">-26.7%</div>
                  <div className="flex items-center justify-between font-label-sm text-[11px] mt-2 text-on-surface-variant">
                    <span>
                      Claimed: <strong className="text-on-surface">68.2%</strong>
                    </span>
                    <span>
                      Observed: <strong className="text-primary">41.5%</strong>
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full" style={{ width: '41.5%' }} />
                  <div className="bg-error h-full opacity-60" style={{ width: '26.7%' }} />
                </div>
              </div>

              <div className="p-space-lg bg-error-container/40 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-error-container uppercase tracking-wider font-semibold">
                    CAPEX AT RISK
                  </span>
                  <span className="material-symbols-outlined text-error text-[20px]">currency_rupee</span>
                </div>
                <div className="my-space-sm">
                  <div className="font-display-lg text-display-lg text-on-error-container font-bold leading-none">
                    ₹1,134.2 Cr
                  </div>
                  <p className="font-body-sm text-[11px] text-on-surface-variant mt-2 leading-tight">
                    Disputed physical milestones claimed under certified billings without ground presence.
                  </p>
                </div>
                <div className="font-label-sm text-[10px] text-error font-semibold uppercase tracking-wider">
                  HIGH EXPOSURE • RECOMMEND FREEZE
                </div>
              </div>

              <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    LATENT CORRIDOR
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[20px]">timeline</span>
                </div>
                <div className="my-space-sm">
                  <div className="font-display-lg text-display-lg text-on-surface font-bold leading-none">16.0 km</div>
                  <p className="font-body-sm text-[11px] text-on-surface-variant mt-2 leading-tight">
                    Right-of-way between Ch. 188+000 and 204+000 shows zero clearing, grubbing, or subgrade compaction.
                  </p>
                </div>
                <div className="font-label-sm text-[10px] text-secondary font-semibold uppercase tracking-wider">
                  50.0% OF CONTRACTUAL EXTENT
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-space-md scroll-mt-20" id="section-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-code-md text-label-sm font-bold">
                  2
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Spatial Evidence Summary</h3>
                  <p className="font-label-sm text-label-sm text-outline">
                    Cartosat-3 0.5m Orthorectified Change Vectors (EPSG:32643)
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md">
                GEO-CALIBRATION: ±0.18m RMS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="group bg-surface-container-low rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative h-48 w-full bg-surface-container-high overflow-hidden">
                  <img
                    alt="Interchange Km 191+200"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={THUMB_A_URL}
                  />
                  <div className="absolute top-2 left-2 bg-error text-on-error font-label-sm text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow">
                    ANOMALY: ZERO PIER CAP
                  </div>
                  <div className="absolute bottom-2 right-2 bg-inverse-surface/85 text-inverse-on-surface font-code-md text-[9px] px-1.5 py-0.5 rounded backdrop-blur">
                    Km 191+200
                  </div>
                </div>
                <div className="p-space-md flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-outline mb-1">
                      <span>THUMBNAIL A</span>
                      <span className="font-code-md text-error font-medium">CLAIM: 80% | ACTUAL: 15%</span>
                    </div>
                    <h4 className="font-headline-sm text-[14px] text-on-surface font-semibold">
                      Major Interchange Viaduct Superstructure
                    </h4>
                    <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                      Contractor billed IPC for pier cap cast &amp; girder launch. Spaceborne Panchromatic analysis
                      reveals bare foundations with nil casting works.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-between items-center font-label-sm text-[10px] text-outline">
                    <span className="font-code-md">28.4521° N, 77.0298° E</span>
                    <span className="text-error font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">crisis_alert</span>
                      DEFICIT CONFIRMED
                    </span>
                  </div>
                </div>
              </div>

              <div className="group bg-surface-container-low rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative h-48 w-full bg-surface-container-high overflow-hidden">
                  <img
                    alt="Dense Bituminous Macadam section"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={THUMB_B_URL}
                  />
                  <div className="absolute top-2 left-2 bg-tertiary text-on-tertiary font-label-sm text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow">
                    VERIFIED: +4.2 KM SURFACING
                  </div>
                  <div className="absolute bottom-2 right-2 bg-inverse-surface/85 text-inverse-on-surface font-code-md text-[9px] px-1.5 py-0.5 rounded backdrop-blur">
                    Ch. 174+000 – 178+500
                  </div>
                </div>
                <div className="p-space-md flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-outline mb-1">
                      <span>THUMBNAIL B</span>
                      <span className="font-code-md text-tertiary font-medium">CLAIM: 100% | ACTUAL: 98%</span>
                    </div>
                    <h4 className="font-headline-sm text-[14px] text-on-surface font-semibold">
                      Dense Bituminous Macadam (DBM)
                    </h4>
                    <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                      Spectroradiometric signature matches freshly laid aggregate polymer bitumen. Consistent thickness
                      and edge alignment verified via SWIR index.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-between items-center font-label-sm text-[10px] text-outline">
                    <span className="font-code-md">28.3980° N, 77.0611° E</span>
                    <span className="text-tertiary font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      PROGRESS VALIDATED
                    </span>
                  </div>
                </div>
              </div>

              <div className="group bg-surface-container-low rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative h-48 w-full bg-surface-container-high overflow-hidden">
                  <img
                    alt="Latent 16 km unworked corridor"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={THUMB_C_URL}
                  />
                  <div className="absolute top-2 left-2 bg-secondary text-on-secondary font-label-sm text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow">
                    LATENT: 16 KM UNWORKED
                  </div>
                  <div className="absolute bottom-2 right-2 bg-inverse-surface/85 text-inverse-on-surface font-code-md text-[9px] px-1.5 py-0.5 rounded backdrop-blur">
                    Ch. 188+000 – 204+000
                  </div>
                </div>
                <div className="p-space-md flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-outline mb-1">
                      <span>THUMBNAIL C</span>
                      <span className="font-code-md text-error font-medium">CLAIM: 55% | ACTUAL: 0.0%</span>
                    </div>
                    <h4 className="font-headline-sm text-[14px] text-on-surface font-semibold">
                      Subgrade Earthworks &amp; Embankment
                    </h4>
                    <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                      Zero spatial deviation in NDVI vegetation indices between March and October 2024. Farmland crops
                      intact without site mobilization.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-between items-center font-label-sm text-[10px] text-outline">
                    <span className="font-code-md">28.2910° N, 77.1120° E</span>
                    <span className="text-error font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">cancel</span>
                      ZERO MOBILIZATION
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-space-md rounded-xl overflow-hidden shadow-sm relative">
              <div
                className="w-full h-48 bg-cover bg-center"
                style={{ backgroundImage: `url('${CORRIDOR_STRIP_URL}')` }}
              />
              <div className="absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-2 shadow">
                <span className="material-symbols-outlined text-[16px] text-primary">route</span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">
                  NH-148N / DME Pkg 4B Continuous Spatial Track (Km 172 to 204)
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-space-md scroll-mt-20" id="section-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-code-md text-label-sm font-bold">
                  3
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Civil Milestone Discrepancy Matrix
                  </h3>
                  <p className="font-label-sm text-label-sm text-outline">
                    Statutory Comparison: Concessionaire IPC-14 Claim vs Orbital EO Verification
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-[11px] px-2 py-1 rounded bg-surface-container text-on-surface-variant font-code-md">
                7 Audited Milestones
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl bg-surface-container-low shadow-sm">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container text-outline font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-2.5 px-space-md">Milestone ID</th>
                    <th className="py-2.5 px-space-md">Scope Item &amp; Chainage</th>
                    <th className="py-2.5 px-space-md text-right">Target Sched.</th>
                    <th className="py-2.5 px-space-md text-right">Contractor Claim</th>
                    <th className="py-2.5 px-space-md text-right text-primary">EO Observed</th>
                    <th className="py-2.5 px-space-md text-right text-error">Variance</th>
                    <th className="py-2.5 px-space-md text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                    <td className="py-2 px-space-md font-code-md text-primary font-semibold">MS-01</td>
                    <td className="py-2 px-space-md font-medium text-on-surface">
                      ROW Clearance &amp; Grubbing (Km 172-188)
                    </td>
                    <td className="py-2 px-space-md text-right font-code-md">100.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md font-semibold">100.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-tertiary font-bold">100.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-tertiary">0.0%</td>
                    <td className="py-2 px-space-md text-center">
                      <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-[10px] font-semibold">
                        MATCH
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                    <td className="py-2 px-space-md font-code-md text-primary font-semibold">MS-02</td>
                    <td className="py-2 px-space-md font-medium text-on-surface">
                      Subgrade Embankment (Km 172-188)
                    </td>
                    <td className="py-2 px-space-md text-right font-code-md">95.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md font-semibold">92.4%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-primary font-bold">89.1%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-on-surface-variant">-3.3%</td>
                    <td className="py-2 px-space-md text-center">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-[10px]">
                        TOLERABLE
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                    <td className="py-2 px-space-md font-code-md text-primary font-semibold">MS-03</td>
                    <td className="py-2 px-space-md font-medium text-on-surface">
                      Granular Sub-Base (GSB) Km 172-180
                    </td>
                    <td className="py-2 px-space-md text-right font-code-md">80.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md font-semibold">78.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-primary font-bold">75.5%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-on-surface-variant">-2.5%</td>
                    <td className="py-2 px-space-md text-center">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-[10px]">
                        TOLERABLE
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                    <td className="py-2 px-space-md font-code-md text-primary font-semibold">MS-04</td>
                    <td className="py-2 px-space-md font-medium text-on-surface">
                      Dense Bituminous Macadam (DBM) 4.2km
                    </td>
                    <td className="py-2 px-space-md text-right font-code-md">40.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md font-semibold">38.5%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-tertiary font-bold">37.9%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-tertiary">-0.6%</td>
                    <td className="py-2 px-space-md text-center">
                      <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-[10px] font-semibold">
                        MATCH
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-error-container/30 hover:bg-error-container/50 transition-colors">
                    <td className="py-2 px-space-md font-code-md text-error font-bold">MS-05</td>
                    <td className="py-2 px-space-md font-semibold text-on-surface">
                      Km 191 Interchange Viaduct Piers &amp; Superstructure
                    </td>
                    <td className="py-2 px-space-md text-right font-code-md">85.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md font-bold text-error">80.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-error font-bold">15.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-error font-black">-65.0%</td>
                    <td className="py-2 px-space-md text-center">
                      <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-[10px] font-bold">
                        CRITICAL DEFICIT
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-error-container/20 hover:bg-error-container/40 transition-colors">
                    <td className="py-2 px-space-md font-code-md text-error font-bold">MS-06</td>
                    <td className="py-2 px-space-md font-semibold text-on-surface">
                      Major Canal Aqueduct (Ch. 197+400)
                    </td>
                    <td className="py-2 px-space-md text-right font-code-md">60.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md font-bold text-error">55.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-error font-bold">8.2%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-error font-black">-46.8%</td>
                    <td className="py-2 px-space-md text-center">
                      <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-[10px] font-bold">
                        CRITICAL DEFICIT
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-error-container/30 hover:bg-error-container/50 transition-colors">
                    <td className="py-2 px-space-md font-code-md text-error font-bold">MS-07</td>
                    <td className="py-2 px-space-md font-semibold text-on-surface">
                      Subgrade Embankment (Km 188-204 Latent Section)
                    </td>
                    <td className="py-2 px-space-md text-right font-code-md">70.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md font-bold text-error">55.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-error font-bold">0.0%</td>
                    <td className="py-2 px-space-md text-right font-code-md text-error font-black">-55.0%</td>
                    <td className="py-2 px-space-md text-center">
                      <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-[10px] font-bold">
                        ZERO PRESENCE
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-space-md scroll-mt-20" id="section-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-code-md text-label-sm font-bold">
                  4
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Explainable AI (XAI) Verification Findings
                  </h3>
                  <p className="font-label-sm text-label-sm text-outline">
                    Synthesized by Civitrace ResNet-GeoSpatial Backbone (Inference Confidence: 99.4%)
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 font-label-sm text-[11px] text-tertiary font-semibold bg-tertiary/10 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                XAI Attribution Validated
              </span>
            </div>

            <div className="space-y-space-xs font-body-sm text-body-sm">
              <div className="p-space-md bg-surface-container-low rounded-lg flex items-start gap-space-sm">
                <span className="font-code-md font-bold text-primary shrink-0 mt-0.5">XAI-01</span>
                <p className="text-on-surface">
                  <strong>Synthetic Aperture Radar (SAR) Coherence Nullification:</strong> Sentinel-1 SAR
                  interferometric baseline between March and October 2024 exhibited high temporal correlation (0.78),
                  mathematically indicating an undisturbed vegetative cover and ruling out physical earth-moving along
                  Km 188–204.
                </p>
              </div>
              <div className="p-space-md bg-surface-container-low rounded-lg flex items-start gap-space-sm">
                <span className="font-code-md font-bold text-primary shrink-0 mt-0.5">XAI-02</span>
                <p className="text-on-surface">
                  <strong>Shadow Vector Volumetric Analysis:</strong> Cartosat-3 sun-azimuth shadow profiling over the Km
                  191+200 Interchange confirms average casting height of only 1.2m (ground footings only) rather than the
                  required 8.4m pier height necessary for superstructure support.
                </p>
              </div>
              <div className="p-space-md bg-surface-container-low rounded-lg flex items-start gap-space-sm">
                <span className="font-code-md font-bold text-primary shrink-0 mt-0.5">XAI-03</span>
                <p className="text-on-surface">
                  <strong>Spectral Radiance Fingerprinting:</strong> Band-ratio comparison (SWIR-2 / NIR) confirms
                  active asphalt laying restricted strictly to Chainage 174+000 to 178+500. No thermal curing or
                  bituminous emulsion signatures were detected south of Chainage 181+000.
                </p>
              </div>
              <div className="p-space-md bg-surface-container-low rounded-lg flex items-start gap-space-sm">
                <span className="font-code-md font-bold text-primary shrink-0 mt-0.5">XAI-04</span>
                <p className="text-on-surface">
                  <strong>Haul Road Density &amp; Fleet Activity:</strong> Vehicle tracking algorithm detected zero
                  active dump trucks or vibratory compactors along Ch. 188–204 across 14 consecutive cloud-free
                  satellite passes between June and October 2024.
                </p>
              </div>
              <div className="p-space-md bg-surface-container-low rounded-lg flex items-start gap-space-sm">
                <span className="font-code-md font-bold text-primary shrink-0 mt-0.5">XAI-05</span>
                <p className="text-on-surface">
                  <strong>Cumulative Physical Progress Determination:</strong> Total physical progress across the
                  contract package is conclusively certified at <strong>41.5%</strong> (±0.8%), creating an unbridgeable{' '}
                  <strong>26.7% deficit</strong> against the concessionaire IPC claim of 68.2%.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5 */}
          <section className="space-y-space-md scroll-mt-20" id="section-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-code-md text-label-sm font-bold">
                  5
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Statutory Recommendations &amp; Legal Framework
                  </h3>
                  <p className="font-label-sm text-label-sm text-outline">
                    Actionable directives under NHAI EPC Agreement Clause 14 &amp; CVC Guidelines
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-[11px] px-2 py-0.5 rounded bg-error-container text-on-error-container font-semibold uppercase">
                LEGAL ENFORCEMENT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="p-space-md bg-surface-container-low rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-error font-label-md text-label-md font-semibold">
                    <span className="material-symbols-outlined text-[16px]">gavel</span>
                    <span>Directive 01: Default Notice</span>
                  </div>
                  <h4 className="font-headline-sm text-[13px] text-on-surface font-semibold">
                    EPC Contract Section 14 Invocation
                  </h4>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    Issue a 15-day cure notice under Clause 14.1 (Contractor Default) requiring immediate explanation for
                    the 26.7% physical reporting divergence.
                  </p>
                </div>
                <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider block pt-2">
                  TARGET: Apex Infra JV
                </span>
              </div>

              <div className="p-space-md bg-error-container/30 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-error font-label-md text-label-md font-semibold">
                    <span className="material-symbols-outlined text-[16px]">money_off</span>
                    <span>Directive 02: Fund Withholding</span>
                  </div>
                  <h4 className="font-headline-sm text-[13px] text-on-surface font-semibold">
                    Withhold ₹412.50 Cr from IPC #14
                  </h4>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    Enact immediate escrow debit freeze on Milestones MS-05, MS-06, and MS-07 until terrestrial ground
                    verification is completed and reconciled.
                  </p>
                </div>
                <span className="font-label-sm text-[10px] text-error font-semibold uppercase tracking-wider block pt-2">
                  ESCROW ACCT: SBI/ND-901
                </span>
              </div>

              <div className="p-space-md bg-surface-container-low rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-secondary font-label-md text-label-md font-semibold">
                    <span className="material-symbols-outlined text-[16px]">flight</span>
                    <span>Directive 03: Field Deployment</span>
                  </div>
                  <h4 className="font-headline-sm text-[13px] text-on-surface font-semibold">
                    Terrestrial UAV LiDAR Validation
                  </h4>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    Mobilize autonomous RTK drone LiDAR survey team within 72 hours to map volumetric cut/fill
                    discrepancy at Ch. 191+200 Interchange.
                  </p>
                </div>
                <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider block pt-2">
                  UNIT: Survey Squad Gamma
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 6 */}
          <section className="space-y-space-md pt-space-md scroll-mt-20" id="section-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-code-md text-label-sm font-bold">
                  6
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Official Audit Sign-Off &amp; Digital Seals
                  </h3>
                  <p className="font-label-sm text-label-sm text-outline">
                    Multi-agency verification chain pursuant to Digital India Information Technology Act
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary text-[24px]">verified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-2">
              <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between space-y-space-md relative overflow-hidden">
                <div className="space-y-1">
                  <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider block">
                    ANALYTICAL LEAD
                  </span>
                  <div className="font-headline-sm text-[14px] text-on-surface font-bold">Dr. Aris Thorne, Ph.D.</div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant">
                    Lead Geospatial Analyst, CIVITRACE Orbit
                  </div>
                </div>
                <div className="p-2 bg-surface-container-lowest rounded flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">draw</span>
                  <div className="flex flex-col">
                    <span className="font-code-md text-[9px] text-on-surface font-semibold">
                      DIGITALLY SIGNED VIA PKI
                    </span>
                    <span className="font-code-md text-[8px] text-outline">2024-10-18T10:14:02 IST</span>
                  </div>
                </div>
                <div className="text-[10px] font-code-md text-outline">CERT-ID: CIVI-ISRO-892401</div>
              </div>

              <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between space-y-space-md relative overflow-hidden">
                <div className="space-y-1">
                  <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider block">
                    REMOTE SENSING LIAISON
                  </span>
                  <div className="font-headline-sm text-[14px] text-on-surface font-bold">Er. Rajeshwari Menon</div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant">
                    Director of Photogrammetry, NRSC / ISRO
                  </div>
                </div>
                <div className="p-2 bg-surface-container-lowest rounded flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">security</span>
                  <div className="flex flex-col">
                    <span className="font-code-md text-[9px] text-on-surface font-semibold">
                      ISRO ORBITAL BASELINE PASS
                    </span>
                    <span className="font-code-md text-[8px] text-outline">2024-10-18T10:48:55 IST</span>
                  </div>
                </div>
                <div className="text-[10px] font-code-md text-outline">CERT-ID: NRSC-EO-CARTOSAT-3B</div>
              </div>

              <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between space-y-space-md relative overflow-hidden">
                <div className="space-y-1">
                  <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider block">
                    STATUTORY OVERSIGHT
                  </span>
                  <div className="font-headline-sm text-[14px] text-on-surface font-bold">
                    Shri Vikramaditya Sen, IAS
                  </div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant">
                    Chief Vigilance Officer (CVO), NHAI MoRTH
                  </div>
                </div>
                <div className="p-2 bg-surface-container-lowest rounded flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[20px]">policy</span>
                  <div className="flex flex-col">
                    <span className="font-code-md text-[9px] text-error font-semibold">
                      FORMAL REFERRAL DISPATCHED
                    </span>
                    <span className="font-code-md text-[8px] text-outline">2024-10-18T11:22:19 IST</span>
                  </div>
                </div>
                <div className="text-[10px] font-code-md text-outline">CERT-ID: NHAI-VIG-CAG-2024-09</div>
              </div>
            </div>
          </section>

          {/* Sticky Document Actions Ribbon */}
          <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
              <span>Dossier Encrypted and Sealed for Legal Submission</span>
            </div>
            <div className="flex items-center gap-space-sm w-full sm:w-auto">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-space-md py-2 bg-surface-container text-on-surface rounded font-label-md text-label-md hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Dossier</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  triggerToast(
                    'CAG Transmittal Dispatched (Demo)',
                    'Dossier #CT-2024-DME-04B queued in demo UI.',
                    'send_and_archive'
                  )
                }
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-space-md py-2 bg-error text-on-error rounded font-label-md text-label-md hover:bg-error/90 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">send_and_archive</span>
                <span>Transmit to CAG Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-xl shadow-xl flex items-center gap-3 transition-opacity duration-300 ${
          toast.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-tertiary text-[20px]">{toast.icon}</span>
        <div>
          <div className="font-headline-sm text-label-lg font-semibold">{toast.title}</div>
          <div className="font-body-sm text-[11px] text-inverse-on-surface/80">{toast.desc}</div>
        </div>
      </div>
    </div>
  );
};
