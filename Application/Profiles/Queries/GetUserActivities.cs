using Application.Core;
using Application.Interfaces;
using Application.Profiles.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Queries;

public class GetUserActivities
{
    public class Query : IRequest<Result<List<UserActivityDto>>>
    {
        public string? Filter { get; set; }
        public required string UserId { get; set; }
    }

    public class Handler(
        AppDbContext dbContext,
        IMapper mapper
    ) : IRequestHandler<Query, Result<List<UserActivityDto>>>
    {
        public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = dbContext.Activities
                .OrderBy(x => x.Date)
                .Where(x => x.Attendees.Any(a => a.UserId == request.UserId))
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = request.Filter switch
                {
                    "past" => query.Where(x => x.Date <= DateTime.UtcNow),
                    "hosting" => query.Where(x => x.Attendees.Any(a => a.IsHost && a.UserId == request.UserId)),
                    _ => query.Where(x => x.Date >= DateTime.UtcNow),
                };
            }

            var projectedQuery = query.ProjectTo<UserActivityDto>(mapper.ConfigurationProvider);
            var activities = await projectedQuery.ToListAsync(cancellationToken);

            return Result<List<UserActivityDto>>.Success(activities);
        }
    }
}
