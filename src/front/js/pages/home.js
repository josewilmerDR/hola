import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import Uploader from "../component/uploader/uploader.jsx";
import PopUp from "../component/popUp.jsx";
import TopSellers from "../component/topSellers.jsx";
import TopShoes from "../component/topShoes.jsx";
import AllProductsShoes from "./AllProductsShoes";
import AllProducts from "./AllProducts";

export const Home = () => {
  const { store, actions } = useContext(Context);

  return (
    <div className="text-center mt-5">
      {/* <PopUp /> */}
      <div>
        <h3>Vendedores mejor puntuados</h3>
        <TopSellers />
      </div>

      <div>
        <h3>Ofertas relámpago</h3>
        <TopSellers />
      </div>
      {/* <div className="alert alert-info">
        {store.message ||
          "Loading message from the backend (make sure your python backend is running)..."}
      </div>
      <p>
        This boilerplate comes with lots of documentation:{" "}
        <a href="https://start.4geeksacademy.com/starters/react-flask">
          Read documentation
        </a>
      </p>
      <div>
        <p>Aquí sección de subir imagenes</p>
        <Uploader />
      </div> */}
      <h3>Lo más valorado en Zapatos_"hola"</h3>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <AllProducts />
      </div>
    </div>
  );
};
