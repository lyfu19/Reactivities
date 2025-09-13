using System.Text;
using API.DTOs;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(
    SignInManager<User> signInManager,
    IEmailSender<User> emailSender,
    IConfiguration configuration
) : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
    {
        var user = new User
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            DisplayName = registerDto.DisplayName,
        };

        var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);

        if (result.Succeeded)
        {
            await SendConfirmationEmailAsync(user, registerDto.Email);

            return Ok();
        }

        foreach (var error in result.Errors)
        {
            // 错误通过 result.Errors 获取，并添加到 ModelState
            ModelState.AddModelError(error.Code, error.Description);
        }
        // 读取 ModelState 里的错误并打包返回，因此前一步和这一步是“收集 → 返回”的关系
        return ValidationProblem();
    }

    [AllowAnonymous]
    [HttpGet("resendConfirmEmail")]
    public async Task<ActionResult> ResendConfirmEmail(string? email, string? userId)
    {
        if (string.IsNullOrEmpty(email) && string.IsNullOrEmpty(userId))
        {
            return BadRequest("Email or UserId must be provided");
        }

        var user = await signInManager.UserManager.Users
            .FirstOrDefaultAsync(x => x.Email == email || x.Id == userId);

        if (user == null || string.IsNullOrEmpty(user.Email))
        {
            return BadRequest("Invalid email");
        }

        await SendConfirmationEmailAsync(user, user.Email);

        return Ok();
    }

    private async Task SendConfirmationEmailAsync(User user, string email)
    {
        var token = await signInManager.UserManager.GenerateEmailConfirmationTokenAsync(user);
        var code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        var confirmEmailUrl = $"{configuration["ClientAppUrl"]}/confirm-email?userId={user.Id}&code={code}";

        await emailSender.SendConfirmationLinkAsync(user, email, confirmEmailUrl);
    }

    [AllowAnonymous]
    [HttpGet("user-info")]
    public async Task<ActionResult> GetUserInfo()
    {
        if (User.Identity?.IsAuthenticated == false)
        {
            return NoContent();
        }

        var user = await signInManager.UserManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            user.DisplayName,
            user.Email,
            user.Id,
            user.ImageUrl
        });
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();

        return NoContent();
    }
}
