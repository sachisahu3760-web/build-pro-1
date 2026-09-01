import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { LabourContractorView } from './components/LabourContractorView';
import { MaterialsView } from './components/MaterialsView';
import { WorkersView } from './components/WorkersView';
import { LiveLocationView } from './components/LiveLocationView';
import { SiteProgressView } from './components/SiteProgressView';
import { SafetyComplianceView } from './components/SafetyComplianceView';
import { BudgetView } from './components/BudgetView';
import { DocumentsView } from './components/DocumentsView';
import { TeamChatView } from './components/TeamChatView';
import { ReportsView } from './components/ReportsView';
import { AiAssistantHub } from './components/AiAssistantHub';
import { CreateSiteModal } from './components/CreateSiteModal';
import { AddUserModal } from './components/AddUserModal';
import { MasterAdminView } from './components/MasterAdminView';
import { WorkerSelfPunchView } from './components/WorkerSelfPunchView';
import { PettyCashView } from './components/PettyCashView';
import { AccountView } from './components/AccountView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { AllFeaturesModal } from './components/AllFeaturesModal';
import { store } from './lib/offlineStore';
import { LanguageCode, Role } from './types';

export function App() {
  const [appState, setAppState] = useState(store.getState());
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [showAiHub, setShowAiHub] = useState(false);
  const [showCreateSiteModal, setShowCreateSiteModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAllFeaturesModal, setShowAllFeaturesModal] = useState(false);

  // Subscribe to offline store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setAppState({ ...store.getState() });
    });
    return () => unsubscribe();
  }, []);

  // When role is worker, default to selfPunch view (Punching Button) if on an admin/management view
  useEffect(() => {
    if (appState.currentRole === 'worker') {
      const allowedWorkerViews: NavView[] = ['selfPunch', 'teamChat', 'liveLocation', 'safety', 'account'];
      if (!allowedWorkerViews.includes(currentView)) {
        setCurrentView('selfPunch');
      }
    }
  }, [appState.currentRole, currentView]);

  const activeProject =
    appState.projects?.find((p) => p.id === appState.activeProjectId) ||
    appState.projects?.[0] ||
    store.getActiveProject();

  const projectMaterials = (appState.materials || []).filter((m) => m.projectId === activeProject?.id);
  const projectWorkers = (appState.workers || []).filter((w) => w.assignedProjectId === activeProject?.id);
  const projectUpdates = (appState.siteUpdates || []).filter((u) => u.projectId === activeProject?.id);
  const projectIncidents = (appState.safetyIncidents || []).filter((i) => i.projectId === activeProject?.id);
  const projectExpenses = (appState.budgetExpenses || []).filter((e) => e.projectId === activeProject?.id);
  const projectDocuments = (appState.documents || []).filter((d) => d.projectId === activeProject?.id);
  const projectMessages = (appState.chatMessages || []).filter((m) => m.projectId === activeProject?.id);
  const projectPunchRecords = (appState.punchRecords || []).filter(
    (p) => !p.projectId || p.projectId === activeProject?.id || p.projectName === activeProject?.name
  );

  const materialsLowStockCount = projectMaterials.filter(
    (m) => m.status === 'Low Stock' || m.status === 'Critical Shortage'
  ).length;
  const safetyHazardsCount = projectIncidents.filter((i) => i.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155] flex flex-col font-sans select-none selection:bg-orange-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentLang={appState.currentLang}
        onLanguageChange={(lang: LanguageCode) => store.setLanguage(lang)}
        currentRole={appState.currentRole}
        onRoleChange={(role: Role) => store.setRole(role)}
        currentView={currentView}
        onSelectView={setCurrentView}
        isOnline={appState.isOnline}
        hasPendingSync={appState.pendingSyncCount > 0}
        pendingOfflineCount={appState.pendingSyncCount}
        activeProject={activeProject}
        activeProjectId={appState.activeProjectId}
        projects={appState.projects || []}
        onSelectProject={(id: string) => store.setActiveProject(id)}
        notifications={appState.notifications}
        onOpenAiHub={() => setShowAiHub(true)}
        onOpenCreateSiteModal={() => setShowCreateSiteModal(true)}
        onOpenAddUserModal={() => setShowAddUserModal(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full max-w-[1700px] mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          currentLang={appState.currentLang}
          currentRole={appState.currentRole}
          workers={projectWorkers}
          materialsLowStockCount={materialsLowStockCount}
          safetyHazardsCount={safetyHazardsCount}
          unreadChatCount={2}
          onOpenAiHub={() => setShowAiHub(true)}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 pb-24 lg:pb-6 min-w-0 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#f8fafc]">
          {currentView === 'dashboard' && (
            <DashboardView
              project={activeProject}
              materials={projectMaterials}
              workers={projectWorkers}
              updates={projectUpdates}
              incidents={projectIncidents}
              expenses={projectExpenses}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
              onNavigate={setCurrentView}
              onOpenAiHub={() => setShowAiHub(true)}
              onOpenCreateSiteModal={() => setShowCreateSiteModal(true)}
              onOpenAddUserModal={() => setShowAddUserModal(true)}
            />
          )}

          {currentView === 'masterAdmin' && (
            <MasterAdminView
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
              systemUsers={appState.systemUsers || []}
              masterRateCards={appState.masterRateCards || []}
              securityAuditLogs={appState.securityAuditLogs || []}
              rolePermissions={appState.rolePermissions || ({} as any)}
              projects={appState.projects || []}
              activeProjectId={activeProject.id}
              onOpenCreateSiteModal={() => setShowCreateSiteModal(true)}
            />
          )}

          {currentView === 'selfPunch' && (
            <WorkerSelfPunchView
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
              workers={projectWorkers}
              punchRecords={projectPunchRecords}
              activeProject={activeProject}
            />
          )}

          {currentView === 'labourContractor' && (
            <LabourContractorView
              project={activeProject}
              projects={appState.projects || []}
              workOrders={appState.workOrders || []}
              siteDailyExpenses={appState.siteDailyExpenses || []}
              dailyLabourSummaries={appState.dailyLabourSummaries || []}
              dailyProgressReports={appState.dailyProgressReports || []}
              dailyProfitLossReports={appState.dailyProfitLossReports || []}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
              onSelectProject={(id) => store.setActiveProject(id)}
              onOpenCreateSiteModal={() => setShowCreateSiteModal(true)}
            />
          )}

          {currentView === 'pettyCash' && (
            <PettyCashView
              projects={appState.projects || []}
              activeProjectId={appState.activeProjectId}
              onSelectProject={(id) => store.setActiveProject(id)}
              pettyCashAccounts={appState.pettyCashAccounts || []}
              dailyCashPayments={appState.dailyCashPayments || []}
              dailyCashReconciliations={appState.dailyCashReconciliations || []}
              currentRole={appState.currentRole}
              currentLang={appState.currentLang}
            />
          )}

          {currentView === 'materials' && (
            <MaterialsView
              materials={projectMaterials}
              project={activeProject}
              projects={appState.projects || []}
              materialCategories={appState.materialCategories || []}
              materialTransactions={appState.materialTransactions || []}
              centralStock={appState.centralStock || []}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
              onOpenAiHub={() => setShowAiHub(true)}
            />
          )}

          {currentView === 'workers' && (
            <WorkersView
              workers={projectWorkers}
              project={activeProject}
              punchRecords={projectPunchRecords}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
              onOpenAddUserModal={() => setShowAddUserModal(true)}
            />
          )}

          {currentView === 'liveLocation' && (
            <LiveLocationView
              project={activeProject}
              workers={projectWorkers}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
            />
          )}

          {currentView === 'siteProgress' && (
            <SiteProgressView
              updates={projectUpdates}
              project={activeProject}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
            />
          )}

          {currentView === 'safety' && (
            <SafetyComplianceView
              incidents={projectIncidents}
              docs={appState.complianceDocs}
              project={activeProject}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
            />
          )}

          {currentView === 'budget' && (
            <BudgetView
              expenses={projectExpenses}
              project={activeProject}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsView
              docs={projectDocuments}
              project={activeProject}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
            />
          )}

          {currentView === 'teamChat' && (
            <TeamChatView
              messages={projectMessages}
              project={activeProject}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              project={activeProject}
              materials={projectMaterials}
              workers={projectWorkers}
              updates={projectUpdates}
              incidents={projectIncidents}
              expenses={projectExpenses}
              currentLang={appState.currentLang}
              currentRole={appState.currentRole}
            />
          )}

          {currentView === 'account' && (
            <AccountView
              currentRole={appState.currentRole}
              currentLang={appState.currentLang}
              onLanguageChange={(lang) => store.setLanguage(lang)}
              onRoleChange={(role) => store.setRole(role)}
              activeProject={activeProject}
              projects={appState.projects || []}
              isOnline={appState.isOnline}
              systemUsers={appState.systemUsers || []}
            />
          )}
        </main>
      </div>

      {/* Gemini AI Intelligence Hub Modal */}
      <AiAssistantHub
        isOpen={showAiHub}
        onClose={() => setShowAiHub(false)}
        project={activeProject}
        materials={projectMaterials}
        workers={projectWorkers}
      />

      {/* Create / Add New Site Modal */}
      <CreateSiteModal
        isOpen={showCreateSiteModal}
        onClose={() => setShowCreateSiteModal(false)}
        onSiteCreated={(newProj) => {
          store.setActiveProject(newProj.id);
          setCurrentView('labourContractor');
        }}
      />

      {/* Add User (Role-Based Provisioning) Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        currentRole={appState.currentRole}
        projects={appState.projects || []}
        activeProjectId={activeProject?.id}
      />

      {/* All Features Navigation Modal (Mobile Drawer / Feature Explorer) */}
      <AllFeaturesModal
        isOpen={showAllFeaturesModal}
        onClose={() => setShowAllFeaturesModal(false)}
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          setShowAllFeaturesModal(false);
        }}
        currentRole={appState.currentRole}
        currentLang={appState.currentLang}
        onOpenAiHub={() => {
          setShowAllFeaturesModal(false);
          setShowAiHub(true);
        }}
        activeProject={activeProject}
        materialsLowStockCount={materialsLowStockCount}
        safetyHazardsCount={safetyHazardsCount}
        unreadChatCount={2}
        onRoleChange={(role) => store.setRole(role)}
        onLanguageChange={(lang) => store.setLanguage(lang)}
      />

      {/* Android Mobile Ergonomic Bottom Navigation Bar */}
      <AndroidBottomNav
        currentView={currentView}
        onSelectView={setCurrentView}
        currentRole={appState.currentRole}
        currentLang={appState.currentLang}
        onOpenMenu={() => setShowAllFeaturesModal(true)}
        materialsLowStockCount={materialsLowStockCount}
        safetyHazardsCount={safetyHazardsCount}
        unreadChatCount={2}
      />

      {/* Offline Connectivity Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
