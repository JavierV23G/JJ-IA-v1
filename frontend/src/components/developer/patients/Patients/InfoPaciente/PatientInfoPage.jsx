import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../login/AuthContext';
import logoImg from '../../../../../assets/LogoMHC.jpeg';
import EmergencyContactsComponent from './EmergencyContactsComponent';
import CertificationPeriodComponent from './CertificationPeriodComponent';
import MedicalInfoComponent from './MedicalInfoComponent';
import DisciplinesComponent from './DisciplinesComponent';
import ScheduleComponent from './ScheduleComponent';
import ExercisesComponent from './ExercisesComponent';
import DocumentsComponent from './DocumentsComponent'; // Importamos el nuevo componente de Documentos
import '../../../../../styles/developer/Patients/InfoPaciente/PatientInfoPage.scss';

// Patient Info Header Component
const PatientInfoHeader = ({ patient, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const rolePrefix = window.location.hash.split('/')[1]; // Extract role from URL (developer, admin, etc.)

  // Handle back to patients list
  const handleBackToPatients = () => {
    navigate(`/${rolePrefix}/patients`);
  };

  return (
    <div className="patient-info-header">
      <div className="header-left">
        <button className="back-button" onClick={handleBackToPatients}>
          <i className="fas fa-arrow-left"></i>
          <span>Back to Patients</span>
        </button>
        <h1 className="patient-name">
          {patient?.name || 'Patient Information'}
          <span className={`status-indicator ${patient?.status?.toLowerCase()}`}>{patient?.status}</span>
        </h1>
        <div className="patient-id">#{patient?.id || '0'}</div>
      </div>
      <div className="header-actions">
        <button className="action-button edit">
          <i className="fas fa-edit"></i>
          <span>Edit</span>
        </button>
        <button className="action-button print">
          <i className="fas fa-print"></i>
          <span>Print</span>
        </button>
      </div>
    </div>
  );
};

// Tabs Navigation Component
const TabsNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'general', label: 'General Info', icon: 'fas fa-user' },
    { id: 'medical', label: 'Medical Info', icon: 'fas fa-notes-medical' },
    { id: 'disciplines', label: 'Disciplines', icon: 'fas fa-user-md' },
    { id: 'schedule', label: 'Schedule', icon: 'fas fa-calendar-alt' },
    { id: 'exercises', label: 'Exercises', icon: 'fas fa-dumbbell' },
    { id: 'documents', label: 'Documents', icon: 'fas fa-file-alt' },
    { id: 'notes', label: 'Notes', icon: 'fas fa-sticky-note' }
  ];

  return (
    <div className="patient-tabs-navigation">
      {tabs.map(tab => (
        <div 
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <div className="tab-icon"><i className={tab.icon}></i></div>
          <span>{tab.label}</span>
          {activeTab === tab.id && <div className="active-indicator"></div>}
          <div className="tab-hover-effect"></div>
        </div>
      ))}
    </div>
  );
};

