using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back_end_vozTrip.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentOrdersAndPoiBoost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_featured",
                table: "pois",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "featured_until",
                table: "pois",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "payment_orders",
                columns: table => new
                {
                    order_id   = table.Column<string>(type: "text", nullable: false),
                    seller_id  = table.Column<string>(type: "text", nullable: false),
                    type       = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    poi_id     = table.Column<string>(type: "text", nullable: true),
                    amount     = table.Column<long>(type: "bigint", nullable: false),
                    order_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    status     = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "pending"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    paid_at    = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment_orders", x => x.order_id);
                    table.ForeignKey(
                        name: "FK_payment_orders_sellers_seller_id",
                        column: x => x.seller_id,
                        principalTable: "sellers",
                        principalColumn: "seller_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_payment_orders_pois_poi_id",
                        column: x => x.poi_id,
                        principalTable: "pois",
                        principalColumn: "poi_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_payment_orders_order_code",
                table: "payment_orders",
                column: "order_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_payment_orders_seller_id",
                table: "payment_orders",
                column: "seller_id");

            migrationBuilder.CreateIndex(
                name: "IX_payment_orders_status",
                table: "payment_orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_payment_orders_poi_id",
                table: "payment_orders",
                column: "poi_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "payment_orders");

            migrationBuilder.DropColumn(name: "is_featured", table: "pois");
            migrationBuilder.DropColumn(name: "featured_until", table: "pois");
        }
    }
}
