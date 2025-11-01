using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ReportingService.Helpers;

namespace ReportingService.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RoleAuthorizationAttribute : Attribute, IAuthorizationFilter
{
    private readonly string[] _allowedRoles;

    public RoleAuthorizationAttribute(params string[] allowedRoles)
    {
        _allowedRoles = allowedRoles;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var token = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        
        if (string.IsNullOrEmpty(token))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var role = JwtHelper.GetRoleFromToken(token);
        
        if (string.IsNullOrEmpty(role))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Normalize role name (remove ROLE_ prefix if present)
        var normalizedRole = role.Replace("ROLE_", "");
        
        // Check if user has any of the allowed roles
        var hasAccess = _allowedRoles.Any(allowedRole => 
            string.Equals(normalizedRole, allowedRole, StringComparison.OrdinalIgnoreCase));

        if (!hasAccess)
        {
            context.Result = new ForbidResult();
        }
    }
}

