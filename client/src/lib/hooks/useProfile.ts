import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useMemo, useState } from "react";
import type { EditProfileSchema } from "../schemas/editProfileSchema";

export const useProfile = (id?: string, predicate?: string) => {
  const [filter, setFilter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const response = await agent.get<Profile>(`/profiles/${id}`);
      return response.data;
    },
    enabled: !!id && !predicate,
  });

  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ["photos", id],
    queryFn: async () => {
      const response = await agent.get<Photo[]>(`/profiles/${id}/photos`);
      return response.data;
    },
    enabled: !!id && !predicate,
  });

  const { data: followings, isLoading: loadingFollowings } = useQuery({
    queryKey: ["followings", id, predicate],
    queryFn: async () => {
      const response = await agent.get<Profile[]>(
        `/profiles/${id}/follow-list`,
        {
          params: { predicate: predicate },
        }
      );
      return response.data;
    },
    enabled: !!id && !!predicate,
  });

  const { data: userActivities, isLoading: LoadingUserActivities } = useQuery({
    queryKey: ["user-activities", id, filter],
    queryFn: async () => {
      const response = await agent.get<Activity[]>(
        `/profiles/${id}/activities`,
        { params: { filter: filter } }
      );
      return response.data;
    },
    enabled: !!filter && !!id,
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
        return data ? { ...data, imageUrl: data.imageUrl ?? photo.url } : data;
      });

      queryClient.setQueryData(["user"], (data: User) => {
        return data ? { ...data, imageUrl: data.imageUrl ?? photo.url } : data;
      });
    },
  });

  const setMainPhoto = useMutation({
    mutationFn: async (photo: Photo) => {
      await agent.put(`/profiles/${photo.id}/setMain`);
    },
    onSuccess: async (_, photo) => {
      queryClient.setQueryData(["user"], (data: User) => {
        return data ? { ...data, imageUrl: photo.url } : data;
      });

      queryClient.setQueryData(["profile", id], (data: Profile) => {
        return data ? { ...data, imageUrl: photo.url } : data;
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

  const updateFollowing = useMutation({
    mutationFn: async () => {
      await agent.post(`/profiles/${id}/follow`);
    },
    onSuccess: () => {
      queryClient.setQueryData(["profile", id], (data: Profile) => {
        queryClient.invalidateQueries({
          queryKey: ["followings", id, "followers"],
        });

        if (!data || data.followerCount === undefined) {
          return data;
        }

        return {
          ...data,
          following: !data.following,
          followerCount: data.following
            ? data.followerCount - 1
            : data.followerCount + 1,
        };
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
    updateFollowing,
    followings,
    loadingFollowings,
    userActivities,
    LoadingUserActivities,
    setFilter,
  };
};
