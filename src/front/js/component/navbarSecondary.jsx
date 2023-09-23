import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const theme = createTheme({
  palette: {
    secondaryLight: {
      main: '#232F3E' // un tono oscuro de gris
    },
  },
});

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

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

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

function NavbarSecondary() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElClothes, setAnchorElClothes] = React.useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMenuOpenOne = Boolean(menuAnchorEl);

  const handleMenuOpenOne = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuCloseOne = () => {
    setMenuAnchorEl(null);
  };


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
      <MenuItem onClick={handleMenuCloseOne}>Opción 11</MenuItem>
      <MenuItem onClick={handleMenuCloseOne}>Opción 22</MenuItem>
      <MenuItem onClick={handleMenuCloseOne}>Opción 33</MenuItem>
    </Menu>
  );
  //About accesory
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  //----------UL---------

  //About Clothes
  const handleClickClothes = (event) => {
    setAnchorElClothes(event.currentTarget);
  };

  const handleCloseClothes = () => {
    setAnchorElClothes(null);
  };
  //----------UL---------

  return (
    <Box sx={{ flexGrow: 1, minWidth: "375px" }}>
      <AppBar position="static" color="secondaryLight" sx={{ height: 32, width: "100%", display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Toolbar sx={{ height: "20", display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            {/* Menú para pantallas pequenhas, celulares*/}
            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ color: "white", mr: 1, height: "20", display: "flex", flexDirection: "column", display: { xs: "flex", sm: "none" } }}
              onClick={handleMenuOpenOne}
            >
              <MenuIcon sx={{ height: "20" }} />
            </IconButton>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: "block", sm: "none" }, paddingRight: 2, paddingTop: 1, color: "white", fontSize: "1rem" }}
              >
                Todas las caregorías
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ display: { xs: "block", sm: "none" }, paddingTop: "7px", color: "white", fontSize: "0.6rem" }}
                >
                  MRK:0.00012322 USD
                </Typography>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ display: { xs: "block", sm: "none" }, paddingBottom: 0, color: "white", fontSize: "0.6rem" }}
                >
                  MRK:0.00012322 USD
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleClick}
              sx={{ paddingRight: 2, color: "white", fontSize: "1rem", textTransform: "none", display: { xs: "none", sm: "block" }, flexDirection: "row", alignItems: "center" }}
            >
              Accesorios
              <ExpandMoreIcon />
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Accesorio 1</MenuItem>
              <MenuItem onClick={handleClose}>Accesorio 2</MenuItem>
              <MenuItem onClick={handleClose}>Accesorio 3</MenuItem>
            </Menu>

            <Button
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleClickClothes}
              sx={{ paddingRight: 2, color: "white", fontSize: "1rem", textTransform: "none", display: { xs: "none", sm: "block" }, flexDirection: "row", alignItems: "center" }}
            >
              Ropa
              <ExpandMoreIcon />
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorElClothes}
              keepMounted
              open={Boolean(anchorElClothes)}
              onClose={handleCloseClothes}
            >
              <MenuItem onClick={handleCloseClothes}>Bebé</MenuItem>
              <MenuItem onClick={handleCloseClothes}>Niños</MenuItem>
              <MenuItem onClick={handleCloseClothes}>Mujeres</MenuItem>
              <MenuItem onClick={handleCloseClothes}>Hombres</MenuItem>
              <MenuItem onClick={handleCloseClothes}>Moda</MenuItem>
            </Menu>
          </Box>
          <Box
            sx={{}}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: "none", sm: "block" }, paddingRight: 2, color: "white", fontSize: "1rem" }}
            >
              Marketts
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMainMenu}
    </Box >
  );
}

// export default Navbar;


export default function ThemedNavbar() {
  return (
    <ThemeProvider theme={theme}>
      <NavbarSecondary />
    </ThemeProvider>
  );
}