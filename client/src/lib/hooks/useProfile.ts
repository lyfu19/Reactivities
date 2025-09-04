import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useMemo } from "react";
import type { EditProfileSchema } from "../schemas/editProfileSchema";

export const useProfile = (id?: string) => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const response = await agent.get<Profile>(`/profiles/${id}`);
      return response.data;
    },
  });

  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ["photos", id],
    queryFn: async () => {
      const response = await agent.get<Photo[]>(`/profiles/${id}/photos`);
      return response.data;
    },
  });

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await agent.post<Photo>(
        "/profiles/add-photo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    },
    onSuccess: async (photo: Photo) => {
      queryClient.invalidateQueries({ queryKey: ["photos", id] });

      queryClient.setQueryData(["profile", id], (data: Profile) => {
        if (!data) {
          return data;
        }

        return {
          ...data,
          imageUrl: data.imageUrl ?? photo.url,
        };
      });

      queryClient.setQueryData(["user"], (data: User) => {
        if (!data) {
          return data;
        }

        return {
          ...data,
          imageUrl: data.imageUrl ?? photo.url,
        };
      });
    },
  });

  const setMainPhoto = useMutation({
    mutationFn: async (photo: Photo) => {
      await agent.put(`/profiles/${photo.id}/setMain`);
    },
    onSuccess: async (_, photo) => {
      queryClient.setQueryData(["user"], (data: User) => {
        if (!data) {
          return data;
        }

        return {
          ...data,
          imageUrl: photo.url,
        };
      });

      queryClient.setQueryData(["profile", id], (data: Profile) => {
        if (!data) {
          return data;
        }

        return {
          ...data,
          imageUrl: photo.url,
        };
      });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      await agent.delete(`/profiles/${photoId}/photos`);
    },
    onSuccess: (_, photoId) => {
      queryClient.setQueryData(["photos", id], (data: Photo[]) =>
        data?.filter((x) => x.id !== photoId)
      );
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (profile: EditProfileSchema) => {
      await agent.put("/profiles", profile);
    },
    onSuccess: (_, profile) => {
      queryClient.setQueryData(["user"], (data: User) => {
        return data ? { ...data, displayName: profile.displayName } : data;
      });

      queryClient.setQueryData(["profile", id], (data: Profile) => {
        return data
          ? { ...data, displayName: profile.displayName, bio: profile.bio }
          : data;
      });
    },
  });

  const isCurrentUser = useMemo(() => {
    return id === queryClient.getQueryData<User>(["user"])?.id;
  }, [id, queryClient]);

  return {
    profile,
    loadingProfile,
    photos,
    loadingPhotos,
    isCurrentUser,
    uploadPhoto,
    setMainPhoto,
    deletePhoto,
    updateProfile,
  };
};
