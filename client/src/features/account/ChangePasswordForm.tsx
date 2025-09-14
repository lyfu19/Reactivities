import { Password } from "@mui/icons-material";
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from "../../lib/schemas/changePasswordSchema";
import AccountFormWrapper from "./AccountFormWrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import TextInput from "../../app/shared/components/TextInput";
import { useAccount } from "../../lib/hooks/useAccount";
import { toast } from "react-toastify";

export default function ChangePasswordForm() {
  const { changePassword } = useAccount();

  const onSubmit = async (data: ChangePasswordSchema) => {
    try {
      await changePassword.mutateAsync(data);
      toast.success("You password has been changed");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AccountFormWrapper<ChangePasswordSchema>
      title="Change password"
      icon={<Password fontSize="large" />}
      onSubmit={onSubmit}
      submitButtonTitle="Update password"
      resolver={zodResolver(changePasswordSchema)}
      resetOnSuccess
      defaultValues={{
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }}
    >
      <TextInput
        type="password"
        label="Current password"
        name="currentPassword"
        autoComplete="current-password"
      />
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
