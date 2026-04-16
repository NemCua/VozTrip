using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back_end_vozTrip.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "plan",
                table: "sellers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "free");

            migrationBuilder.AddColumn<DateTime>(
                name: "plan_upgraded_at",
                table: "sellers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "plan",
                table: "sellers");

            migrationBuilder.DropColumn(
                name: "plan_upgraded_at",
                table: "sellers");
        }
    }
}
