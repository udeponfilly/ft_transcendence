import * as React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Toolbar,
  IconButton,
  MenuItem,
  Menu,
  Typography,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
} from "@mui/material";
import SwipeableTemporaryDrawer from "./MenuDrawer";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MoreIcon from "@mui/icons-material/MoreVert";
import { Stack } from "@mui/system";
import SettingsDialog from "./SettingsDialog";
import { selectCurrentUser } from "../Hooks/authSlice";
import { SearchIconWrapper, Search, StyledInputBase } from "./topBarStyle";
import { useCookies } from "react-cookie";
import { useLogoutMutation } from "../Api/Auth/authApiSlice";
import { logOut } from "../Hooks/authSlice";
import useAlert from "../Hooks/useAlert";
import KeyIcon from "@mui/icons-material/Key";
import { useNavigate } from "react-router-dom";
import { selectUserlist } from "../Hooks/userListSlice";
import { useSelector } from "react-redux";

interface PropsUsername {
  username: string;
}

function LogoutButton() {
  const [logoutUser] = useLogoutMutation();
  const [token, setCookie, removeCookie] = useCookies();

  void token;
  void setCookie;
  const handleLogout = (e: any) => {
    removeCookie("jwt", { path: "/" });
    logoutUser({});
    logOut({});
    window.location.replace("/login");
  };

  return <ListItemText onClick={handleLogout}>Logout</ListItemText>;
}

const UserNameTypographie = (propsUsername: PropsUsername) => {
  return (
    <Typography sx={{ fontWeight: "bold" }}>
      {`${propsUsername.username.substring(0, 11)}${
        propsUsername.username.length <= 11 ? "" : "..."
      }`}
    </Typography>
  );
};

function ProfileBox() {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
      <MenuItem>
        <Stack>
          <UserNameTypographie username={user.username} />
          <ListItemText>{user.login}</ListItemText>
        </Stack>
      </MenuItem>
      <Divider />
      <SettingsDialog />
      <MenuItem onClick={() => navigate(`/profile?userId=${user.id}`)}>
        <ListItemIcon>
          <AccountCircle />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => navigate("/tfa-settings")}>
        <ListItemIcon>
          <KeyIcon />
        </ListItemIcon>
        <ListItemText>Google 2fa</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem>
        <LogoutButton />
      </MenuItem>
    </Menu>
  );

  return (
    <div>
      <Box
        sx={{
          display: {
            width: 150,
            xs: "none",
            md: "flex",
            flexDirection: "row",
            alignItems: "center",
          },
        }}
      >
        <Grid
          aria-label="account of current user"
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
          sx={{
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            cursor: "pointer",
          }}
        >
          <Grid item sx={{ marginRight: 2 }} xs={0}>
            <UserNameTypographie username={user.username} />
          </Grid>
          <Grid item xs={0}>
            <Avatar src={user.avatar} />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <IconButton
          size="large"
          aria-label="show more"
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
        >
          <MoreIcon />
        </IconButton>
      </Box>
      {renderMenu}
    </div>
  );
}

function SearchBar() {
	const userList 	  = useSelector(selectUserlist).userList
  const { setAlert }  = useAlert();
  const navigate      = useNavigate();

  const getProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    let found = false;

    for (let user of userList) {
      if (data.get("name") === user.username) {
        navigate("/profile?userId=" + user.id);
        found = true;
      }
    }
    if (!found) setAlert(data.get("name") + " can't be found.", "error");
    e.currentTarget.reset();
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={(e) => {
          getProfile(e);
        }}
      >
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
            name="name"
          />
        </Search>
      </form>
    </Box>
  );
}

export default function PrimarySearchAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" sx={{ backgroundColor: "white", borderBottom: "solid 1px #f4f4f4", boxShadow: 0 }}>
        <Toolbar>
          <SwipeableTemporaryDrawer />
          <SearchBar />
          <ProfileBox />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
