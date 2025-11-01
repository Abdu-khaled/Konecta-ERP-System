using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ReportingService.Helpers;

public static class JwtHelper
{
    public static string? GetRoleFromToken(string? token)
    {
        if (string.IsNullOrEmpty(token) || !token.StartsWith("Bearer "))
            return null;

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token.Substring(7));
            
            var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "role" || c.Type == ClaimTypes.Role);
            return roleClaim?.Value;
        }
        catch
        {
            return null;
        }
    }

    public static string? GetUsernameFromToken(string? token)
    {
        if (string.IsNullOrEmpty(token) || !token.StartsWith("Bearer "))
            return null;

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token.Substring(7));
            return jwtToken.Subject;
        }
        catch
        {
            return null;
        }
    }

    public static bool HasRequiredRole(string? token, params string[] allowedRoles)
    {
        var role = GetRoleFromToken(token);
        if (string.IsNullOrEmpty(role))
            return false;

        return allowedRoles.Any(allowedRole => 
            string.Equals(role, allowedRole, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(role, allowedRole.Replace("ROLE_", ""), StringComparison.OrdinalIgnoreCase));
    }
}

