import React, { useState } from "react";
import { Button, Dialog, Typography, Tooltip } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const ButtonView = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const HandleClick = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Button
        color="success"
        sx={{
          bgcolor: "gray",
          display: "flex",
          textAlign: "center",
          justifyContent: "center",
        }}
        onClick={HandleClick}
      >
        trial
      </Button>

      {/* set dialog to open */}

      <Dialog
        open={openDialog}
        sx={{
          textAlign: "center",
          bgcolor: "palegray",
          width: 250,
          height: "auto",
        }}
      >
        <Typography>This button is just for trial</Typography>

        <Tooltip title="Close the dialog">
          <CloseIcon color="success" onClick={() => setOpenDialog(false)} />
        </Tooltip>
      </Dialog>
    </>
  );
};

export default ButtonView;
