using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back_end_vozTrip.Migrations
{
    /// <inheritdoc />
    public partial class AddFeedbackReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "feedback_reports",
                columns: table => new
                {
                    report_id = table.Column<string>(type: "text", nullable: false),
                    session_id = table.Column<string>(type: "text", nullable: true),
                    device_id = table.Column<string>(type: "text", nullable: true),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    poi_id = table.Column<string>(type: "text", nullable: true),
                    platform = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "web"),
                    lang = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "vi"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "pending"),
                    admin_note = table.Column<string>(type: "text", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_feedback_reports", x => x.report_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_feedback_reports_created_at",
                table: "feedback_reports",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_reports_status",
                table: "feedback_reports",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "feedback_reports");
        }
    }
}
