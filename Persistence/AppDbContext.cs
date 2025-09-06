using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<User>(options)
{
    public required DbSet<Activity> Activities { get; set; }
    public required DbSet<ActivityAttendee> ActivityAttendees { get; set; }
    public required DbSet<Photo> Photos { get; set; }
    public required DbSet<Comment> Comments { get; set; }
    public required DbSet<UserFollowing> UserFollowings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ActivityAttendee>(x =>
        {
            x.HasKey(a => new { a.ActivityId, a.UserId });

            x.HasOne(a => a.User)
                .WithMany(u => u.Activities)
                .HasForeignKey(a => a.UserId);

            x.HasOne(a => a.Activity)
                .WithMany(act => act.Attendees)
                .HasForeignKey(a => a.ActivityId);
        });

        builder.Entity<UserFollowing>(x =>
        {
            x.HasKey(k => new { k.ObserverId, k.TargetId });

            x.HasOne(f => f.Observer)
                .WithMany(u => u.Followings)
                .HasForeignKey(f => f.ObserverId)
                .OnDelete(DeleteBehavior.Cascade);

            x.HasOne(f => f.Target)
                .WithMany(u => u.Followers)
                .HasForeignKey(f => f.TargetId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            foreach (var propety in entityType.GetProperties())
            {
                if (propety.ClrType == typeof(DateTime))
                {
                    propety.SetValueConverter(dateTimeConverter);
                }
            }
        }
    }
}
