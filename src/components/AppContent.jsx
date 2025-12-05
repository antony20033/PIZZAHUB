import React, { Suspense, useContext } from "react";  
import { Navigate, Route, Routes } from "react-router-dom";
import { CContainer, CSpinner } from "@coreui/react";
import { getFilteredRoutes } from '../routes';
import AuthContext from '../context/AuthContext';

const AppContent = () => {
  const { roles } = useContext(AuthContext);
  const filteredRoutes = getFilteredRoutes(roles);

  return (
    <CContainer fluid className="p-0 m-0" style={{ width: '100%', maxWidth: '100%' }}>
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
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent);