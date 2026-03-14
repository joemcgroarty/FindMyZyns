-- Enable required PostgreSQL extensions
create extension if not exists "postgis" with schema public;
create extension if not exists "pgcrypto" with schema public;
