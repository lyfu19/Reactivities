using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[AllowAnonymous]
public class FullbackController : Controller
{
    public IActionResult Index()
    {
        string physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");
        string contentType = "text/HTML";

        return PhysicalFile(physicalPath, contentType);
    }
}
