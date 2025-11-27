import { useContext } from "react";
import AppSidebar from './components/Sidebar';
import './App.css'
import '@coreui/coreui/dist/css/coreui.min.css'
import 'simplebar-react/dist/simplebar.min.css'
import DefaultLayout from './navegacion/DefaultLayout'
import Login from './components/Login';
import { HashRouter, Route, Routes } from 'react-router-dom'
import AuthContext from "./context/AuthContext";   //  ← CORREGIDO

function App() {
  const { token } = useContext(AuthContext);

  return (
    <>
      {token ? (
        <DefaultLayout />
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
