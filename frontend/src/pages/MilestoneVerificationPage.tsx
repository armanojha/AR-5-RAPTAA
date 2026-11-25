import React from 'react';
import { Link } from 'react-router-dom';

const RADAR_MICRO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAcM2S6qS-zd3EEEWxw3UAMpZ4_0fr8t0kL6p_5J5DxTK7phXzip4_qEJUQJpcTYk9rPlbJMmHceFumZMp58LGEg9qriL3JKt9GJole7_JfLgCqSvcQeNTnLUYYsFDXVxg6UmVN8wYiI-XTZun5_Qb3iSPpMv4X4ZR3tVC027uDE5TiqyrW4r9VbDpYlD1aPjnjUpjDNMIjZKy3Nkm54kUcsWK8PkSfC6gQ-mbNerDk';

export const MilestoneVerificationPage: React.FC = () => {
  return (
    <div className="p-space-md sm:p-space-lg w-full max-w-[1920px] mx-auto">
      <div className="flex flex-col w-full">
        {/* Top Spatial Anchor & Breadcrumb Ribbon */}
        <div className="flex flex-col gap-space-sm mb-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Federal Infrastructure Oversight</span>
                <span className="text-outline-variant">/</span>
                <span>Earth Observation Temporal Audit</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Construction Milestone Verification
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl mt-0.5">
                Objective alignment between planned engineering schedules, officially reported contractor progress, and
                satellite-observed physical ground truth.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                type="button"
                className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-1.5 rounded shadow-sm transition-all font-label-md text-label-md"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">history</span>
                <span>Orbit Log: 48h Ago</span>
              </button>
              <Link
                to="/reports"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-space-md py-1.5 rounded shadow-sm transition-all font-label-md text-label-md"
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Certify Observation Package</span>
              </Link>
            </div>
          </div>

          {/* Corridor Context Bar */}
          <div className="bg-surface-container-lowest rounded-lg p-space-sm px-space-md shadow-sm flex flex-wrap items-center justify-between gap-y-space-xs gap-x-space-lg">
            <div className="flex flex-wrap items-center gap-x-space-lg gap-y-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">route</span>
                <span className="font-label-md text-label-md text-outline uppercase">Project:</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Delhi-Mumbai Expressway (Pkg 4B)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-outline">CODE:</span>
                <span className="font-code-md text-code-md bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                  NHAI-EXP-DME-04B
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-outline">SPAN:</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  32.00 km (Km 182+000 to Km 214+000)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-outline">SENSOR SYNC:</span>
                <span className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-ping" />
                  Cartosat-3 &amp; Sentinel-1 SAR Coherent
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline">
              <span className="material-symbols-outlined text-[14px]">pin_drop</span>
              <span>LAT: 26.8924° N</span>
              <span className="text-outline-variant">|</span>
              <span>LON: 76.1287° E</span>
            </div>
          </div>

          {/* Quick Navigation Sub-Tabs */}
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5">
            <Link
              className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors whitespace-nowrap"
              to="/"
            >
              Overview
            </Link>
            <Link
              className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors whitespace-nowrap"
              to="/explorer"
            >
              Project Explorer
            </Link>
            <Link
              className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors whitespace-nowrap"
              to="/evidence"
            >
              Satellite Evidence
            </Link>
            <Link
              className="px-space-md py-1.5 rounded bg-surface-container-highest text-primary font-headline-sm text-headline-sm transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
              to="/milestones"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Milestone Verification</span>
            </Link>
            <Link
              className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors whitespace-nowrap"
              to="/financials"
            >
              Financial Analysis
            </Link>
            <Link
              className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors whitespace-nowrap"
              to="/reports"
            >
              Reports
            </Link>
          </div>
        </div>

        {/* Core Innovation Banner: High-density Discrepancy Matrix */}
        <div className="bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low rounded-xl p-space-lg mb-space-lg shadow-sm relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative z-10">
            <div className="flex flex-col max-w-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-primary text-on-primary font-label-sm text-[10px] tracking-wider px-2 py-0.5 rounded font-bold uppercase">
                  Tri-Source Triangulation
                </span>
                <span className="font-label-sm text-label-sm text-outline">ALGORITHM CIVI-TRIPLET v4.1</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold uppercase">
                What was planned. What was reported. What can we actually observe?
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Eliminating reporting bias by superimposing synthetic aperture radar (SAR) dielectric analysis,
                elevation changes, and high-resolution visible imagery against official EPC claims.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm lg:gap-space-md flex-shrink-0">
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between min-w-[130px]">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Planned Target
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-secondary">event_note</span>
                </div>
                <div className="mt-2">
                  <div className="font-display-lg text-display-lg text-on-surface font-semibold tracking-tight">
                    85.0%
                  </div>
                  <div className="font-label-sm text-label-sm text-outline mt-0.5">As per baseline schedule</div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between min-w-[130px]">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Reported (EPC)
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    assignment_turned_in
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-display-lg text-display-lg text-primary font-semibold tracking-tight">
                    68.2%
                  </div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                    Q3 Certified Filing
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between min-w-[130px]">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Observed (EO)
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-tertiary">satellite_alt</span>
                </div>
                <div className="mt-2">
                  <div className="font-display-lg text-display-lg text-tertiary font-semibold tracking-tight">
                    41.5%
                  </div>
                  <div className="font-label-sm text-label-sm text-tertiary font-medium mt-0.5">
                    Verified Ground Truth
                  </div>
                </div>
              </div>

              <div className="bg-error-container p-space-md rounded-lg shadow-sm flex flex-col justify-between min-w-[150px]">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-error-container uppercase tracking-wider font-bold">
                    Discrepancy
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-error">fmd_bad</span>
                </div>
                <div className="mt-2">
                  <div className="font-display-lg text-display-lg text-error font-bold tracking-tight">-26.7%</div>
                  <div className="font-label-sm text-label-sm text-on-error-container font-semibold mt-0.5">
                    Schedule Slippage Audit Flag
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Milestone Verification Table Section */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-lg">
          <div className="p-space-md bg-surface-container-lowest flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Milestone Structural Ledger
              </span>
              <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded font-mono">
                7 MILESTONES MONITORED
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded text-outline font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                <span>Filter: All Deviations</span>
              </div>
              <button
                type="button"
                className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
                title="Export Ledger as CSV"
              >
                <span className="material-symbols-outlined text-[18px]">table_view</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-outline font-headline-sm text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-space-md font-semibold">Milestone Name &amp; Scope</th>
                  <th className="py-2.5 px-space-md font-semibold text-center whitespace-nowrap">Planned Date</th>
                  <th className="py-2.5 px-space-md font-semibold text-right whitespace-nowrap">
                    Reported Progress
                  </th>
                  <th className="py-2.5 px-space-md font-semibold text-right whitespace-nowrap">
                    Satellite Ground Truth
                  </th>
                  <th className="py-2.5 px-space-md font-semibold text-center whitespace-nowrap">
                    Schedule Variance
                  </th>
                  <th className="py-2.5 px-space-md font-semibold text-center whitespace-nowrap">Audit Status</th>
                  <th className="py-2.5 px-space-md font-semibold text-center whitespace-nowrap">Sensor Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
                {/* Row 1 */}
                <tr className="hover:bg-surface-container/50 transition-colors">
                  <td className="py-3 px-space-md">
                    <div className="flex items-start gap-2">
                      <span className="font-code-md text-code-md text-outline mt-0.5">01</span>
                      <div>
                        <div className="font-label-lg text-label-lg font-semibold text-on-surface">
                          Land Clearing &amp; Right-of-Way Preparation
                        </div>
                        <div className="font-label-sm text-label-sm text-outline mt-0.5">
                          Scope: 32.0 km full-corridor perimeter boundary defoliation
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-code-md text-code-md text-on-surface-variant whitespace-nowrap">
                    15 Jan 2023
                  </td>
                  <td className="py-3 px-space-md text-right font-code-md text-code-md font-semibold text-primary">
                    100.0%
                  </td>
                  <td className="py-3 px-space-md text-right whitespace-nowrap">
                    <div className="font-code-md text-code-md font-bold text-tertiary">100.0%</div>
                    <div className="font-label-sm text-label-sm text-outline">32.0 km fully cleared</div>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="font-code-md text-code-md text-tertiary font-medium">0 Days</span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                      VISUALLY SUPPORTED
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <Link
                      to="/evidence"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">satellite</span>
                      <span>Pass-1 Orbit</span>
                    </Link>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-surface-container/50 transition-colors">
                  <td className="py-3 px-space-md">
                    <div className="flex items-start gap-2">
                      <span className="font-code-md text-code-md text-outline mt-0.5">02</span>
                      <div>
                        <div className="font-label-lg text-label-lg font-semibold text-on-surface">
                          Earthwork &amp; Embankment Formation
                        </div>
                        <div className="font-label-sm text-label-sm text-outline mt-0.5">
                          Scope: 32.0 km continuous sub-grade stabilization &amp; grading
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-code-md text-code-md text-on-surface-variant whitespace-nowrap">
                    30 Sep 2023
                  </td>
                  <td className="py-3 px-space-md text-right font-code-md text-code-md font-semibold text-primary">
                    95.0%
                  </td>
                  <td className="py-3 px-space-md text-right whitespace-nowrap">
                    <div className="font-code-md text-code-md font-bold text-tertiary">88.5%</div>
                    <div className="font-label-sm text-label-sm text-outline">28.3 km sub-grade formed</div>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="font-code-md text-code-md text-secondary font-medium">+1.5 mo</span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                      VISUALLY SUPPORTED
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <Link
                      to="/evidence"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">terrain</span>
                      <span>Elevation Mask</span>
                    </Link>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-surface-container/50 transition-colors bg-surface-container-lowest">
                  <td className="py-3 px-space-md">
                    <div className="flex items-start gap-2">
                      <span className="font-code-md text-code-md text-outline mt-0.5">03</span>
                      <div>
                        <div className="font-label-lg text-label-lg font-semibold text-on-surface">
                          Major Drainage &amp; Culverts
                        </div>
                        <div className="font-label-sm text-label-sm text-outline mt-0.5">
                          Scope: 48 cross-drainage structures &amp; retaining channels
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-code-md text-code-md text-on-surface-variant whitespace-nowrap">
                    15 Feb 2024
                  </td>
                  <td className="py-3 px-space-md text-right font-code-md text-code-md font-semibold text-primary">
                    82.0%
                  </td>
                  <td className="py-3 px-space-md text-right whitespace-nowrap">
                    <div className="font-code-md text-code-md font-bold text-secondary">64.0%</div>
                    <div className="font-label-sm text-label-sm text-outline">31/48 structures detected</div>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="font-code-md text-code-md text-on-surface-variant font-medium">+3.0 mo</span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-secondary font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      REQUIRES VERIFICATION
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <Link
                      to="/evidence"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">radar</span>
                      <span>SAR Reflectance</span>
                    </Link>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-surface-container/50 transition-colors bg-error-container/10">
                  <td className="py-3 px-space-md">
                    <div className="flex items-start gap-2">
                      <span className="font-code-md text-code-md text-error mt-0.5">04</span>
                      <div>
                        <div className="font-label-lg text-label-lg font-semibold text-on-surface">
                          Major Bridge &amp; Interchange Piers (Km 191+200)
                        </div>
                        <div className="font-label-sm text-label-sm text-outline mt-0.5">
                          Scope: 16 dual piers &amp; prestressed concrete girder erection
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-code-md text-code-md text-on-surface-variant whitespace-nowrap">
                    30 Jun 2024
                  </td>
                  <td className="py-3 px-space-md text-right font-code-md text-code-md font-semibold text-primary">
                    74.0%
                  </td>
                  <td className="py-3 px-space-md text-right whitespace-nowrap">
                    <div className="font-code-md text-code-md font-bold text-error">38.0%</div>
                    <div className="font-label-sm text-label-sm text-error">Pier cap only; 0 deck segments</div>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="font-code-md text-code-md text-error font-semibold">+6.5 mo</span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error" />
                      REQUIRES VERIFICATION
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <Link
                      to="/evidence"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                      <span>High-Res Zoom</span>
                    </Link>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-surface-container/50 transition-colors bg-error-container/10">
                  <td className="py-3 px-space-md">
                    <div className="flex items-start gap-2">
                      <span className="font-code-md text-code-md text-error mt-0.5">05</span>
                      <div>
                        <div className="font-label-lg text-label-lg font-semibold text-on-surface">
                          Bituminous Sub-Base &amp; Dense Bitumen Macadam (DBM)
                        </div>
                        <div className="font-label-sm text-label-sm text-outline mt-0.5">
                          Scope: 150mm base paving layer along entire 8-lane profile
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-code-md text-code-md text-on-surface-variant whitespace-nowrap">
                    31 Aug 2024
                  </td>
                  <td className="py-3 px-space-md text-right font-code-md text-code-md font-semibold text-primary">
                    62.0%
                  </td>
                  <td className="py-3 px-space-md text-right whitespace-nowrap">
                    <div className="font-code-md text-code-md font-bold text-error">32.0%</div>
                    <div className="font-label-sm text-label-sm text-error">10.2 km blacktop detected</div>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="font-code-md text-code-md text-error font-semibold">+7.2 mo</span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error" />
                      REQUIRES VERIFICATION
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <Link
                      to="/evidence"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">gradient</span>
                      <span>Spectral Mask</span>
                    </Link>
                  </td>
                </tr>

                {/* Row 6 */}
                <tr className="hover:bg-surface-container/50 transition-colors bg-error-container/10">
                  <td className="py-3 px-space-md">
                    <div className="flex items-start gap-2">
                      <span className="font-code-md text-code-md text-error mt-0.5">06</span>
                      <div>
                        <div className="font-label-lg text-label-lg font-semibold text-on-surface">
                          Wearing Course &amp; Asphalt Concrete Paving
                        </div>
                        <div className="font-label-sm text-label-sm text-outline mt-0.5">
                          Scope: Final 50mm friction course layer application
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-code-md text-code-md text-on-surface-variant whitespace-nowrap">
                    30 Nov 2024
                  </td>
                  <td className="py-3 px-space-md text-right font-code-md text-code-md font-semibold text-primary">
                    35.0%
                  </td>
                  <td className="py-3 px-space-md text-right whitespace-nowrap">
                    <div className="font-code-md text-code-md font-bold text-error">8.5%</div>
                    <div className="font-label-sm text-label-sm text-error">2.7 km completed</div>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="font-code-md text-code-md text-error font-semibold">+8.0 mo</span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error" />
                      REQUIRES VERIFICATION
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <Link
                      to="/evidence"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">thermostat</span>
                      <span>Multi-band IR</span>
                    </Link>
                  </td>
                </tr>

                {/* Row 7 */}
                <tr className="hover:bg-surface-container/50 transition-colors">
                  <td className="py-3 px-space-md">
                    <div className="flex items-start gap-2">
                      <span className="font-code-md text-code-md text-outline mt-0.5">07</span>
                      <div>
                        <div className="font-label-lg text-label-lg font-semibold text-on-surface">
                          Signage, Median Barriers &amp; Road Marking
                        </div>
                        <div className="font-label-sm text-label-sm text-outline mt-0.5">
                          Scope: High-reflective thermo markings, gantry &amp; crash barriers
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-code-md text-code-md text-on-surface-variant whitespace-nowrap">
                    15 Jan 2025
                  </td>
                  <td className="py-3 px-space-md text-right font-code-md text-code-md font-semibold text-primary">
                    12.0%
                  </td>
                  <td className="py-3 px-space-md text-right whitespace-nowrap">
                    <div className="font-code-md text-code-md font-bold text-outline">0.0%</div>
                    <div className="font-label-sm text-label-sm text-outline">Unobservable / Not Started</div>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="font-code-md text-code-md text-error font-semibold">Critical</span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                      NOT OBSERVABLE
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-center whitespace-nowrap">
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-low text-outline font-label-sm text-label-sm cursor-not-allowed opacity-75"
                    >
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>Pending Orbit</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-surface-container-low p-space-sm px-space-md flex flex-wrap items-center justify-between text-outline font-label-sm text-label-sm gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">info</span>
              <span>
                Resolution floor: 0.3m (Panchromatic), 10m (SAR Phase Coherence). Next ISRO Cartosat-3 reposition
                scheduled in 48 hours.
              </span>
            </div>
            <div>Confidence Interval: 98.4% (p &lt; 0.001)</div>
          </div>
        </div>

        {/* Visual Analytics Section: Split 60/40 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
          {/* Left Side (7 cols): Timeline Discrepancy Chart */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Milestone Progress &amp; Timeline Discrepancy
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Horizontal breakdown of Planned vs. Reported vs. Observed ground truth.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-space-md bg-surface-container-low px-space-sm py-1 rounded font-label-sm text-label-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-2 rounded bg-inverse-surface" />
                    <span className="text-on-surface-variant">Planned</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-2 rounded bg-primary" />
                    <span className="text-on-surface-variant">Reported</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-2 rounded bg-tertiary" />
                    <span className="text-on-surface-variant">Observed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-2 rounded bg-error-container" />
                    <span className="text-error font-medium">Gap</span>
                  </div>
                </div>
              </div>

              <div className="space-y-space-md my-2">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface font-semibold">1. Land Clearing &amp; ROW (32 km)</span>
                    <span className="text-tertiary font-mono">100% Observed / 100% Reported</span>
                  </div>
                  <div className="relative w-full h-4 bg-surface-container-low rounded overflow-hidden flex">
                    <div className="h-full bg-tertiary" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface font-semibold">2. Earthwork &amp; Embankment</span>
                    <span className="text-on-surface-variant font-mono">
                      88.5% Observed / 95.0% Reported <span className="text-secondary font-semibold">(-6.5%)</span>
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-surface-container-low rounded overflow-hidden flex">
                    <div className="h-full bg-tertiary" style={{ width: '88.5%' }} />
                    <div className="h-full bg-error/30" style={{ width: '6.5%' }} />
                    <div className="h-full bg-inverse-surface/10" style={{ width: '5%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface font-semibold">3. Drainage &amp; Culverts (48 Structures)</span>
                    <span className="text-on-surface-variant font-mono">
                      64.0% Observed / 82.0% Reported <span className="text-error font-semibold">(-18.0%)</span>
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-surface-container-low rounded overflow-hidden flex">
                    <div className="h-full bg-tertiary" style={{ width: '64.0%' }} />
                    <div className="h-full bg-error/40" style={{ width: '18.0%' }} />
                    <div className="h-full bg-inverse-surface/10" style={{ width: '18.0%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface font-semibold">4. Major Bridge Piers (Km 191+200)</span>
                    <span className="text-error font-mono font-bold">
                      38.0% Observed / 74.0% Reported (-36.0%)
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-surface-container-low rounded overflow-hidden flex">
                    <div className="h-full bg-tertiary" style={{ width: '38.0%' }} />
                    <div className="h-full bg-error" style={{ width: '36.0%' }} />
                    <div className="h-full bg-inverse-surface/15" style={{ width: '26.0%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface font-semibold">5. Bituminous Sub-Base (DBM)</span>
                    <span className="text-error font-mono font-bold">
                      32.0% Observed / 62.0% Reported (-30.0%)
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-surface-container-low rounded overflow-hidden flex">
                    <div className="h-full bg-tertiary" style={{ width: '32.0%' }} />
                    <div className="h-full bg-error" style={{ width: '30.0%' }} />
                    <div className="h-full bg-inverse-surface/15" style={{ width: '38.0%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface font-semibold">6. Asphalt Paving (Wearing Course)</span>
                    <span className="text-error font-mono font-bold">8.5% Observed / 35.0% Reported (-26.5%)</span>
                  </div>
                  <div className="relative w-full h-4 bg-surface-container-low rounded overflow-hidden flex">
                    <div className="h-full bg-tertiary" style={{ width: '8.5%' }} />
                    <div className="h-full bg-error" style={{ width: '26.5%' }} />
                    <div className="h-full bg-inverse-surface/15" style={{ width: '65.0%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface font-semibold">7. Signage, Median Barriers &amp; Marking</span>
                    <span className="text-outline font-mono">0.0% Observed / 12.0% Reported (-12.0%)</span>
                  </div>
                  <div className="relative w-full h-4 bg-surface-container-low rounded overflow-hidden flex">
                    <div className="h-full bg-error/50" style={{ width: '12.0%' }} />
                    <div className="h-full bg-inverse-surface/10" style={{ width: '88.0%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-sm border-t border-surface-container-low flex justify-between font-label-sm text-label-sm text-outline">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100% Completion</span>
            </div>
          </div>

          {/* Right Side (5 cols): Investigation Alerts & Rapid Escalation */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-space-sm mb-space-sm">
                  <div className="flex items-center gap-1.5 text-error font-headline-sm text-headline-sm">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    <span>Investigation Alert</span>
                  </div>
                  <span className="bg-error-container text-on-error-container font-label-sm text-label-sm font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    CRITICAL AUDIT
                  </span>
                </div>
                <div className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-xs">
                  Critical Flyover Superstructure Delay
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  A <strong>120-day construction hiatus</strong> has been confirmed via synthetic aperture radar (SAR)
                  temporal coherence. No vertical progression or girder positioning has taken place at Km 191+200
                  interchange despite active billings.
                </p>

                <div className="bg-surface-container-low p-space-sm rounded-lg mb-space-md flex gap-space-sm items-center">
                  <img
                    alt="SAR surveillance imagery of bridge piers"
                    className="w-20 h-20 rounded object-cover shadow-sm flex-shrink-0"
                    src={RADAR_MICRO_URL}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-outline">SENSOR RADAR C-BAND</span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                      SAR Zero-Coherence Anomaly
                    </span>
                    <span className="font-body-sm text-body-sm text-error mt-0.5">
                      Displacement Index: 0.02 mm/mo (Static)
                    </span>
                    <span className="font-label-sm text-label-sm text-outline mt-0.5">
                      Last Orbit: Sentinel-1B Pass 42
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container p-space-sm rounded-lg mb-space-md">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">gavel</span>
                    <div>
                      <span className="font-label-md text-label-md font-bold text-on-surface block">
                        Recommended Statutory Next Action:
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Trigger Section 14 Ground Inspection Notice &amp; Escrow Withholding to EPC Contractor.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
                <Link
                  to="/financials"
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary py-2.5 px-space-md rounded font-label-md text-label-md transition-all shadow-sm"
                >
                  <span>Transfer Audit Data to Financial Analysis</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <Link
                  to="/reports"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface py-2.5 px-space-md rounded font-label-md text-label-md transition-colors shadow-sm"
                  title="Generate Legal Notice PDF"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline">print</span>
                  <span>Export Notice</span>
                </Link>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                </div>
                <div>
                  <div className="font-label-md text-label-md font-semibold text-on-surface">
                    Automated Cross-Check Queue
                  </div>
                  <div className="font-label-sm text-label-sm text-outline">
                    Next scheduled sync: 14:00 IST (RISAT-2B SAR)
                  </div>
                </div>
              </div>
              <span className="bg-tertiary/10 text-tertiary font-label-sm text-label-sm px-2 py-0.5 rounded font-semibold uppercase">
                Nominal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
