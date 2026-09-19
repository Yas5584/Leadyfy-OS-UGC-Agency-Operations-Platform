import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import PortalLayout from './components/layout/PortalLayout';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard/Dashboard';
import ClientsPage from './pages/clients/ClientsPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ScriptsPage from './pages/scripts/ScriptsPage';
import CreatorsPage from './pages/creators/CreatorsPage';
import CreatorDetailPage from './pages/creators/CreatorDetailPage';
import ShootsPage from './pages/shoots/ShootsPage';
import VideosPage from './pages/videos/VideosPage';
import TasksPage from './pages/tasks/TasksPage';
import PaymentsPage from './pages/finance/PaymentsPage';
import ExpensesPage from './pages/finance/ExpensesPage';
import CreatorPayoutsPage from './pages/finance/CreatorPayoutsPage';
import TicketsPage from './pages/support/TicketsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import RolesPermissionsPage from './pages/admin/RolesPermissionsPage';
import EditorDashboard from './pages/editor/EditorDashboard';

// Portal pages
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalOrders from './pages/portal/PortalOrders';
import PortalOrderDetail from './pages/portal/PortalOrderDetail';
import PortalScripts from './pages/portal/PortalScripts';
import PortalVideos from './pages/portal/PortalVideos';
import PortalVideoReview from './pages/portal/PortalVideoReview';
import PortalSupport from './pages/portal/PortalSupport';
import PortalInvoices from './pages/portal/PortalInvoices';
import PortalReports from './pages/portal/PortalReports';
import PortalOrderRequestForm from './pages/portal/PortalOrderRequestForm';
import PortalOrderRequestDetail from './pages/portal/PortalOrderRequestDetail';

import ErrorBoundary from './components/ui/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Main App (Internal Staff) */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="scripts" element={<ScriptsPage />} />
            <Route path="creators" element={<CreatorsPage />} />
            <Route path="creators/:id" element={<CreatorDetailPage />} />
            <Route path="shoots" element={<ShootsPage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="editor-dashboard" element={<EditorDashboard />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="creator-payouts" element={<CreatorPayoutsPage />} />
            <Route path="support" element={<TicketsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="activity-logs" element={<ActivityLogsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="roles-permissions" element={<RolesPermissionsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Client Portal */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalDashboard />} />
            <Route path="orders" element={<PortalOrders />} />
            <Route path="orders/request" element={<PortalOrderRequestForm />} />
            <Route path="orders/requests/:id" element={<PortalOrderRequestDetail />} />
            <Route path="orders/:id" element={<PortalOrderDetail />} />
            <Route path="scripts" element={<PortalScripts />} />
            <Route path="videos" element={<PortalVideos />} />
            <Route path="videos/:id" element={<PortalVideoReview />} />
            <Route path="reports" element={<PortalReports />} />
            <Route path="support" element={<PortalSupport />} />
            <Route path="invoices" element={<PortalInvoices />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
