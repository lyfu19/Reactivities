import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginSchema } from "../schemas/loginSchema";
import agent from "../api/agent";
import { useNavigate } from "react-router";
import type { RegisterSchema } from "../schemas/registerSchema";

export const useAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginUser = useMutation({
    mutationFn: async (creds: LoginSchema) => {
      await agent.post("/login?useCookies=true", creds);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
  });

  const verifyEmail = useMutation({
    mutationFn: async ({ userId, code }: { userId: string; code: string }) => {
      await agent.get("/confirmEmail", {
        params: {
          userId,
          code,
        },
      });
    },
  });

  const resendConfirmEmail = useMutation({
    mutationFn: async ({
      email,
      userId,
    }: {
      email?: string;
      userId?: string | null;
    }) => {
      await agent.get("/account/resendConfirmEmail", {
        params: {
          email,
          userId,
        },
      });
    },
  });

  const logoutUser = useMutation({
    mutationFn: async () => {
      await agent.post("/account/logout");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["activities"] });
      navigate("/");
    },
  });

  const { data: currentUser, isLoading: loadingUserInfo } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await agent.get<User>("/account/user-info");
      return response.data;
    },
    enabled: !queryClient.getQueryData(["user"]),
  });

  const registerUser = useMutation({
    mutationFn: async (creds: RegisterSchema) => {
      await agent.post("/account/register", creds);
    },
  });

  return {
    loginUser,
    logoutUser,
    currentUser,
    loadingUserInfo,
    registerUser,
    verifyEmail,
    resendConfirmEmail,
  };
};
