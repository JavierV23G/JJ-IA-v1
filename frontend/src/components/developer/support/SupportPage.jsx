import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/developer/support/Support.scss';
import SupportHeader from './SupportHeader.jsx';
import SupportTickets from './SupportTickets.jsx';
import SupportKnowledgeBase from './SupportKnowledgeBase.jsx';
import SupportDashboard from './SupportDashboard.jsx';
// Importar logo correctamente para asegurar que se muestre
import logoImg from '../../../assets/LogoMHC.jpeg';

const DevSupportPage = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount] = useState(7);
  const backgroundVideoRef = useRef(null);
  
  // Efecto para cargar la página con animación mejorada
  useEffect(() => {
    // Simulación de progreso de carga
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;
      setLoadingProgress(Math.floor(progress));
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Pequeño retraso para mostrar el 100% antes de desaparecer
      }
    }, 150);
    
    return () => clearInterval(progressInterval);
  }, []);

  // Controlar el parallax del fondo
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!backgroundVideoRef.current) return;
      
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      // Suave efecto parallax en el fondo
      backgroundVideoRef.current.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Manejo de cambio de sección
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };
  
  // Renderizar contenido de la sección activa
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'tickets':
        return <SupportTickets />;
      case 'knowledge':
        return <SupportKnowledgeBase />;
      default:
        return <SupportDashboard />;
    }
  };
  
  // Renderizar partículas de fondo más eficientes y elegantes
  const renderParticles = () => {
    const particles = [];
    const particleCount = 25; // Optimizado para rendimiento
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 4 + 1;
      const opacity = Math.random() * 0.12 + 0.03;
      const delay = Math.random() * 5;
      const duration = Math.random() * 15 + 10;
      
      particles.push(
        <div
          key={i}
          className="support-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            opacity: opacity,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`
          }}
        ></div>
      );
    }
    
    return particles;
  };
  
  return (
    <div 
      className={`support-page ${isLoading ? 'is-loading' : 'is-loaded'}`}
    >
      {/* Fondo premium con imagen HD y efectos */}
      <div className="support-background">
        {/* Imagen de fondo HD con blur controlado */}
        <div 
          className="background-image" 
          ref={backgroundVideoRef}
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1483389127117-b6a2102724ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3087&q=80')"
          }}
        ></div>
        
        {/* Overlay con gradiente refinado */}
        <div className="support-gradient-overlay"></div>
        
        {/* Partículas flotantes elegantes */}
        <div className="support-particles-container">
          {renderParticles()}
        </div>

        {/* Efecto de viñeta en las esquinas */}
        <div className="corner-vignette top-left"></div>
        <div className="corner-vignette top-right"></div>
        <div className="corner-vignette bottom-left"></div>
        <div className="corner-vignette bottom-right"></div>
      </div>
      
      {/* Animación de carga premium */}
      {isLoading && (
        <div className="support-loader">
          <div className="loader-content">
            <div className="loader-logo">
              <div className="logo-pulse"></div>
              {/* Usar el logo importado correctamente */}
              <img src={logoImg} alt="TherapySync Logo" />
            </div>
            
            <div className="loader-title">
              <h2>TherapySync Support</h2>
            </div>
            
            <div className="loader-progress">
              <div className="progress-track">
                <div 
                  className="progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <div className="progress-percentage">{loadingProgress}%</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido principal con transiciones refinadas */}
      <div className={`support-content ${isLoading ? 'hidden' : ''}`}>
        <SupportHeader 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationCount={notificationCount}
        />
        
        <main className="support-main">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default DevSupportPage;