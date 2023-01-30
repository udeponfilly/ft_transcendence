import { Icon } from "@iconify/react";
import BlockIcon from "@mui/icons-material/Block";
import { Tooltip } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import invitationGame from "../../../Game/components/Invitation/Invitation";
import { useNavigate } from "react-router-dom";

export function ChatGobackIcon(props: any) {
    return (
        <div style={{ cursor: "pointer", marginTop: '2px' }}>
            <Icon
              onClick={() => props.openConvHandler(-1)}
              icon="material-symbols:arrow-back-ios-rounded"
              width="30"
              height="20"
            />
          </div>
    );
}

export function ChatOwnerIcon() {
    return (
        <Tooltip title="Owner">
            <Icon icon="mdi:shield-crown" color="gray" inline={true} />
        </Tooltip>
    );
}

export function ChatAdminIcon() {
    return (
        <Tooltip title="Group administrator">
          <Icon icon="dashicons:admin-users" color="gray" inline={true} />
        </Tooltip>
    );
}

export function ChatGameIcon(props: any) {
    const navigate = useNavigate();

    const handleClickGame = (param: any) => {
        navigate("/game");
        invitationGame(param);
    };

    return (
    <Tooltip title="Invite for a pong">
        <SportsEsportsIcon
            onClick={() => handleClickGame(props.id)}
            sx={{ cursor: "pointer", color: "grey", marginRight: "20px" }}
        />
    </Tooltip>
    );
}

export function ChatBlockIcon(props: any) {
    return (
    <Tooltip title="Block user">
        <BlockIcon
        onClick={(event) => props.chatCmd("/block " + props.user)}
        sx={{ cursor: "pointer", color: "grey" }}
        />
    </Tooltip>

    );
}

export function ChatUnblockIcon(props: any) {
    return (
        <Tooltip title="Unblock user">
            <LockOpenIcon
            onClick={(event) => props.chatCmd("/unblock " + props.user)}
            sx={{ cursor: "pointer", color: "grey", marginLeft: "45px" }}
            />
        </Tooltip>

    );
}

export function ChatULeaveIcon(props: any) {
    return (
        <Tooltip
          title="Leave channel"
          sx={{ cursor: "pointer", color: "grey", marginLeft: "45px" }}
        >
          <ExitToAppIcon onClick={(event) => props.chatCmd("/leave")} />
        </Tooltip>
    );
}
