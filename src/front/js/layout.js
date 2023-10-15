import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";

import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";

import Navbar from "./component/navbar.jsx";
import NavbarSecondary from "./component/navbarSecondary.jsx";
import { Footer } from "./component/footer";
import Register from "./pages/register.jsx";
import Login from "./pages/login.jsx";
import MyAccount from "./pages/myAccount.jsx";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardCode from "./pages/dashboard/DashboardCode";
import CreateSeller from "./pages/createSeller.jsx";
import DashboardProduct from "./pages/dashboard/DashboardProducts";
import QRReader from "./component/qrReader.jsx";
import ProductViewPlus from "./pages/productViewPlus.jsx";
import AllProducts from "./pages/AllProducts";
import ProductDetails from "./component/productDetails.jsx";
// import ProductView from "./component/productView";
//create your first component
const Layout = () => {
  //the basename is used when your project is published in a subdirectory and not in the root of the domain
  // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
  //const basename = process.env.BASENAME || "";
  const basename = "/" || "";

  return (
    <div>
      <BrowserRouter basename={basename}>
        <ScrollToTop>
          <Navbar />
          <NavbarSecondary />
          <Routes>
            <Route element={<Demo />} path="/demo" />
            <Route element={<Login />} path="/login" />
            <Route element={<MyAccount />} path="/myAccount" />
            <Route element={<CreateSeller />} path="/create-seller" />
            <Route element={<Dashboard />} path="/dashboard-seller" />
            <Route element={<DashboardCode />} path="/my-code" />
            <Route element={<DashboardProduct />} path="/my-products" />
            <Route element={<Home />} path="/" />
            <Route element={<Register />} path="/register" />
            <Route element={<Single />} path="/single/:theid" />
            <Route element={<ProductDetails />} path="/product/:id" />
            <Route element={<QRReader />} path="/qr-reader" />
            <Route element={<ProductViewPlus />} path="/product-view" />
            <Route element={<AllProducts />} path="/all-products" />
            <Route element={<h1>Not found!</h1>} />
          </Routes>
          <Footer />
        </ScrollToTop>
      </BrowserRouter>
    </div>
  );
};

export default injectContext(Layout);
