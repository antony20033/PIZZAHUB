import React from "react";
import AppSidebar from "../components/Sidebar";
import AppContent from "../components/appContent";

const DefaultLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>  
            <AppSidebar />  
            
            <div 
                className="wrapper d-flex flex-column min-vh-100" 
                style={{ 
                    marginLeft: '256px', // Ajusta este valor al ancho de tu sidebar
                    width: 'calc(100% - 256px)',
                    transition: 'margin-left 0.3s ease'
                }}
            >
                <div className="body flex-grow-1">
                    <AppContent />
                </div>

                
            </div>
        </div>
    );
}

export default DefaultLayout;