import React, { Suspense, useContext } from "react";  
import { Navigate, Route, Routes } from "react-router-dom";
import { CContainer, CSpinner } from "@coreui/react";
import { getFilteredRoutes } from '../routes';
import AuthContext from '../context/AuthContext';

const AppContent = () => {
  const { roles } = useContext(AuthContext);
  const filteredRoutes = getFilteredRoutes(roles);

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {filteredRoutes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="/pages/VistaRepartidores" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent);