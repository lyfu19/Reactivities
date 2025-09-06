using Application.Activities.DTOs;
using Application.Profiles.DTOs;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        string? currentUserId = null;

        CreateMap<Activity, Activity>();
        CreateMap<EditActivityDto, Activity>();
        CreateMap<CreateActivityDto, Activity>();
        CreateMap<Activity, ActivityDto>()
            .ForMember(
                d => d.HostDisplayName,
                o => o.MapFrom(
                    s => s.Attendees.FirstOrDefault(x => x.IsHost)!.User.DisplayName
                )
            )
            .ForMember(
                d => d.HostId,
                o => o.MapFrom(
                    s => s.Attendees.FirstOrDefault(x => x.IsHost)!.User.Id
                )
            );
        /*
        CreateMap<ActivityAttendee, UserProfile>()
            .ForMember(
                d => d.Id,
                o => o.MapFrom(
                    s => s.User.Id
                )
            )
            .ForMember(
                d => d.DisplayName,
                o => o.MapFrom(
                    s => s.User.DisplayName
                )
            )
            .ForMember(
                d => d.Bio,
                o => o.MapFrom(
                    s => s.User.Bio
                )
            )
            .ForMember(
                d => d.ImageUrl,
                o => o.MapFrom(
                    s => s.User.ImageUrl
                )
            );
        */
        CreateMap<ActivityAttendee, UserProfile>()
            .IncludeMembers(s => s.User);
        CreateMap<User, UserProfile>()
            .ForMember(
                d => d.FollowerCount,
                o => o.MapFrom(
                    s => s.Followers.Count
                )
            )
            .ForMember(
                d => d.FollowingCount,
                o => o.MapFrom(
                    s => s.Followings.Count
                )
            )
            .ForMember(
                d => d.Following,
                o => o.MapFrom(
                    s => s.Followers.Any(x => x.ObserverId == currentUserId)
                )
            );
        CreateMap<Comment, CommentDto>()
            .ForMember(
                d => d.DisplayName,
                o => o.MapFrom(
                    s => s.User.DisplayName
                )
            )
            .ForMember(
                d => d.ImageUrl,
                o => o.MapFrom(
                    s => s.User.ImageUrl
                )
            );
    }
}
