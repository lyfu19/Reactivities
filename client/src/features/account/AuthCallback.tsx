import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useAccount } from "../../lib/hooks/useAccount";
import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { GitHub } from "@mui/icons-material";

export default function AuthCallback() {
  const { fetchGithubToken } = useAccount();

  const [params] = useSearchParams();
  const code = params.get("code");

  const fetched = useRef(false);

  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!code || fetched.current) {
      return;
    }
    fetched.current = true;

    fetchGithubToken
      .mutateAsync(code)
      .then(() => {
        const fromPath = location.state?.from?.pathname || "/activities";
        navigate(fromPath || "/activities");
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [code, fetchGithubToken, location.state?.from?.pathname, navigate]);

  if (!code) {
    return <Typography>Problem authenticating with Github</Typography>;
  }

  return (
    <Paper
      sx={{
        height: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        gap: 3,
        maxWidth: "md",
        mx: "auto",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={3}>
        <GitHub fontSize="large" />
        <Typography variant="h4">Logging in with Github</Typography>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Typography>Problem signing in with GitHub</Typography>
      )}
    </Paper>
  );
}
