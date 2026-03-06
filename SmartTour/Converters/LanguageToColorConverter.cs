using System.Globalization;
using Microsoft.Maui.Graphics;

namespace SmartTour.Converters
{
    public class LanguageToColorConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            var selected = value?.ToString();
            var current = parameter?.ToString();

            if (!string.IsNullOrWhiteSpace(selected) && selected == current)
            {
                return Color.FromArgb("#0066CC");
            }

            return Color.FromArgb("#E9ECEF");
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            throw new NotSupportedException();
        }
    }
}
