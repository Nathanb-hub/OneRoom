﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using oneroom_api.Model;

namespace oneroom_api.Migrations
{
    [DbContext(typeof(OneRoomContext))]
    [Migration("20190213111846_seed-data")]
    partial class seeddata
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.1-servicing-10028")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("oneroom_api.Model.Face", b =>
                {
                    b.Property<Guid>("FaceId")
                        .ValueGeneratedOnAdd();

                    b.Property<double>("Age");

                    b.Property<double>("BaldLevel");

                    b.Property<double>("BeardLevel");

                    b.Property<int>("GlassesType");

                    b.Property<string>("HairColor");

                    b.Property<bool>("IsMale");

                    b.Property<double>("MoustacheLevel");

                    b.Property<double>("SmileLevel");

                    b.Property<int?>("UserId");

                    b.HasKey("FaceId");

                    b.HasIndex("UserId");

                    b.ToTable("Face");
                });

            modelBuilder.Entity("oneroom_api.Model.User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Name");

                    b.Property<Guid>("PersonId");

                    b.Property<string>("UrlAvatar");

                    b.Property<string>("Username");

                    b.HasKey("UserId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("oneroom_api.Model.Face", b =>
                {
                    b.HasOne("oneroom_api.Model.User")
                        .WithMany("Faces")
                        .HasForeignKey("UserId");
                });
#pragma warning restore 612, 618
        }
    }
}