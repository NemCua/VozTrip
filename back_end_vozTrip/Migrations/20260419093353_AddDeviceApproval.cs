using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back_end_vozTrip.Migrations
{
    /// <inheritdoc />
    public partial class AddDeviceApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "approved",
                table: "device_records",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "approved_at",
                table: "device_records",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "approved",
                table: "device_records");

            migrationBuilder.DropColumn(
                name: "approved_at",
                table: "device_records");
        }
    }
}
