import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import AppSidebar from "../components/Sidebar";
import AppContent from "../components/AppContent";

const DefaultLayout = () => {
    const unfoldable = useSelector((state) => state.sidebarUnfoldable);
    const [isDesktop, setIsDesktop] = useState(true);
    
    // Detectar si es desktop o móvil
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 992);
        };
        
        // Inicial
        handleResize();
        
        // Listener
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Calcular el ancho del sidebar dinámicamente
    // Desktop: 256px expandido, 64px contraído
    // Móvil: 0px (sidebar es overlay)
    const sidebarWidth = isDesktop 
        ? (unfoldable ? '64px' : '256px') 
        : '0px';
    
    return (
        <div style={{ 
            display: 'flex', 
            minHeight: '100vh', 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            overflow: 'hidden',
            margin: 0,
            padding: 0
        }}>  
            <AppSidebar />  
            
            <div 
                className="wrapper d-flex flex-column" 
                style={{ 
                    marginLeft: isDesktop ? sidebarWidth : '0px',
                    width: isDesktop ? `calc(100% - ${sidebarWidth})` : '100%',
                    transition: 'margin-left 0.3s ease, width 0.3s ease',
                    minHeight: '100vh',
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    position: 'relative',
                    backgroundColor: '#F3F4F6',
                    paddingLeft: 0,
                    paddingRight: 0
                }}
            >
                <div className="body flex-grow-1" style={{ 
                    width: '100%', 
                    height: '100%', 
                    padding: 0,
                    margin: 0,
                    boxSizing: 'border-box'
                }}>
                    <AppContent />
                </div>
            </div>
        </div>
    );
}

export default DefaultLayout;