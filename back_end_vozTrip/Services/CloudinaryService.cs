using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace back_end_vozTrip.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var account = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );
        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
    }

    // Upload audio (mp3, m4a, wav...) — lưu trong folder voztrip/audio/{sellerId}
    public async Task<UploadResult> UploadAudioAsync(IFormFile file, string sellerId)
    {
        using var stream = file.OpenReadStream();
        var uploadParams = new RawUploadParams
        {
            File           = new FileDescription(file.FileName, stream),
            Folder         = $"voztrip/audio/{sellerId}",
            UniqueFilename = true,
            Overwrite      = false
        };
        var result = await _cloudinary.UploadAsync(uploadParams);
        return new UploadResult(result.SecureUrl.ToString(), result.PublicId, null);
    }

    // Upload ảnh — lưu trong folder voztrip/images/{sellerId}
    public async Task<UploadResult> UploadImageAsync(IFormFile file, string sellerId)
    {
        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File           = new FileDescription(file.FileName, stream),
            Folder         = $"voztrip/images/{sellerId}",
            UniqueFilename = true,
            Overwrite      = false,
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };
        var result = await _cloudinary.UploadAsync(uploadParams);
        return new UploadResult(result.SecureUrl.ToString(), result.PublicId, null);
    }

    // Upload video — lưu trong folder voztrip/videos/{sellerId}
    public async Task<UploadResult> UploadVideoAsync(IFormFile file, string sellerId)
    {
        using var stream = file.OpenReadStream();
        var uploadParams = new VideoUploadParams
        {
            File           = new FileDescription(file.FileName, stream),
            Folder         = $"voztrip/videos/{sellerId}",
            UniqueFilename = true,
            Overwrite      = false
        };
        var result = await _cloudinary.UploadAsync(uploadParams);
        return new UploadResult(result.SecureUrl.ToString(), result.PublicId, null);
    }

    // Xóa file theo public_id
    public async Task DeleteAsync(string publicId, ResourceType resourceType = ResourceType.Raw)
    {
        await _cloudinary.DestroyAsync(new DeletionParams(publicId)
        {
            ResourceType = resourceType
        });
    }
}

public record UploadResult(string Url, string PublicId, int? Duration);
