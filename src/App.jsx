import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import RegisterForm from "./auth/forms/RegisterForm";
import LoginForm from "./auth/forms/LoginForm";
import Home from "./root/pages/Home";
import AuthLayout from "./auth/AuthLayout";
import RootLayout from "./root/RootLayout";

function App() {
  return(
    <BrowserRouter>
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout/>}>
         <Route element={<RegisterForm/>} path="/register"/>
         <Route element={<LoginForm/>} path="/login"/>
      </Route>

      {/* Private Routes */}
      <Route element={<RootLayout/>}>
        <Route index element={<Home/>}/>
      </Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App;
