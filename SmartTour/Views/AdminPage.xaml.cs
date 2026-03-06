using SmartTour.ViewModels;

namespace SmartTour.Views
{
    public partial class AdminPage : TabbedPage
    {
        private readonly AdminViewModel _viewModel;

        public AdminPage(AdminViewModel viewModel)
        {
            InitializeComponent();
            _viewModel = viewModel;
            BindingContext = _viewModel;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            await _viewModel.LoadDataCommand.ExecuteAsync(null);
        }
    }
}
