using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Commands;

public class FollowToggle
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string TargetUserId { get; set; }
    }

    public class Handler(
        AppDbContext dbContext,
        IUserAccessor userAccessor
    ) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var observer = await userAccessor.GetUserAsync();
            var target = await dbContext.Users.FindAsync([request.TargetUserId], cancellationToken);

            if (target == null)
                return Result<Unit>.Failure("Target user not found", 400);

            var folloing = await dbContext.UserFollowings.FindAsync([observer.Id, target.Id], cancellationToken);
            if (folloing == null)
            {
                dbContext.UserFollowings.Add(new UserFollowing
                {
                    ObserverId = observer.Id,
                    TargetId = target.Id
                });
            }
            else
            {
                dbContext.UserFollowings.Remove(folloing);
            }

            var result = await dbContext.SaveChangesAsync(cancellationToken) > 0;
            return result
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Problem updating following", 400);
        }
    }
}
