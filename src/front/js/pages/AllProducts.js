import * as React from "react";
import { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Rating, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function AllProducts() {
  const { store, actions } = useContext(Context);
  const [allProducts, setAllProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  //Funcion para traer todos los productos actualmente en la base de datos.
  useEffect(() => {
    const getAllProducts = async () => {
      const { respuestaJson, response } = await actions.useFetch(
        "/routes_product/all-products-general"
      );

      if (response.ok) {
        setAllProducts(respuestaJson);
      }
    };
    getAllProducts();
  }, []);

  //Funcion para traer las reviews de un producto en especifico.
  // useEffect(() => {
  //   const getReviews = async () => {
  //     const { respuestaJson, response } = await actions.useFetch(
  //       `/routes_product/products/${id}/reviews`
  //     );

  //     if (response.ok) {
  //       setReviews(respuestaJson);
  //     }
  //   };
  //   getReviews();
  // }, []);

  //Funcion para traer las reviews de un producto en especifico.

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        // border: "1px solid red",
      }}
    >
      {allProducts && allProducts.length > 0 ? (
        allProducts.map((product, index) => (
          <div key={index}>
            <Grid>
              <Link to={`/product/${product.id}`}>
                {" "}
                {/* Esto crea un enlace a la página de detalles del producto */}
                <div
                  style={{
                    width: "370px",
                    height: "500px",
                    margin: "3px",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                  className="card"
                >
                  <img
                    style={{
                      width: "100%",
                      height: "75%",
                    }}
                    src={product.image}
                    className="card-img-top"
                    alt="..."
                  />
                  <div className="card-body" style={{ width: "100%" }}>
                    <h5 className="card-title">{product.name}</h5>
                    {/* <p className="card-text" style={{ display: "flex" }}>
                      <Rating
                        name="read-only"
                        value={product.average_rating}
                        precision={0.1}
                        readOnly
                      />{" "}
                      <Typography>({product.rating_count})</Typography>{" "}
                    </p> */}
                    <p className="card-text">USD {product.price}</p>
                    {/* <p className="card-text">{product.stock}</p> */}
                    <p className="card-text">{product.category}</p>
                    <p className="card-text">{product.brand}</p>
                  </div>
                </div>
              </Link>
            </Grid>
          </div>
        ))
      ) : (
        <div> </div>
      )}
    </Box>
  );
}
