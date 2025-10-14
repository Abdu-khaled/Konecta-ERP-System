using Microsoft.AspNetCore.Mvc;

namespace ReportingService.Controllers
{
    [ApiController]
    [Route("api/report")]
    public class ReportController : ControllerBase
    {
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Reporting Service (ASP.NET Core) is running!");
        }
    }
}



