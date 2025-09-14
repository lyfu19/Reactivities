import type { FieldValues } from "react-hook-form";
import { useAccount } from "../../lib/hooks/useAccount";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import AccountFormWrapper from "./AccountFormWrapper";
import { LockOpen } from "@mui/icons-material";
import TextInput from "../../app/shared/components/TextInput";

export default function ForgotPasswordForm() {
  const { forgotPassword } = useAccount();
  const navigate = useNavigate();

  const onSubmit = async (data: FieldValues) => {
    try {
      await forgotPassword.mutateAsync(data.email);
      toast.success("Password reset requested - please check your email");
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AccountFormWrapper<FieldValues>
      title={"Please enter your email address"}
      icon={<LockOpen fontSize="large" />}
      onSubmit={onSubmit}
      submitButtonTitle={"Request password reset link"}
      defaultValues={{ email: "" }}
    >
      <TextInput
        rules={{ required: true }}
        label="Email address"
        name="email"
      />
    </AccountFormWrapper>
  );
}
