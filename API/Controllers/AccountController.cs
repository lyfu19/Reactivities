using System.Net.Http.Headers;
using System.Text;
using API.DTOs;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using static API.DTOs.GitHubInfo;

namespace API.Controllers;

public class AccountController(
    SignInManager<User> signInManager,
    IEmailSender<User> emailSender,
    IConfiguration configuration
) : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("github-login")]
    public async Task<ActionResult> LoginWithGithub(string code)
    {
        if (string.IsNullOrEmpty(code))
        {
            return BadRequest("Missing authentication code");
        }

        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        // step 1 - exchange code for access token
        var tokenResponse = await httpClient.PostAsJsonAsync(
            "https://github.com/login/oauth/access_token",
            new GitHubAuthRequest
            {
                ClientId = configuration["Authentication:GitHub:ClientId"]!,
                ClientSecret = configuration["Authentication:GitHub:ClientSecret"]!,
                Code = code,
                RedirectUri = $"{configuration["ClientAppUrl"]}/auth-callback"
            }
        );

        if (!tokenResponse.IsSuccessStatusCode)
        {
            return BadRequest("Failed to get access token");
        }

        var tokenContent = await tokenResponse.Content.ReadFromJsonAsync<GitHubAuthResponse>();
        if (string.IsNullOrEmpty(tokenContent?.AccessToken))
        {
            return BadRequest("Failed to retrieve access token");
        }

        // step 2 - Fetch user info from GitHub
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenContent.AccessToken);
        httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Reactivities");

        var userResponse = await httpClient.GetAsync("https://api.github.com/user");
        if (!userResponse.IsSuccessStatusCode)
        {
            return BadRequest("Failed to fetch user from GitHub");
        }

        var userContent = await userResponse.Content.ReadFromJsonAsync<GitHubUser>();
        if (userContent == null)
        {
            return BadRequest("Failed to read user from GitHub");
        }

        // step 3 - getting the email if needed
        if (string.IsNullOrEmpty(userContent?.Email))
        {
            var emailResponse = await httpClient.GetAsync("https://api.github.com/user/emails");
            if (emailResponse.IsSuccessStatusCode)
            {
                var emails = await emailResponse.Content.ReadFromJsonAsync<List<GitHubEmail>>();

                var primary = emails?
                    .FirstOrDefault(e => e is { Primary: true, Verified: true })
                    ?.Email;
                if (string.IsNullOrEmpty(primary))
                {
                    return BadRequest("Failed to get email from GitHub");
                }
                userContent!.Email = primary;
            }
        }

        // step 3 - find or create user and sign in 
        var existingUser = await signInManager.UserManager.FindByEmailAsync(userContent!.Email);
        if (existingUser == null)
        {
            existingUser = new User
            {
                Email = userContent.Email,
                UserName = userContent.Email,
                DisplayName = userContent.Name,
                ImageUrl = userContent.ImageUrl,
                ExternalLogin = true
            };

            var createdResult = await signInManager.UserManager.CreateAsync(existingUser);
            if (!createdResult.Succeeded)
            {
                return BadRequest("Failed to create user");
            }
        }

        await signInManager.SignInAsync(existingUser, isPersistent: false);

        return Ok();
    }

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
            user.ImageUrl,
            user.ExternalLogin
        });
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();

        return NoContent();
    }

    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var user = await signInManager.UserManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var result = await signInManager.UserManager
            .ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (result.Succeeded)
        {
            return Ok();
        }

        return BadRequest(result.Errors.First().Description);
    }
}
