import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './components/login/AuthContext';
import ProtectedRoute from './components/login/ProtectedRoute';
import RoleBasedRoute from './components/login/RoleBasedRoute';
import RoleRedirect from './components/login/RoleRedirect';
import LoginCard from './components/login/LoginCard';
import ResetVerifyPage from './components/login/ResetVerifyPage';
import GeoRestrictionProvider from './components/login/GeoRestrictionProvider';
import SessionTimeoutContainer from './components/login/SessionTimeoutContainer';
import ConcurrentSessionContainer from './components/login/ConcurrentSessionContainer';
// Importar componentes para Developer
import DevHomePage from './components/developer/welcome/Welcome';
import DevSupportPage from './components/developer/support/SupportPage';
import DevReferralsPage from './components/developer/referrals/ReferralsPage';
import DevCreateNF from './components/developer/referrals/CreateNF/CreateNF';
import DevPatientsPage from './components/developer/patients/PatientsPage';
import DevPatientInfoPage from './components/developer/patients/Patients/InfoPaciente/PatientInfoPage'; // Nueva ruta actualizada
import DevStaffingPage from './components/developer/patients/staffing/StaffingPage';
import DevAccounting from './components/developer/accounting/Accounting';
import DevUserProfile from './components/developer/profile/UserProfile';

import AdminHomePage from './components/admin/welcome/Welcome';
import AdminSupportPage from './components/admin/support/SupportPage';
import AdminReferralsPage from './components/admin/referrals/ReferralsPage';
import AdminCreateNF from './components/admin/referrals/CreateNF/CreateNF';
import AdminPatientsPage from './components/admin/patients/PatientsPage';
import AdminPatientInfoPage from './components/admin/patients/Patients/InfoPaciente/PatientInfoPage'; // Nueva ruta actualizada
import AdminStaffingPage from './components/admin/patients/staffing/StaffingPage';
import AdminAccounting from './components/admin/accounting/Accounting';
import AdminUserProfile from './components/admin/profile/UserProfile';

