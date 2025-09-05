using Application.Activities.DTOs;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Commands;

public class AddComment
{
    public class Command : IRequest<Result<CommentDto>>
    {
        public required string Body { get; set; }
        public required string ActivityId { get; set; }
    }

    public class Handler(
        AppDbContext dbContext,
        IUserAccessor userAccessor,
        IMapper mapper
    ) : IRequestHandler<Command, Result<CommentDto>>
    {
        public async Task<Result<CommentDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            // 1. 获取活动（包含 Comments + User）
            var activity = await dbContext.Activities
                .Include(x => x.Comments)
                .ThenInclude(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == request.ActivityId, cancellationToken);

            if (activity == null)
                return Result<CommentDto>.Failure("Could not find activity", 404);

            // 2. 获取当前用户
            var user = await userAccessor.GetUserAsync();

            // 3. 创建 Comment
            var comment = new Comment
            {
                Body = request.Body,
                UserId = user.Id,
                ActivityId = activity.Id
            };

            // ⚠️ 注意：由于 `Comment.User` 和 `Comment.Activity` 之前标记为 required，
            // 初始化对象时会报错。因此这里改为 `= null!` 以避免构造器强制要求。

            // 4. 保存到数据库
            activity.Comments.Add(comment);
            var result = await dbContext.SaveChangesAsync(cancellationToken) > 0;

            // 5. 返回结果
            return result
                ? Result<CommentDto>.Success(mapper.Map<CommentDto>(comment))
                : Result<CommentDto>.Failure("Failed to add comment", 400);
        }
    }
}
