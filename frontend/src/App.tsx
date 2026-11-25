import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { ProjectExplorerPage } from './pages/ProjectExplorerPage';
import { SatelliteEvidencePage } from './pages/SatelliteEvidencePage';
import { MilestoneVerificationPage } from './pages/MilestoneVerificationPage';
import { FinancialAnalysisPage } from './pages/FinancialAnalysisPage';
import { ProjectAlertsPage } from './pages/ProjectAlertsPage';
import { RiskAssessmentPage } from './pages/RiskAssessmentPage';
import { ReportsAndDocumentsPage } from './pages/ReportsAndDocumentsPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/explorer" element={<ProjectExplorerPage />} />
        <Route path="/evidence" element={<SatelliteEvidencePage />} />
        <Route path="/milestones" element={<MilestoneVerificationPage />} />
        <Route path="/financials" element={<FinancialAnalysisPage />} />
        <Route path="/alerts" element={<ProjectAlertsPage />} />
        <Route path="/risk" element={<RiskAssessmentPage />} />
        <Route path="/reports" element={<ReportsAndDocumentsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
