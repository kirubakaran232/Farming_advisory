import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Price from "./pages/Price";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chatbot from "./pages/Chatbot";
import Pest from "./pages/Pest";
import Weather from "./pages/Weather";
import Soil from "./pages/Soil";

function App() {
  return (
    <Routes>
      {/* Pages with Navbar + Footer */}
      <Route
        path="/home"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/price"
        element={
          <Layout>
            <Price />
          </Layout>
        }
      />
      <Route
        path="/pest"
        element={
          <Layout>
            <Pest />
          </Layout>
        }
      />
      <Route
        path="/chatbot"
        element={
          <Layout>
            <Chatbot />
          </Layout>
        }
      />
      <Route
        path="/weather"
        element={
          <Layout>
            <Weather />
          </Layout>
        }
      />
      <Route
        path="/soil"
        element={
          <Layout>
            <Soil />
          </Layout>
        }
      />

      {/* Auth Pages without Navbar/Footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Signup />} />
    </Routes>
  );
}

export default App;
