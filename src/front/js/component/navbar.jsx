import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";

import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


//Se crea el tema para el navbar con el color secundario de la paleta de colores
const theme = createTheme({
  palette: {
    secondary: {
      main: '#131921' // un tono oscuro de gris
    },
    secondaryLight: {
      main: '#232F3E' // un tono oscuro de gris
    },
  },
});


//Se crea el estilo para el navbar con el color secundario de la paleta de colores
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

//Se crea el estilo para el icono de búsqueda
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

//Se crea el estilo para el input de búsqueda
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

//Se crea el componente Navbar
function Navbar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [infoUsuario, setInfoUsuario] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMenuOpenOne = Boolean(menuAnchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const { store, actions } = useContext(Context);
  const handleMenuOpenOne = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const navigate = useNavigate();
  const goToRegister = () => {
    navigate("/register")
  }
  const goToLogin = () => {
    navigate("/Login")
  }
  const goToMyAccount = () => {
    navigate("/myAccount")
    handleMenuClose();
  }
  const goToMyProfile = () => {
    navigate("/myProfile")
    handleMenuClose();
  }
  const goToMyAccountSeller = () => {
    navigate("/dashboard-seller")
    handleMenuClose();
  }
  const goToCreateSeller = () => {
    navigate("/create-seller")
    handleMenuClose();
  }
  const goToMyCode = () => {
    navigate("/my-code")
    handleMenuClose();
  }
  const handleMenuCloseOne = () => {
    setMenuAnchorEl(null);
  };
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  // Menú principal 
  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  // Se obtiene el usuario actual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { respuestaJson, response } = await actions.useFetch("/api/current-user");

      console.log(response.ok)
      console.log(respuestaJson)
      if (response.ok) {
        setInfoUsuario(respuestaJson.is_seller)
        console.log(respuestaJson.is_seller)
      }
    }
    getCurrentUser();
  }, [])

  // Menú de perfil de usuario
  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={goToMyProfile}>Perfll</MenuItem>
      <MenuItem onClick={goToMyAccount}>Mi cuenta</MenuItem>
      <MenuItem onClick={goToMyCode}>PIN de autoventa</MenuItem>
      {infoUsuario ? <MenuItem onClick={goToMyAccountSeller}>Cuenta de vendedor</MenuItem> : <Button onClick={goToCreateSeller}>Crear mi cuenta de vendedor</Button>}
    </Menu>
  );

  // Menú principal
  const renderMainMenu = (
    <Menu
      anchorEl={menuAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id="main-menu"
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpenOne}
      onClose={handleMenuCloseOne}
    >
      <MenuItem onClick={handleMenuCloseOne}>Opción 1</MenuItem>
      <MenuItem onClick={handleMenuCloseOne}>Opción 2</MenuItem>
      <MenuItem onClick={handleMenuCloseOne}>Opción 3</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );



  return (
    <>
      <Box sx={{ flexGrow: 1, minWidth: "375px" }}>
        <AppBar position="static" color="secondary" sx={{ display: "flex", justifyContent: "space-between" }}>
          <Toolbar >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <IconButton
                onClick={() => navigate("/")}
              >
                <img
                  src={"https://res.cloudinary.com/doqx408xv/image/upload/v1685410781/publicidad_fb_02_v4_wlxsbm.png"}
                  alt="Logo"
                  style={{
                    height: "auto",
                    width: "200px",
                    marginRight: "0.5rem",
                  }}
                />
              </IconButton>
            </Box>

            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <IconButton
                onClick={() => navigate("/")}
              >
                <img
                  src={"https://res.cloudinary.com/doqx408xv/image/upload/v1685410785/markettika_05_V2_w9oqlk.png"}
                  alt="Logo"
                  style={{
                    height: "2.5rem",
                    width: "60px",
                    marginRight: "0.5rem",

                  }}
                />
              </IconButton>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, width: "60%" }}>
              <Search sx={{ minWidth: "100%" }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase sx={{ minWidth: "100%" }}
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>

            </Box>

            <Box sx={{ flexGrow: 1 }} />
            {store.userLogin ? <Box sx={{ display: { xs: "none", md: "flex" }, width: "75px", flex: { md: "0 1 15%" } }}>
              <IconButton
                size="large"
                aria-label="show 4 new mails"
                color="inherit"
              >
                <Badge badgeContent={4} color="error">
                  <MailIcon />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                aria-label="show 17 new notifications"
                color="inherit"
              >
                <Badge badgeContent={17} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Box> : <Box sx={{ display: { flex: "flex", justifyContent: "flex-start" }, marginRight: "5px" }}>
              <Button onClick={goToRegister} sx={{ color: "gold" }}>Registrarme</Button>
              <Button onClick={goToLogin} sx={{ color: "gold" }}>Login</Button>
            </Box>
            }
            {/* <Badge badgeContent={17} color="error">
              <ShoppingCartIcon style={{ fontSize: "2rem", color: "gold" }} />
            </Badge>
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MoreIcon />
              </IconButton>
            </Box> */}
          </Toolbar>
        </AppBar>
        {renderMainMenu}
        {renderMobileMenu}
        {renderMenu}
      </Box >
      <Box sx={{ display: { xs: "block", md: "none" }, border: "solid 4px black", width: "93%", marginRight: "15px" }}>
        <Search sx={{ color: "none" }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            sx={{ width: "100%", "::placeholder": { color: "gold" } }}
            placeholder="Buscar…"
            inputProps={{ "aria-label": "search" }}

          />
        </Search>
      </Box>
    </>
  );
}

// export default Navbar;


export default function ThemedNavbar() {
  return (
    <ThemeProvider theme={theme}>
      <Navbar />
    </ThemeProvider>
  );
}