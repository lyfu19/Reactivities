using Application.Core;
using Application.Interfaces;
using Application.Profiles.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Queries;

public class GetFollowings
{
    public class Query : IRequest<Result<List<UserProfile>>>
    {
        public string Predicate { get; set; } = "followers";
        public required string UserId { get; set; }
    }

    public class Handler(
        AppDbContext dbContext,
        IMapper mapper,
        IUserAccessor userAccessor
    ) : IRequestHandler<Query, Result<List<UserProfile>>>
    {
        public async Task<Result<List<UserProfile>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var profiles = new List<UserProfile>();
            var currentUserId = userAccessor.GetUserId();

            switch (request.Predicate)
            {
                case "followers":
                    profiles = await dbContext.UserFollowings
                        .Where(x => x.TargetId == request.UserId)
                        .Select(x => x.Observer)
                        .ProjectTo<UserProfile>(mapper.ConfigurationProvider, new { currentUserId })
                        .ToListAsync(cancellationToken: cancellationToken);
                    break;
                case "followings":
                    profiles = await dbContext.UserFollowings
                        .Where(x => x.ObserverId == request.UserId)
                        .Select(x => x.Target)
                        .ProjectTo<UserProfile>(mapper.ConfigurationProvider, new { currentUserId })
                        .ToListAsync(cancellationToken: cancellationToken);
                    break;
            }

            return Result<List<UserProfile>>.Success(profiles);
        }
    }
}
