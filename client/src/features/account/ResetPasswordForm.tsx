import { Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";
import { useAccount } from "../../lib/hooks/useAccount";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "../../lib/schemas/resetPasswordSchema";
import { toast } from "react-toastify";
import AccountFormWrapper from "./AccountFormWrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockOpen } from "@mui/icons-material";
import TextInput from "../../app/shared/components/TextInput";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const code = searchParams.get("code");

  const { resetPassword } = useAccount();
  const navigate = useNavigate();

  if (!email || !code) {
    return <Typography>Invalid reset password code</Typography>;
  }

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await resetPassword.mutateAsync({
        email,
        resetCode: code,
        newPassword: data.newPassword,
      });
      toast.success("Password reset successfully - you can now sign in");
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AccountFormWrapper<ResetPasswordSchema>
      title={"Reset your password"}
      icon={<LockOpen fontSize="large" />}
      onSubmit={onSubmit}
      submitButtonTitle={"Reset password"}
      resolver={zodResolver(resetPasswordSchema)}
      defaultValues={{ newPassword: "", confirmPassword: "" }}
    >
      <TextInput
        type="password"
        label="New password"
        name="newPassword"
        autoComplete="new-password"
      />
      <TextInput
        type="password"
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
      />
    </AccountFormWrapper>
  );
}
