import { Box, Button } from "@mui/material";
import TextInput from "../../app/shared/components/TextInput";
import { useForm } from "react-hook-form";
import {
  editProfileSchema,
  type EditProfileSchema,
} from "../../lib/schemas/editProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile } from "../../lib/hooks/useProfile";
import { useParams } from "react-router";
import { useEffect } from "react";

type Props = {
  setEditMode: (value: boolean) => void;
};

export default function ProfileEditForm({ setEditMode }: Props) {
  const { id } = useParams();
  const { updateProfile, profile } = useProfile(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<EditProfileSchema>({
    mode: "onTouched",
    resolver: zodResolver(editProfileSchema),
  });

  useEffect(() => {
    reset({
      displayName: profile?.displayName,
      bio: profile?.bio,
    });
  }, [profile, reset]);

  const onSubmit = (data: EditProfileSchema) => {
    updateProfile.mutate(data, { onSuccess: () => setEditMode(false) });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      display="flex"
      flexDirection="column"
      gap={3}
      mt={3}
    >
      <TextInput label="Display Name" control={control} name="displayName" />
      <TextInput
        label="Add your bio"
        control={control}
        name="bio"
        multiline
        rows={4}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!isValid || updateProfile.isPending || !isDirty}
      >
        Update profile
      </Button>
    </Box>
  );
}
