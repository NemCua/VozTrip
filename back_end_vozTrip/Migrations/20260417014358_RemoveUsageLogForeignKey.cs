using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back_end_vozTrip.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUsageLogForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_usage_logs_guest_sessions_session_id",
                table: "usage_logs");

            migrationBuilder.DropIndex(
                name: "IX_usage_logs_session_id",
                table: "usage_logs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_usage_logs_session_id",
                table: "usage_logs",
                column: "session_id");

            migrationBuilder.AddForeignKey(
                name: "FK_usage_logs_guest_sessions_session_id",
                table: "usage_logs",
                column: "session_id",
                principalTable: "guest_sessions",
                principalColumn: "session_id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
