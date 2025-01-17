﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using oneroom_api.data;
using oneroom_api.Model;

namespace oneroom_api.Migrations
{
    [DbContext(typeof(OneRoomContext))]
    [Migration("20190308125651_GameChallenges")]
    partial class GameChallenges
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.2-servicing-10034")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("oneroom_api.Model.Challenge", b =>
                {
                    b.Property<int>("ChallengeId")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Description");

                    b.Property<string>("URLDocumentation");

                    b.HasKey("ChallengeId");

                    b.ToTable("Challenges");
                });

            modelBuilder.Entity("oneroom_api.Model.Configuration", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("FaceEndpoint");

                    b.Property<string>("FaceKey");

                    b.Property<int>("MinimumRecognized");

                    b.Property<double>("RefreshRate");

                    b.Property<string>("VisionEndpoint");

                    b.Property<string>("VisionKey");

                    b.HasKey("Id");

                    b.ToTable("Configuration");
                });

            modelBuilder.Entity("oneroom_api.Model.Face", b =>
                {
                    b.Property<Guid>("FaceId")
                        .ValueGeneratedOnAdd();

                    b.Property<double>("Age");

                    b.Property<double>("BaldLevel");

                    b.Property<double>("BeardLevel");

                    b.Property<DateTime>("CreationDate");

                    b.Property<string>("EmotionDominant");

                    b.Property<int>("GlassesType");

                    b.Property<string>("HairColor");

                    b.Property<string>("HairLength");

                    b.Property<bool>("IsMale");

                    b.Property<double>("MoustacheLevel");

                    b.Property<string>("SkinColor");

                    b.Property<double>("SmileLevel");

                    b.Property<Guid?>("UserId");

                    b.HasKey("FaceId");

                    b.HasIndex("FaceId")
                        .IsUnique();

                    b.HasIndex("UserId");

                    b.ToTable("Faces");
                });

            modelBuilder.Entity("oneroom_api.Model.Game", b =>
                {
                    b.Property<int>("GameId")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("ConfigId");

                    b.Property<DateTime>("CreationDate");

                    b.Property<string>("GroupName")
                        .IsRequired();

                    b.Property<int>("State");

                    b.HasKey("GameId");

                    b.HasIndex("ConfigId");

                    b.HasIndex("GroupName")
                        .IsUnique();

                    b.ToTable("Games");
                });

            modelBuilder.Entity("oneroom_api.Model.GameChallenge", b =>
                {
                    b.Property<int>("GameId");

                    b.Property<int>("ChallengeId");

                    b.HasKey("GameId", "ChallengeId");

                    b.HasIndex("ChallengeId");

                    b.ToTable("GameChallenge");
                });

            modelBuilder.Entity("oneroom_api.Model.Team", b =>
                {
                    b.Property<int>("TeamId")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("CreationDate");

                    b.Property<int?>("GameId");

                    b.Property<string>("TeamColor");

                    b.Property<string>("TeamName");

                    b.HasKey("TeamId");

                    b.HasIndex("GameId");

                    b.ToTable("Teams");
                });

            modelBuilder.Entity("oneroom_api.Model.User", b =>
                {
                    b.Property<Guid>("UserId")
                        .ValueGeneratedOnAdd();

                    b.Property<double>("Age");

                    b.Property<double>("BaldLevel");

                    b.Property<double>("BeardLevel");

                    b.Property<DateTime>("CreationDate");

                    b.Property<string>("EmotionDominant");

                    b.Property<int?>("GameId");

                    b.Property<int>("Gender");

                    b.Property<int>("GlassesType");

                    b.Property<string>("HairColor");

                    b.Property<string>("HairLength");

                    b.Property<bool>("IsFirstConnected");

                    b.Property<double>("MoustacheLevel");

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<int>("Recognized");

                    b.Property<DateTime>("RecognizedDate");

                    b.Property<string>("SkinColor");

                    b.Property<double>("SmileLevel");

                    b.Property<int?>("TeamId");

                    b.Property<string>("UrlAvatar");

                    b.HasKey("UserId");

                    b.HasIndex("GameId");

                    b.HasIndex("TeamId");

                    b.HasIndex("UserId")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("oneroom_api.Model.Face", b =>
                {
                    b.HasOne("oneroom_api.Model.User")
                        .WithMany("Faces")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("oneroom_api.Model.Game", b =>
                {
                    b.HasOne("oneroom_api.Model.Configuration", "Config")
                        .WithMany()
                        .HasForeignKey("ConfigId");
                });

            modelBuilder.Entity("oneroom_api.Model.GameChallenge", b =>
                {
                    b.HasOne("oneroom_api.Model.Challenge", "Challenge")
                        .WithMany("GameChallenges")
                        .HasForeignKey("ChallengeId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("oneroom_api.Model.Game", "Game")
                        .WithMany("GameChallenges")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("oneroom_api.Model.Team", b =>
                {
                    b.HasOne("oneroom_api.Model.Game")
                        .WithMany("Teams")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("oneroom_api.Model.User", b =>
                {
                    b.HasOne("oneroom_api.Model.Game")
                        .WithMany("Users")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("oneroom_api.Model.Team")
                        .WithMany("Users")
                        .HasForeignKey("TeamId");
                });
#pragma warning restore 612, 618
        }
    }
}
