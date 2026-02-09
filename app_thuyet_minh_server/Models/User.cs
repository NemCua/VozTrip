namespace app_thuyet_minh_server.Models;
public class User
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = "tourist"; 
    // admin / seller / tourist

    public string PassHash { get; set; } = string.Empty;

    public int Status { get; set; } = 1;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}