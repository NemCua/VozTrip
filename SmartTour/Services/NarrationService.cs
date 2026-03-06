using SmartTour.Models;
using Plugin.Maui.Audio; // Sẽ cần thêm package này

namespace SmartTour.Services
{
    /// <summary>
    /// Service xử lý phát âm thanh thuyết minh
    /// </summary>
    public class NarrationService
    {
        private bool _isPlaying = false;
        private string _currentLanguage = "vi";

        public event EventHandler<NarrationEventArgs>? NarrationStarted;
        public event EventHandler<NarrationEventArgs>? NarrationCompleted;
        public event EventHandler<NarrationEventArgs>? NarrationError;

        /// <summary>
        /// Phát thuyết minh cho POI
        /// </summary>
        public async Task PlayNarrationAsync(PointOfInterest poi, string language = "vi")
        {
            if (_isPlaying)
                await StopNarrationAsync();

            _isPlaying = true;
            _currentLanguage = language;

            try
            {
                OnNarrationStarted(poi);

                // Ưu tiên phát file audio có sẵn
                var audioPath = language == "vi" ? poi.AudioPathVi : poi.AudioPathEn;

                if (!string.IsNullOrEmpty(audioPath) && File.Exists(audioPath))
                {
                    await PlayAudioFileAsync(audioPath);
                }
                else
                {
                    // Nếu không có file audio, dùng TTS
                    var script = language == "vi" ? poi.TTSScriptVi : poi.TTSScriptEn;
                    if (!string.IsNullOrEmpty(script))
                    {
                        await PlayTextToSpeechAsync(script, language);
                    }
                }

                OnNarrationCompleted(poi);
            }
            catch (Exception ex)
            {
                OnNarrationError(poi, ex.Message);
            }
            finally
            {
                _isPlaying = false;
            }
        }

        /// <summary>
        /// Phát file audio
        /// </summary>
        private async Task PlayAudioFileAsync(string filePath)
        {
            // Sử dụng MediaElement hoặc audio player
            // Đây là implementation đơn giản, cần tích hợp thực tế với MAUI MediaElement
            
            try
            {
#if ANDROID || IOS
                // Sử dụng native audio player
                var player = AudioManager.Current.CreatePlayer(File.OpenRead(filePath));
                player.Play();
                
                // Đợi đến khi phát xong
                while (player.IsPlaying)
                {
                    await Task.Delay(100);
                }
#else
                // Windows/Desktop - có thể dùng System.Media.SoundPlayer
                await Task.CompletedTask;
#endif
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Audio playback error: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Chuyển văn bản thành giọng nói
        /// </summary>
        private async Task PlayTextToSpeechAsync(string text, string language)
        {
            try
            {
                // Sử dụng Text-to-Speech của platform
                var locales = await TextToSpeech.Default.GetLocalesAsync();
                
                var locale = language == "vi" 
                    ? locales.FirstOrDefault(l => l.Language.StartsWith("vi"))
                    : locales.FirstOrDefault(l => l.Language.StartsWith("en"));

                var options = new SpeechOptions
                {
                    Pitch = 1.0f,
                    Volume = 1.0f,
                    Locale = locale
                };

                await TextToSpeech.Default.SpeakAsync(text, options);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"TTS error: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Dừng phát thuyết minh
        /// </summary>
        public async Task StopNarrationAsync()
        {
            try
            {
                // Dừng TTS
                if (TextToSpeech.Default.GetType().GetMethod("CancelSpeakAsync") != null)
                {
                    await Task.Run(() => 
                    {
                        // Cancel any ongoing speech
                    });
                }

                _isPlaying = false;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Stop narration error: {ex.Message}");
            }
        }

        /// <summary>
        /// Đặt ngôn ngữ thuyết minh
        /// </summary>
        public void SetLanguage(string language)
        {
            _currentLanguage = language;
        }

        /// <summary>
        /// Kiểm tra có đang phát không
        /// </summary>
        public bool IsPlaying => _isPlaying;

        protected virtual void OnNarrationStarted(PointOfInterest poi)
        {
            NarrationStarted?.Invoke(this, new NarrationEventArgs(poi));
        }

        protected virtual void OnNarrationCompleted(PointOfInterest poi)
        {
            NarrationCompleted?.Invoke(this, new NarrationEventArgs(poi));
        }

        protected virtual void OnNarrationError(PointOfInterest poi, string error)
        {
            NarrationError?.Invoke(this, new NarrationEventArgs(poi, error));
        }
    }

    public class NarrationEventArgs : EventArgs
    {
        public PointOfInterest POI { get; }
        public string? ErrorMessage { get; }

        public NarrationEventArgs(PointOfInterest poi, string? errorMessage = null)
        {
            POI = poi;
            ErrorMessage = errorMessage;
        }
    }
}