import TBHomePage from './components/pt-ot-st/welcome/Welcome';
import TBSupportPage from './components/pt-ot-st/support/SupportPage'; // No se usará por restricción
import TBPatientsPage from './components/pt-ot-st/patients/PatientsPage';
import TBPatientInfoPage from './components/pt-ot-st/patients/Patients/InfoPaciente/PatientInfoPage'; // Nueva ruta actualizada
import TBUserProfile from './components/pt-ot-st/profile/UserProfile';
import TBReferralsPage from './components/pt-ot-st/referrals/ReferralsPage'; // Componente para referrals de terapeutas
// Importar estilos para componentes nuevos
import './styles/Login/Login.scss';
import './styles/Login/AuthLoadingModal.scss';
import './styles/Login/PremiumLoadingModal.scss'; 
import './styles/Login/AccountLockoutModal.scss';
import './styles/Login/SessionTimeoutWarning.scss';
import './styles/Login/ConcurrentSessionModal.scss';
import './styles/Login/GeoRestrictionModal.scss';
import './styles/Login/ResetPassword.scss';
// Importar Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';
// Define therapy roles para simplificar verificaciones
const THERAPY_ROLES = ['PT', 'OT', 'ST', 'PTA', 'COTA', 'STA'];
const ADMIN_ROLES = ['Administrator', 'Developer'];
const ALL_ROLES = [...THERAPY_ROLES, ...ADMIN_ROLES, 'Supportive', 'Support', 'Agency'];
function App() {
  return (
    <GeoRestrictionProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<LoginCard />} />
            <Route path="/reset-password" element={<ResetVerifyPage />} />
            
            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              {/* Componentes de sesión globales (timeout, concurrencia) */}
              <Route element={
                <>
                  <SessionTimeoutContainer />
                  <ConcurrentSessionContainer />
                  <Outlet />
                </>
              }>
                {/* Ruta para redireccionar al home basado en el rol */}
                <Route path="/home" element={<RoleRedirect />} />
                
                {/* Rutas específicas para Developer - con acceso completo */}
                <Route element={<RoleBasedRoute allowedRoles={['Developer']} />}>
                  <Route path="/developer/homePage" element={<DevHomePage />} />
                  <Route path="/developer/support" element={<DevSupportPage />} />
                  <Route path="/developer/referrals" element={<DevReferralsPage />} />
                  <Route path="/developer/createNewReferral" element={<DevCreateNF />} />
                  <Route path="/developer/patients" element={<DevPatientsPage />} />
                  <Route path="/developer/paciente/:patientId" element={<DevPatientInfoPage />} />
                  <Route path="/developer/staffing" element={<DevStaffingPage />} />
                  <Route path="/developer/accounting" element={<DevAccounting />} />
                  <Route path="/developer/profile" element={<DevUserProfile />} />
                </Route>
                
                {/* Rutas específicas para Administrator - sin acceso a support */}
                <Route element={<RoleBasedRoute allowedRoles={['Administrator']} />}>
                  <Route path="/administrator/homePage" element={<AdminHomePage />} />
                  <Route path="/administrator/referrals" element={<AdminReferralsPage />} />
                  <Route path="/administrator/createNewReferral" element={<AdminCreateNF />} />
                  <Route path="/administrator/patients" element={<AdminPatientsPage />} />
                  <Route path="/administrator/paciente/:patientId" element={<AdminPatientInfoPage />} />
                  <Route path="/administrator/staffing" element={<AdminStaffingPage />} />
                  <Route path="/administrator/accounting" element={<AdminAccounting />} />
                  <Route path="/administrator/profile" element={<AdminUserProfile />} />
                </Route>
                
                {/* Support page - SOLO para Developers */}
                <Route element={<RoleBasedRoute allowedRoles={['Developer']} />}>
                  <Route path="/support" element={<DevSupportPage />} />
                </Route>
                
                {/* Rutas de Accounting y System Management - SOLO para Admins y Developers */}
                <Route element={<RoleBasedRoute allowedRoles={['Administrator', 'Developer']} />}>
                  <Route path="/accounting" element={<RoleRedirect />} />
                  <Route path="/management" element={<RoleRedirect />} />
                </Route>
                
                {/* Rutas de Referrals - para TODOS los roles */}
                <Route element={<RoleBasedRoute allowedRoles={ALL_ROLES} />}>
                  <Route path="/referrals" element={<RoleRedirect />} />
                </Route>
                
                {/* Ruta de CreateNewReferral - SOLO para admins */}
                <Route element={<RoleBasedRoute allowedRoles={ADMIN_ROLES} />}>
                  <Route path="/createNewReferral" element={<RoleRedirect />} />
                  <Route path="/staffing" element={<RoleRedirect />} />
                </Route>
                
                {/* Rutas específicas para PT con acceso a referrals */}
                <Route element={<RoleBasedRoute allowedRoles={['PT', 'PT - Administrator']} />}>
                  <Route path="/pt/homePage" element={<TBHomePage />} />
                  <Route path="/pt/patients" element={<TBPatientsPage />} />
                  <Route path="/pt/paciente/:patientId" element={<TBPatientInfoPage />} />
                  <Route path="/pt/profile" element={<TBUserProfile />} />
                  <Route path="/pt/referrals" element={<TBReferralsPage />} />
                </Route>
                
                {/* Rutas específicas para OT con acceso a referrals */}
                <Route element={<RoleBasedRoute allowedRoles={['OT', 'OT - Administrator']} />}>
                  <Route path="/ot/homePage" element={<TBHomePage />} />
                  <Route path="/ot/patients" element={<TBPatientsPage />} />
                  <Route path="/ot/paciente/:patientId" element={<TBPatientInfoPage />} />
                  <Route path="/ot/profile" element={<TBUserProfile />} />
                  <Route path="/ot/referrals" element={<TBReferralsPage />} />
                </Route>
                
                {/* Rutas específicas para ST con acceso a referrals */}
                <Route element={<RoleBasedRoute allowedRoles={['ST', 'ST - Administrator']} />}>
                  <Route path="/st/homePage" element={<TBHomePage />} />
                  <Route path="/st/patients" element={<TBPatientsPage />} />
                  <Route path="/st/paciente/:patientId" element={<TBPatientInfoPage />} />
                  <Route path="/st/profile" element={<TBUserProfile />} />
                  <Route path="/st/referrals" element={<TBReferralsPage />} />
                </Route>
                
                {/* Rutas específicas para PTA con acceso a referrals */}
                <Route element={<RoleBasedRoute allowedRoles={['PTA']} />}>
                  <Route path="/pta/homePage" element={<TBHomePage />} />
                  <Route path="/pta/patients" element={<TBPatientsPage />} />
                  <Route path="/pta/paciente/:patientId" element={<TBPatientInfoPage />} />
                  <Route path="/pta/profile" element={<TBUserProfile />} />
                  <Route path="/pta/referrals" element={<TBReferralsPage />} />
                </Route>
                
                {/* Rutas específicas para COTA con acceso a referrals */}
                <Route element={<RoleBasedRoute allowedRoles={['COTA']} />}>
                  <Route path="/cota/homePage" element={<TBHomePage />} />
                  <Route path="/cota/patients" element={<TBPatientsPage />} />
                  <Route path="/cota/paciente/:patientId" element={<TBPatientInfoPage />} />
                  <Route path="/cota/profile" element={<TBUserProfile />} />
                  <Route path="/cota/referrals" element={<TBReferralsPage />} />
                </Route>
                
                {/* Rutas específicas para STA con acceso a referrals */}
                <Route element={<RoleBasedRoute allowedRoles={['STA']} />}>
                  <Route path="/sta/homePage" element={<TBHomePage />} />
                  <Route path="/sta/patients" element={<TBPatientsPage />} />
                  <Route path="/sta/paciente/:patientId" element={<TBPatientInfoPage />} />
                  <Route path="/sta/profile" element={<TBUserProfile />} />
                  <Route path="/sta/referrals" element={<TBReferralsPage />} />
                </Route>
                
                {/* Rutas específicas para Supportive/Support con acceso a referrals */}
                <Route element={<RoleBasedRoute allowedRoles={['Supportive', 'Support']} />}>
                  <Route path="/supportive/homePage" element={<TBHomePage />} />
                  <Route path="/supportive/patients" element={<TBPatientsPage />} />
                  <Route path="/supportive/paciente/:patientId" element={<TBPatientInfoPage />} />
                  <Route path="/supportive/profile" element={<TBUserProfile />} />
                  <Route path="/supportive/referrals" element={<TBReferralsPage />} />
                </Route>
                
                {/* Rutas específicas para Agency con acceso a referrals */}
                <Route element={<RoleBasedRoute allowedRoles={['Agency']} />}>
                  <Route path="/agency/homePage" element={<TBHomePage />} />
                  <Route path="/agency/patients" element={<TBPatientsPage />} />
                  <Route path="/agency/paciente/:patientId" element={<TBPatientInfoPage />} />
                  <Route path="/agency/profile" element={<TBUserProfile />} />
                  <Route path="/agency/referrals" element={<TBReferralsPage />} />
                </Route>
                
                {/* Ruta para pacientes - disponible para todos los roles */}
                <Route element={<RoleBasedRoute allowedRoles={ALL_ROLES} />}>
                  <Route path="/patients" element={<RoleRedirect />} />
                  <Route path="/paciente/:patientId" element={<RoleRedirect />} />
                  <Route path="/profile" element={<RoleRedirect />} />
                </Route>
                
                {/* Ruta por defecto para homePage */}
                <Route path="/homePage" element={<RoleRedirect />} />
              </Route>
            </Route>
            
            {/* Ruta por defecto - Redirige al login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </GeoRestrictionProvider>
  );
}
export default App;