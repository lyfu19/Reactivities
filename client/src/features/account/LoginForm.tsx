import { useForm } from "react-hook-form";
import { useAccount } from "../../lib/hooks/useAccount";
import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Typography } from "@mui/material";
import { GitHub, LockOpen } from "@mui/icons-material";
import TextInput from "../../app/shared/components/TextInput";
import { Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LoginForm() {
  const [notVerified, setNotVerified] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser, resendConfirmEmail } = useAccount();
  const {
    control,
    watch,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<LoginSchema>({
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    await loginUser.mutateAsync(data, {
      onSuccess: () => {
        const fromPath = location.state?.from?.pathname || "/activities";
        navigate(fromPath || "/activities");
      },
      onError: (error) => {
        if (error.message === "NotAllowed") {
          setNotVerified(true);
        }
      },
    });
  };

  const loginWithGithub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_UTL;
    const scope = "read:user user:email";

    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const email = watch("email");
  const handleResendEmail = async () => {
    try {
      await resendConfirmEmail.mutateAsync({ email });
      setNotVerified(false);
      toast.success("Email sent - please check your email");
    } catch (error) {
      console.error(error);
      toast.error("Problem sending email - please check email address");
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 3,
        gap: 3,
        maxWidth: "md",
        mx: "auto",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="secondary.main"
        gap={3}
      >
        <LockOpen fontSize="large" />
        <Typography variant="h4">Sign in</Typography>
      </Box>
      <TextInput label="Email" control={control} name="email" />
      <TextInput
        label="Password"
        control={control}
        name="password"
        type="password"
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!isValid || isSubmitting}
        size="large"
      >
        Login
      </Button>
      <Button
        onClick={loginWithGithub}
        startIcon={<GitHub />}
        sx={{ bgcolor: "black" }}
        type="button"
        variant="contained"
        size="large"
      >
        Login with Github
      </Button>
      {notVerified ? (
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Typography textAlign="center" color="error">
            Your email has not been verified. You can click the button to
            re-send the verification email
          </Typography>
          <Button
            disabled={resendConfirmEmail.isPending}
            onClick={handleResendEmail}
          >
            Re-send email link
          </Button>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" gap={3}>
          <Typography>
            Forgor password? Click <Link to="/forgot-password">here</Link>
          </Typography>

          <Typography sx={{ textAlign: "center" }}>
            Don't have an account?
            <Typography
              sx={{ ml: 2 }}
              component={Link}
              to="/register"
              color="primary"
            >
              Sign up
            </Typography>
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
