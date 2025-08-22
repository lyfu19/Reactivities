import { useForm } from "react-hook-form";
import { useAccount } from "../../lib/hooks/useAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Typography } from "@mui/material";
import { LockOpen } from "@mui/icons-material";
import TextInput from "../../app/shared/components/TextInput";
import { Link } from "react-router";
import {
  registerSchema,
  type RegisterSchema,
} from "../../lib/schemas/registerSchema";

export default function RegisterForm() {
  const { registerUser } = useAccount();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    setError,
  } = useForm<RegisterSchema>({
    mode: "onTouched",
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    await registerUser.mutateAsync(data, {
      onError: (error) => {
        if (Array.isArray(error)) {
          error.forEach((err) => {
            const errLowercase = (err as string).toLowerCase();
            if (errLowercase.includes("email")) {
              setError("email", { message: err });
            } else if (errLowercase.includes("password")) {
              setError("password", { message: err });
            }
          });
        }
      },
    });
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
        <Typography variant="h4">Register</Typography>
      </Box>
      <TextInput label="Email" control={control} name="email" />
      <TextInput label="DisplayName" control={control} name="displayName" />
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
        Register
      </Button>
      <Typography sx={{ textAlign: "center" }}>
        Already have an account?
        <Typography sx={{ ml: 2 }} component={Link} to="/login" color="primary">
          Sign in
        </Typography>
      </Typography>
    </Paper>
  );
}
