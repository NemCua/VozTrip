using Microsoft.Extensions.DependencyInjection;
using SmartTour.Views;

namespace SmartTour
{
    public partial class App : Application
    {
        public App(IServiceProvider services)
        {
            InitializeComponent();

            // Set main page with navigation
            MainPage = new NavigationPage(services.GetRequiredService<MainPage>());
        }
    }
}
