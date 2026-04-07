using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back_end_vozTrip.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "languages",
                columns: table => new
                {
                    language_id = table.Column<string>(type: "text", nullable: false),
                    language_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    language_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_languages", x => x.language_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "zones",
                columns: table => new
                {
                    zone_id = table.Column<string>(type: "text", nullable: false),
                    zone_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_zones", x => x.zone_id);
                });

            migrationBuilder.CreateTable(
                name: "guest_sessions",
                columns: table => new
                {
                    session_id = table.Column<string>(type: "text", nullable: false),
                    language_id = table.Column<string>(type: "text", nullable: true),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_guest_sessions", x => x.session_id);
                    table.ForeignKey(
                        name: "FK_guest_sessions_languages_language_id",
                        column: x => x.language_id,
                        principalTable: "languages",
                        principalColumn: "language_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "sellers",
                columns: table => new
                {
                    seller_id = table.Column<string>(type: "text", nullable: false),
                    shop_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    shop_logo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    contact_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approved_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sellers", x => x.seller_id);
                    table.ForeignKey(
                        name: "FK_sellers_users_approved_by",
                        column: x => x.approved_by,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_sellers_users_seller_id",
                        column: x => x.seller_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pois",
                columns: table => new
                {
                    poi_id = table.Column<string>(type: "text", nullable: false),
                    seller_id = table.Column<string>(type: "text", nullable: false),
                    zone_id = table.Column<string>(type: "text", nullable: true),
                    poi_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    latitude = table.Column<double>(type: "double precision", nullable: false),
                    longitude = table.Column<double>(type: "double precision", nullable: false),
                    trigger_radius = table.Column<double>(type: "double precision", nullable: false, defaultValue: 10.0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pois", x => x.poi_id);
                    table.ForeignKey(
                        name: "FK_pois_sellers_seller_id",
                        column: x => x.seller_id,
                        principalTable: "sellers",
                        principalColumn: "seller_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_pois_zones_zone_id",
                        column: x => x.zone_id,
                        principalTable: "zones",
                        principalColumn: "zone_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "poi_localizations",
                columns: table => new
                {
                    localization_id = table.Column<string>(type: "text", nullable: false),
                    poi_id = table.Column<string>(type: "text", nullable: false),
                    language_id = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    audio_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    audio_public_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    audio_duration = table.Column<int>(type: "integer", nullable: true),
                    is_auto_translated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_poi_localizations", x => x.localization_id);
                    table.ForeignKey(
                        name: "FK_poi_localizations_languages_language_id",
                        column: x => x.language_id,
                        principalTable: "languages",
                        principalColumn: "language_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_poi_localizations_pois_poi_id",
                        column: x => x.poi_id,
                        principalTable: "pois",
                        principalColumn: "poi_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "poi_media",
                columns: table => new
                {
                    media_id = table.Column<string>(type: "text", nullable: false),
                    poi_id = table.Column<string>(type: "text", nullable: false),
                    media_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    media_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    public_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_poi_media", x => x.media_id);
                    table.ForeignKey(
                        name: "FK_poi_media_pois_poi_id",
                        column: x => x.poi_id,
                        principalTable: "pois",
                        principalColumn: "poi_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "questions",
                columns: table => new
                {
                    question_id = table.Column<string>(type: "text", nullable: false),
                    poi_id = table.Column<string>(type: "text", nullable: false),
                    language_id = table.Column<string>(type: "text", nullable: false),
                    question_text = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_questions", x => x.question_id);
                    table.ForeignKey(
                        name: "FK_questions_languages_language_id",
                        column: x => x.language_id,
                        principalTable: "languages",
                        principalColumn: "language_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_questions_pois_poi_id",
                        column: x => x.poi_id,
                        principalTable: "pois",
                        principalColumn: "poi_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "visit_logs",
                columns: table => new
                {
                    log_id = table.Column<string>(type: "text", nullable: false),
                    session_id = table.Column<string>(type: "text", nullable: true),
                    poi_id = table.Column<string>(type: "text", nullable: true),
                    triggered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_visit_logs", x => x.log_id);
                    table.ForeignKey(
                        name: "FK_visit_logs_guest_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "guest_sessions",
                        principalColumn: "session_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_visit_logs_pois_poi_id",
                        column: x => x.poi_id,
                        principalTable: "pois",
                        principalColumn: "poi_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "answers",
                columns: table => new
                {
                    answer_id = table.Column<string>(type: "text", nullable: false),
                    question_id = table.Column<string>(type: "text", nullable: false),
                    poi_id = table.Column<string>(type: "text", nullable: false),
                    language_id = table.Column<string>(type: "text", nullable: false),
                    answer_text = table.Column<string>(type: "text", nullable: false),
                    audio_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    audio_public_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_answers", x => x.answer_id);
                    table.ForeignKey(
                        name: "FK_answers_languages_language_id",
                        column: x => x.language_id,
                        principalTable: "languages",
                        principalColumn: "language_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_answers_pois_poi_id",
                        column: x => x.poi_id,
                        principalTable: "pois",
                        principalColumn: "poi_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_answers_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "question_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_answers_language_id",
                table: "answers",
                column: "language_id");

            migrationBuilder.CreateIndex(
                name: "IX_answers_poi_id",
                table: "answers",
                column: "poi_id");

            migrationBuilder.CreateIndex(
                name: "IX_answers_question_id",
                table: "answers",
                column: "question_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_guest_sessions_language_id",
                table: "guest_sessions",
                column: "language_id");

            migrationBuilder.CreateIndex(
                name: "IX_languages_language_code",
                table: "languages",
                column: "language_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_poi_localizations_language_id",
                table: "poi_localizations",
                column: "language_id");

            migrationBuilder.CreateIndex(
                name: "IX_poi_localizations_poi_id_language_id",
                table: "poi_localizations",
                columns: new[] { "poi_id", "language_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_poi_media_poi_id",
                table: "poi_media",
                column: "poi_id");

            migrationBuilder.CreateIndex(
                name: "IX_pois_seller_id",
                table: "pois",
                column: "seller_id");

            migrationBuilder.CreateIndex(
                name: "IX_pois_zone_id",
                table: "pois",
                column: "zone_id");

            migrationBuilder.CreateIndex(
                name: "IX_questions_language_id",
                table: "questions",
                column: "language_id");

            migrationBuilder.CreateIndex(
                name: "IX_questions_poi_id",
                table: "questions",
                column: "poi_id");

            migrationBuilder.CreateIndex(
                name: "IX_sellers_approved_by",
                table: "sellers",
                column: "approved_by");

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                table: "users",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_visit_logs_poi_id",
                table: "visit_logs",
                column: "poi_id");

            migrationBuilder.CreateIndex(
                name: "IX_visit_logs_session_id",
                table: "visit_logs",
                column: "session_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "answers");

            migrationBuilder.DropTable(
                name: "poi_localizations");

            migrationBuilder.DropTable(
                name: "poi_media");

            migrationBuilder.DropTable(
                name: "visit_logs");

            migrationBuilder.DropTable(
                name: "questions");

            migrationBuilder.DropTable(
                name: "guest_sessions");

            migrationBuilder.DropTable(
                name: "pois");

            migrationBuilder.DropTable(
                name: "languages");

            migrationBuilder.DropTable(
                name: "sellers");

            migrationBuilder.DropTable(
                name: "zones");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
