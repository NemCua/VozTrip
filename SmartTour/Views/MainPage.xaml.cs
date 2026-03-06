using SmartTour.ViewModels;

namespace SmartTour.Views
{
    public partial class MainPage : ContentPage
    {
        private readonly MainViewModel _viewModel;

        public MainPage(MainViewModel viewModel)
        {
            InitializeComponent();
            _viewModel = viewModel;
            BindingContext = _viewModel;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            await _viewModel.InitializeCommand.ExecuteAsync(null);
            await _viewModel.LoadNearbyPOIsCommand.ExecuteAsync(null);
        }

        private async void OnMonitoringToggled(object sender, ToggledEventArgs e)
        {
            if (e.Value)
            {
                await _viewModel.StartMonitoringCommand.ExecuteAsync(null);
            }
            else
            {
                _viewModel.StopMonitoringCommand.Execute(null);
            }
        }

        private async void OnLanguageClicked(object sender, EventArgs e)
        {
            var result = await DisplayActionSheet(
                "Chọn ngôn ngữ / Select Language",
                "Hủy / Cancel",
                null,
                "Tiếng Việt",
                "English"
            );

            if (result == "Tiếng Việt")
            {
                _viewModel.ChangeLanguageCommand.Execute("vi");
            }
            else if (result == "English")
            {
                _viewModel.ChangeLanguageCommand.Execute("en");
            }
        }

        private async void OnSettingsClicked(object sender, EventArgs e)
        {
            // Navigate to settings page
            await DisplayAlert("Cài đặt", "Tính năng đang phát triển", "OK");
        }
    }
}
