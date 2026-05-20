import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/MainLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Users from './pages/Users'
import Roles from './pages/Roles'
import Departments from './pages/Departments'
import Subjects from './pages/Subjects'
import BudgetPeriods from './pages/BudgetPeriods'
import BudgetTemplates from './pages/BudgetTemplates'
import BudgetData from './pages/BudgetData'
import BudgetApproval from './pages/BudgetApproval'
import BudgetSummary from './pages/BudgetSummary'
import BudgetVersion from './pages/BudgetVersion'
import BudgetVersionCompare from './pages/BudgetVersionCompare'
import ExpenseApplications from './pages/ExpenseApplications'
import OverBudgetApproval from './pages/OverBudgetApproval'
import Reimbursements from './pages/Reimbursements'
import Logs from './pages/Logs'
import BudgetExecution from './pages/BudgetExecution'
import BudgetComparison from './pages/BudgetComparison'

const AppContent = () => {
  const { token, loading } = useAuth()

  if (loading) {
    return null
  }

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route
          path="users"
          element={
            <ProtectedRoute permission="user:view">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="roles"
          element={
            <ProtectedRoute permission="role:view">
              <Roles />
            </ProtectedRoute>
          }
        />
        <Route
          path="departments"
          element={
            <ProtectedRoute permission="department:view">
              <Departments />
            </ProtectedRoute>
          }
        />
        <Route
          path="subjects"
          element={
            <ProtectedRoute permission="subject:view">
              <Subjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="budget-periods"
          element={
            <ProtectedRoute permission="budget_period:view">
              <BudgetPeriods />
            </ProtectedRoute>
          }
        />
        <Route
          path="budget-templates"
          element={
            <ProtectedRoute permission="budget_template:view">
              <BudgetTemplates />
            </ProtectedRoute>
          }
        />
        <Route
          path="budget-data"
          element={
            <ProtectedRoute>
              <BudgetData />
            </ProtectedRoute>
          }
        />
        <Route
          path="budget-approval"
          element={
            <ProtectedRoute>
              <BudgetApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="budget-summary"
          element={
            <ProtectedRoute>
              <BudgetSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="budget-version"
          element={
            <ProtectedRoute>
              <BudgetVersion />
            </ProtectedRoute>
          }
        />
        <Route
          path="budget-version/compare"
          element={
            <ProtectedRoute>
              <BudgetVersionCompare />
            </ProtectedRoute>
          }
        />
        <Route
          path="expense-applications"
          element={
            <ProtectedRoute>
              <ExpenseApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="over-budget-approval"
          element={
            <ProtectedRoute>
              <OverBudgetApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="reimbursements"
          element={
            <ProtectedRoute>
              <Reimbursements />
            </ProtectedRoute>
          }
        />
        <Route
          path="logs"
          element={
            <ProtectedRoute permission="log:view">
              <Logs />
            </ProtectedRoute>
          }
        />
        <Route
          path="budget-execution"
          element={
            <ProtectedRoute>
              <BudgetExecution />
            </ProtectedRoute>
          }
        />
        <Route
          path="budget-comparison"
          element={
            <ProtectedRoute>
              <BudgetComparison />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
