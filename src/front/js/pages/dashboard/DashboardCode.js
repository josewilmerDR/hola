import * as React from "react";
import { useEffect, useState, useContext } from "react";
import { Context } from "../../store/appContext";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { SecondaryListItems, MainListItems } from "./listItems";
import MenuIcon from "@mui/icons-material/Menu";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import AddProductModal from "../../component/addProductModal.jsx";
import AddCode from "../../component/addCodeModal.jsx";
const drawerWidth = 240;

//Se estiliza el componennte Fab de Material UI
const PlusButton = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: "50%",
  right: "49%",
  zIndex: 2,
}));

const PlusButtonWithHistoric = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: "3%",
  right: "3%",
  zIndex: 2,
}));

//Se estiliza el componente MuiDrawer de Material UI
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function DashboardCode() {
  const [open, setOpen] = React.useState(false);
  const { store, actions } = useContext(Context);
  const [infoUsuario, setInfoUsuario] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [tempCode, setTempCode] = useState(null);

  //Esta función, hace que al ser llamada, "open" cambie al opuesto del valor actual (Si está en true, pasa a false y viceversa)
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const refreshComponent = () => {
    setRefresh(refresh + 1);
  };

  const handleSave = () => {
    // Aquí puedes actualizar el estado de la receta si es necesario
    setIsModalOpen(false); // cerrar la modal después de guardar
    // Cambia el valor de 'refresh' para forzar una actualización de las recetas en la seccion "Mis Recetas"
    // setRefresh(prevRefresh => !prevRefresh);
    setAllProducts();
    refreshComponent(); // Refresca el componente para mostrar los cambios
  };

  // Definición de la función fuera de useEffect
  const getTempCode = async () => {
    const { respuestaJson, response } = await actions.useFetch(
      "/routes_unlocked_code/random-active-code",
      {},
      "POST"
    );

    //Mostrar en consola el código temporal
    console.log(respuestaJson);
    if (response.ok) {
      setTempCode(respuestaJson);
    }
  };

  // // Llamar a la función dentro de useEffect
  // useEffect(() => {
  //   getTempCode();
  // }, [refresh]);

  //Funcion para traer la información del usuario actual.
  useEffect(() => {
    const cargaDatos = async () => {
      // let { respuestaJson, response } = await actions.useFetch("/api/protected")
      const { respuestaJson, response } = await actions.useFetch(
        "/api/myaccount"
      );

      if (response.ok) {
        setInfoUsuario(respuestaJson.name);
      }
    };
    cargaDatos();
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: "flex" }}>
        <div className="recetas-container-upper">
          {tempCode ? (
            <div className="container-add-recipe-manual-history-upper">
              <div>
                <PlusButtonWithHistoric
                  color="primary"
                  aria-label="add"
                  onClick={setTempCode}
                >
                  <AddIcon />
                </PlusButtonWithHistoric>
                {/* <AddCode
                  open={isModalOpen}
                  onClose={handleCloseModal}
                  onSave={handleSave}
                /> */}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        <CssBaseline />
        <Drawer
          variant="permanent"
          open={open}
          onMouseEnter={toggleDrawer}
          onMouseLeave={toggleDrawer}
        >
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton>
              {open ? <Typography>Mi cuenta</Typography> : <MenuIcon />}
              {/* <ChevronLeftIcon /> */}
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <MainListItems />
            <Divider sx={{ my: 1 }} />
            <SecondaryListItems />
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {tempCode ? (
                <div style={{ width: "100%" }}>
                  <Grid item xs={12} md={4} sx={{ width: "100%" }}>
                    <div className="card">
                      <img
                        src={
                          "https://res.cloudinary.com/doqx408xv/image/upload/v1685410781/publicidad_fb_02_v4_wlxsbm.png"
                        }
                        className="card-img-top"
                        alt="..."
                      />
                      <div className="card-body">
                        <h5 className="card-title">{tempCode.code}</h5>
                      </div>
                    </div>
                  </Grid>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid red",
                    width: "100%",
                    height: "auto",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid red",
                      width: "100%",
                      height: "auto",
                    }}
                  >
                    <p>
                      Hola,{" "}
                      <strong className="user-chat">{infoUsuario}.</strong>
                    </p>
                    <p>
                      Al dar click en el boton flotante más (+), obtendrás un
                      código temporal para desbloquear el acceso físico a
                      nuestro módodudo de autoventa.
                    </p>
                    <p>
                      Este código temporal es único y secreto, no lo compartas
                      con nadie
                    </p>
                  </div>
                  <PlusButton
                    color="primary"
                    aria-label="add"
                    onClick={() => {
                      getTempCode();
                    }}
                  >
                    <AddIcon />
                  </PlusButton>

                  {/* <AddCode
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                  /> */}
                </div>
              )}
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
