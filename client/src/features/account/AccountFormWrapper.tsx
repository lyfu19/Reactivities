import { Box, Button, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
} from "react-hook-form";

type Props<TFormData extends FieldValues> = {
  title: string;
  icon: ReactNode;
  onSubmit: (data: TFormData) => Promise<void>;
  children: ReactNode;
  submitButtonTitle: string;
  resolver?: Resolver<TFormData>;
  resetOnSuccess?: boolean;
  defaultValues: DefaultValues<TFormData>;
  resetValues?: DefaultValues<TFormData> | TFormData;
};

export default function AccountFormWrapper<TFormData extends FieldValues>({
  title,
  icon,
  onSubmit,
  children,
  submitButtonTitle,
  resolver,
  resetOnSuccess,
  defaultValues,
  resetValues,
}: Props<TFormData>) {
  const methods = useForm<TFormData>({
    resolver,
    mode: "onTouched",
    defaultValues,
  });

  const formSubmit = async (data: TFormData) => {
    await onSubmit(data);

    if (resetOnSuccess) {
      methods.reset(resetValues ?? defaultValues);
    }
  };

  return (
    <FormProvider {...methods}>
      <Paper
        component="form"
        onSubmit={methods.handleSubmit(formSubmit)}
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
          {icon}
          <Typography variant="h4">{title}</Typography>
        </Box>
        {children}
        <Button
          type="submit"
          variant="contained"
          disabled={
            !methods.formState.isValid || methods.formState.isSubmitting
          }
          size="large"
        >
          {submitButtonTitle}
        </Button>
      </Paper>
    </FormProvider>
  );
}
