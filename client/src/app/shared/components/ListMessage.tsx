import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function ListMessage({ children }: Props) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {children}
      </Typography>
    </Box>
  );
}
