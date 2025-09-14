using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Resend;

namespace Infrastructure.Email;

public class EmailSender(IServiceProvider provider, IConfiguration configuration) : IEmailSender<User>
{
    public async Task SendConfirmationLinkAsync(User user, string email, string confirmationLink)
    {
        var subject = "Confirm your email address";
        var body = $@"
            <p>Hi {user.DisplayName}</p>
            <p>Please confirm your email by clicking the link below</p>
            <p><a href='{confirmationLink}'>Click here to verify email</a></p>
            <p>Thanks</p>
        ";
        await SendEmailAsync(email, subject, body);
    }

    public async Task SendPasswordResetCodeAsync(User user, string email, string resetCode)
    {
        var subject = "Reset your password";
        var link = $"{configuration["ClientAppUrl"]}/reset-password?email={email}&code={resetCode}";
        var body = $@"
            <p>Hi {user.DisplayName}</p>
            <p>Please click this link to reset your password</p>
            <p>
                <a href='{link}'>Click to reset password</a>
            </p>
            <p>If you did not request this, you can ignore this email</p>
        ";
        await SendEmailAsync(email, subject, body);
    }

    public Task SendPasswordResetLinkAsync(User user, string email, string resetLink)
    {
        throw new NotImplementedException();
    }

    private async Task SendEmailAsync(string email, string subject, string body)
    {
        var message = new EmailMessage
        {
            From = "whatever@resend.dev",
            Subject = subject,
            HtmlBody = body,
        };
        message.To.Add(email);

        Console.WriteLine(message.HtmlBody);

        using var scope = provider.CreateScope();
        var resend = scope.ServiceProvider.GetRequiredService<IResend>();
        Console.WriteLine(resend);

        await resend.EmailSendAsync(message);
        // await Task.CompletedTask;
    }
}