// Personal Information Card Component
const PersonalInfoCard = ({ patient }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  return (
    <div className="info-card personal-info">
      <div className="card-header">
        <h3><i className="fas fa-user-circle"></i> Personal Information</h3>
        <button className="edit-button" onClick={toggleEdit}>
          <i className={`fas ${isEditing ? 'fa-check' : 'fa-pen'}`}></i>
          <span className="tooltip">{isEditing ? 'Save Changes' : 'Edit Information'}</span>
        </button>
      </div>
      <div className="card-body">
        {isEditing ? (
          // Edit form
          <div className="edit-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" defaultValue={patient?.name || ''} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="text" defaultValue={patient?.dob || ''} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select defaultValue={patient?.gender || ''}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" defaultValue={patient?.street || ''} placeholder="Street" />
              <div className="address-inline">
                <input type="text" defaultValue={patient?.city || ''} placeholder="City" />
                <input type="text" defaultValue={patient?.state || ''} placeholder="State" className="state-input" />
                <input type="text" defaultValue={patient?.zip || ''} placeholder="ZIP Code" className="zip-input" />
              </div>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" defaultValue={patient?.phone || ''} />
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={toggleEdit}>Cancel</button>
              <button className="save-btn" onClick={toggleEdit}>Save Changes</button>
            </div>
          </div>
        ) : (
          // View mode
          <>
            <div className="info-row">
              <div className="info-label">Full Name</div>
              <div className="info-value">{patient?.name || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Date of Birth</div>
              <div className="info-value">{patient?.dob || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Gender</div>
              <div className="info-value">{patient?.gender || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Address</div>
              <div className="info-value">
                {patient?.street ? (
                  <>
                    {patient.street}<br />
                    {patient.city}, {patient.state} {patient.zip}
                  </>
                ) : (
                  'Not available'
                )}
              </div>
            </div>
            <div className="info-row">
              <div className="info-label">Phone</div>
              <div className="info-value">{patient?.phone || 'Not available'}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Format date for input fields
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  try {
    const [month, day, year] = dateStr.split('-').map(Number);
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// General Information Section Component
const GeneralInformationSection = ({ patient }) => {
  // Handler for certification period updates
  const handleUpdateCertPeriod = (updatedCertData) => {
    console.log('Certification period updated:', updatedCertData);
    // Here you would typically update the state or send data to an API
  };
  
  return (
    <div className="general-info-section">
      <PersonalInfoCard patient={patient} />
      <CertificationPeriodComponent patient={patient} onUpdateCertPeriod={handleUpdateCertPeriod} />
      <EmergencyContactsComponent patient={patient} />
    </div>
  );
};

// Medical Information Section Component
const MedicalInformationSection = ({ patient }) => {
  // Handler for medical info updates
  const handleUpdateMedicalInfo = (updatedMedicalData) => {
    console.log('Medical information updated:', updatedMedicalData);
    // Here you would typically update the state or send data to an API
  };
  
  return (
    <div className="medical-info-section">
      <MedicalInfoComponent patient={patient} onUpdateMedicalInfo={handleUpdateMedicalInfo} />
    </div>
  );
};

// Disciplines Section Component
const DisciplinesSection = ({ patient }) => {
  // Handler for disciplines updates
  const handleUpdateDisciplines = (updatedDisciplines) => {
    console.log('Disciplines updated:', updatedDisciplines);
    // Here you would typically update the state or send data to an API
  };
  
  return (
    <div className="disciplines-section">
      <DisciplinesComponent patient={patient} onUpdateDisciplines={handleUpdateDisciplines} />
    </div>
  );
};

// Schedule Section Component
const ScheduleSection = ({ patient }) => {
  // Handler for schedule updates
  const handleUpdateSchedule = (updatedSchedule) => {
    console.log('Schedule updated:', updatedSchedule);
    // Here you would typically update the state or send data to an API
  };
  
  return (
    <div className="schedule-section">
      <ScheduleComponent patient={patient} onUpdateSchedule={handleUpdateSchedule} />
    </div>
  );
};

// Exercises Section Component
const ExercisesSection = ({ patient }) => {
  // Handler for exercises updates
  const handleUpdateExercises = (updatedExercises) => {
    console.log('Exercises updated:', updatedExercises);
    // Here you would typically update the state or send data to an API
  };
  
  return (
    <div className="exercises-section">
      <ExercisesComponent patient={patient} onUpdateExercises={handleUpdateExercises} />
    </div>
  );
};

// Documents Section Component
const DocumentsSection = ({ patient }) => {
  // Handler for documents updates
  const handleUpdateDocuments = (updatedDocuments) => {
    console.log('Documents updated:', updatedDocuments);
    // Here you would typically update the state or send data to an API
  };
  
  return (
    <div className="documents-section">
      <DocumentsComponent patient={patient} onUpdateDocuments={handleUpdateDocuments} />
    </div>
  );
};

// Main Patient Information Page Component
const PatientInfoPage = () => {
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const rolePrefix = window.location.hash.split('/')[1]; // Extract role from URL (developer, admin, etc.)

  // Fetch patient data
  useEffect(() => {
    // Simulating API call - in a real app, this would be replaced with actual fetch
    const fetchPatient = () => {
      setLoading(true);
      
      // Mock data - replace this with actual API call
      const mockPatients = [
        {
          id: 1,
          name: "Vargas, Javier",
          therapist: "Regina Araquel",
          therapistType: "PT",
          agency: "Supportive Health Group",
          street: "1800 Camden Avenue",
          city: "Los Angeles",
          state: "CA",
          zip: "90025",
          phone: "(310) 808-5631",
          certPeriod: "04-19-2023 to 04-19-2025",
          status: "Active",
          dob: "05/12/1965",
          gender: "Male",
          insurance: "Blue Cross Blue Shield",
          policyNumber: "BCB-123456789",
          emergencyContact: "Mohammed Ali",
          emergencyPhone: "(310) 555-7890",
          notes: "Patient recovering well. Following exercise regimen as prescribed.",
          // Datos médicos de ejemplo
          medicalInfo: {
            weight: 185.5,
            nursingDiagnosis: "Chronic Obstructive Pulmonary Disease (COPD) with decreased exercise tolerance",
            pmh: "Hypertension, Type 2 Diabetes (controlled), COPD diagnosed 2018, Right knee replacement (2020)",
            wbs: "No active wounds present",
            clinicalGrouping: "MMTA - Respiratory",
            homebound: "Patient experiences significant dyspnea with minimal exertion requiring intermittent rest periods"
          },
          // Datos de disciplinas de ejemplo
          disciplines: {
            PT: {
              isActive: true,
              therapist: { 
                id: 'pt1', 
                name: 'Dr. James Wilson', 
                type: 'PT', 
                phone: '(310) 555-1234', 
                email: 'jwilson@therapysync.com', 
                licenseNumber: 'PT12345' 
              },
              assistant: { 
                id: 'pta1', 
                name: 'Carlos Rodriguez', 
                type: 'PTA', 
                phone: '(310) 555-8901', 
                email: 'crodriguez@therapysync.com', 
                licenseNumber: 'PTA12345' 
              },
              frequency: '2w3'
            },
            OT: {
              isActive: false,
              therapist: null,
              assistant: null,
              frequency: ''
            },
            ST: {
              isActive: false,
              therapist: null,
              assistant: null,
              frequency: ''
            }
          },
          // Datos de ejercicios de ejemplo
          exercises: [
            {
              id: 1,
              name: 'Forward Lunge in Standing',
              description: 'Lower body strengthening exercise for hip and knee muscles.',
              bodyPart: 'Hip',
              category: 'Strengthening',
              subCategory: 'Functional',
              discipline: 'PT',
              imageUrl: '/exercise-images/forward-lunge.jpg',
              sets: 3,
              reps: 10,
              sessions: 1,
              isHEP: true
            },
            {
              id: 2,
              name: 'Arm Chair Push',
              description: 'Upper body strengthening exercise using a chair for support.',
              bodyPart: 'Shoulder',
              category: 'Strengthening',
              subCategory: 'Functional',
              discipline: 'PT',
              imageUrl: '/exercise-images/arm-chair-push.jpg',
              sets: 3,
              reps: 15,
              sessions: 1,
              isHEP: true
            },
            {
              id: 3,
              name: 'Deep Squat',
              description: 'Lower body strengthening exercise for multiple muscle groups.',
              bodyPart: 'Knee',
              category: 'Strengthening',
              subCategory: 'Functional',
              discipline: 'PT',
              imageUrl: '/exercise-images/deep-squat.jpg',
              sets: 3,
              reps: 10,
              sessions: 1,
              isHEP: true
            }
          ],
          // Datos de documentos de ejemplo
          documents: [
            {
              id: 1,
              name: 'Evaluation Report.pdf',
              type: 'pdf',
              size: 2456000,
              category: 'Medical Reports',
              uploadedBy: 'Dr. James Wilson',
              uploadDate: '2025-02-15T14:30:00',
              description: 'Initial evaluation report by PT',
              url: '/documents/eval-report.pdf'
            },
            {
              id: 2,
              name: 'Insurance Approval.pdf',
              type: 'pdf',
              size: 1240000,
              category: 'Insurance',
              uploadedBy: 'Admin Staff',
              uploadDate: '2025-02-10T09:15:00',
              description: 'Insurance approval for therapy sessions',
              url: '/documents/insurance-approval.pdf'
            }
          ]
        },
        {
          id: 2,
          name: "Nava, Luis",
          therapist: "James Lee",
          therapistType: "OT",
          agency: "Intra Care Home Health",
          street: "1800 Camden Avenue",
          city: "Los Angeles",
          state: "CA",
          zip: "90025",
          phone: "(310) 808-5631",
          certPeriod: "03-05-2025 to 05-04-2025", // Adjusted to match the data in the UI
          status: "Active",
          dob: "05/12/1965",
          gender: "Male",
          insurance: "Blue Cross Blue Shield",
          policyNumber: "BCB-123456789",
          emergencyContact: "Rick Grimes",
          emergencyPhone: "(310) 555-7890",
          notes: "Patient recovering well. Following exercise regimen as prescribed.",
          // Datos médicos de ejemplo
          medicalInfo: {
            weight: 172.0,
            nursingDiagnosis: "Left CVA with right-sided hemiparesis",
            pmh: "Cerebrovascular accident (03/2023), Hypertension, Hyperlipidemia",
            wbs: "No wounds present",
            clinicalGrouping: "Neuro Rehabilitation",
            homebound: "Patient requires maximum assistance for transfers and ambulation due to right-sided weakness and balance deficits"
          },
          // Datos de disciplinas de ejemplo
          disciplines: {
            PT: {
              isActive: true,
              therapist: { 
                id: 'pt3', 
                name: 'Dr. Michael Chen', 
                type: 'PT', 
                phone: '(310) 555-3456', 
                email: 'mchen@therapysync.com', 
                licenseNumber: 'PT34567' 
              },
              assistant: { 
                id: 'pta2', 
                name: 'Maria Gonzalez', 
                type: 'PTA', 
                phone: '(310) 555-9012', 
                email: 'mgonzalez@therapysync.com', 
                licenseNumber: 'PTA23456' 
              },
              frequency: '1w2'
            },
            OT: {
              isActive: true,
              therapist: { 
                id: 'ot1', 
                name: 'Dr. Emily Parker', 
                type: 'OT', 
                phone: '(310) 555-4567', 
                email: 'eparker@therapysync.com', 
                licenseNumber: 'OT12345' 
              },
              assistant: { 
                id: 'cota1', 
                name: 'Thomas Smith', 
                type: 'COTA', 
                phone: '(310) 555-0123', 
                email: 'tsmith@therapysync.com', 
                licenseNumber: 'COTA12345' 
              },
              frequency: '1w3'
            },
            ST: {
              isActive: false,
              therapist: null,
              assistant: null,
              frequency: ''
            }
          },
          // Datos de ejercicios de ejemplo (añadir algunos para OT)
          exercises: [
            {
              id: 4,
              name: 'Shoulder Flexion',
              description: 'Range of motion exercise for the shoulder joint.',
              bodyPart: 'Shoulder',
              category: 'Range of Motion',
              subCategory: 'Active',
              discipline: 'OT',
              imageUrl: '/exercise-images/shoulder-flexion.jpg',
              sets: 2,
              reps: 15,
              sessions: 2,
              isHEP: true
            },
            {
              id: 5,
              name: 'Wrist Extension',
              description: 'Stretching exercise for the wrist extensors.',
              bodyPart: 'Wrist',
              category: 'Stretching',
              subCategory: 'Static',
              discipline: 'OT',
              imageUrl: '/exercise-images/wrist-extension.jpg',
              sets: 3,
              reps: 10,
              sessions: 2,
              isHEP: true
            }
          ],
          // Datos de documentos de ejemplo para el segundo paciente
          documents: [
            {
              id: 3,
              name: 'Progress Notes - Week 1.docx',
              type: 'docx',
              size: 350000,
              category: 'Progress Notes',
              uploadedBy: 'Dr. Michael Chen',
              uploadDate: '2025-02-20T16:45:00',
              description: 'Weekly progress notes after first week of therapy',
              url: '/documents/progress-notes-w1.docx'
            },
            {
              id: 4,
              name: 'Exercise Program.jpg',
              type: 'jpg',
              size: 1750000,
              category: 'Assessments',
              uploadedBy: 'Maria Gonzalez',
              uploadDate: '2025-02-25T10:20:00',
              description: 'Custom exercise program illustration',
              url: '/documents/exercise-program.jpg'
            },
            {
              id: 5,
              name: 'Medical History.pdf',
              type: 'pdf',
              size: 3200000,
              category: 'Medical Reports',
              uploadedBy: 'Dr. Emily Parker',
              uploadDate: '2025-03-05T09:30:00',
              description: 'Complete medical history including past treatments',
              url: '/documents/medical-history.pdf'
            }
          ]
        }
      ];
      
      const foundPatient = mockPatients.find(p => p.id.toString() === patientId);
      
      if (foundPatient) {
        setPatient(foundPatient);
      } else {
        // Handle not found
        console.error('Patient not found');
      }
      
      setLoading(false);
    };
    
    fetchPatient();
  }, [patientId]);

  // Render loading state
  if (loading) {
    return (
      <div className="patient-info-loading">
        <div className="loading-spinner">
          <div className="spinner-animation">
            <i className="fas fa-circle-notch fa-spin"></i>
          </div>
          <div className="loading-text">
            <span>Loading patient information</span>
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render patient not found
  if (!patient) {
    return (
      <div className="patient-not-found">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Patient Not Found</h2>
        <p>The patient you are looking for does not exist or you don't have permission to view it.</p>
        <button 
          className="back-button"
          onClick={() => navigate(`/${rolePrefix}/patients`)}
        >
          <i className="fas fa-arrow-left"></i> Back to Patients List
        </button>
      </div>
    );
  }

  return (
    <div className="patient-info-page">
      {/* Page header */}
      <header className="main-header">
        <div className="header-container">
          {/* Logo and navigation */}
          <div className="logo-container">
            <div className="logo-wrapper">
              <img src={logoImg} alt="TherapySync Logo" className="logo" />
              <div className="logo-glow"></div>
            </div>
            
            {/* Menu navigation */}
            <div className="menu-navigation">
              <button 
                className="nav-button main-menu" 
                onClick={() => navigate(`/${rolePrefix}/homePage`)}
                title="Back to main menu"
              >
                <i className="fas fa-th-large"></i>
                <span>Main Menu</span>
                <div className="button-effect"></div>
              </button>
              
              <button 
                className="nav-button patients-menu" 
                onClick={() => navigate(`/${rolePrefix}/patients`)}
                title="Patients Menu"
              >
                <i className="fas fa-user-injured"></i>
                <span>Patients</span>
                <div className="button-effect"></div>
              </button>
            </div>
          </div>
          
          {/* User profile - simplified version */}
          <div className="user-profile">
            <div className="profile-button">
              <div className="avatar">
                {currentUser?.fullname?.[0] || 'U'}
              </div>
              <div className="profile-info">
                <span className="user-name">{currentUser?.fullname || 'User'}</span>
                <span className="user-role">{currentUser?.role || 'Developer'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="patient-info-content">
        <div className="patient-info-container">
          {/* Patient header with back button and actions */}
          <PatientInfoHeader 
            patient={patient} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
          />
          
          {/* Tabs navigation */}
          <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 'general' && (
              <GeneralInformationSection patient={patient} />
            )}
            {activeTab === 'medical' && (
              <MedicalInformationSection patient={patient} />
            )}
            {activeTab === 'disciplines' && (
              <DisciplinesSection patient={patient} />
            )}
            {activeTab === 'schedule' && (
              <ScheduleSection patient={patient} />
            )}
            {activeTab === 'exercises' && (
              <ExercisesSection patient={patient} />
            )}
            {activeTab === 'documents' && (
              <DocumentsSection patient={patient} />
            )}
            {activeTab === 'notes' && (
              <div className="notes-placeholder">
                <div className="placeholder-content">
                  <i className="fas fa-sticky-note"></i>
                  <p>Notes Section</p>
                  <span>This section will be developed in the next phase</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Floating Action Button */}
      <div className="floating-action-button">
        <button className="fab-button">
          <i className="fas fa-plus"></i>
          <span className="fab-tooltip">Quick Actions</span>
        </button>
        <div className="fab-menu">
          <button className="fab-item">
            <i className="fas fa-calendar-plus"></i>
            <span>Add Visit</span>
          </button>
          <button className="fab-item">
            <i className="fas fa-file-upload"></i>
            <span>Upload Document</span>
          </button>
          <button className="fab-item">
            <i className="fas fa-sticky-note"></i>
            <span>Add Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoPage;