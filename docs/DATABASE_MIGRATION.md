# Bell24H Marketplace - Database Migration Guide

This document provides instructions for migrating the Bell24H database to a new environment or backing up and restoring data.

## Database Schema

Bell24H uses a PostgreSQL database with the following schema managed by Drizzle ORM. The schema definitions can be found in `shared/schema.ts`.

## Exporting Data from Development Environment

If you need to export data from your development environment before deploying elsewhere, follow these steps:

### Using pg_dump (Command Line)

1. Install the PostgreSQL client tools on your local machine if needed.

2. Export the database using environment variables:
   ```bash
   # Get connection details from your .env file
   echo $DATABASE_URL
   
   # Use the connection details to run pg_dump locally
   pg_dump -h <host> -p <port> -U <username> -d <dbname> -W -F c -f bell24h-export.dump
   ```

3. Download the `bell24h-export.dump` file.

### Using Database Export Tools (psql)

1. Export specific tables:
   ```bash
   PGPASSWORD=<password> pg_dump -h <host> -p <port> -U <username> -d <dbname> -t <table_name> -F c -f <table_name>.dump
   ```

2. Export schema only (without data):
   ```bash
   PGPASSWORD=<password> pg_dump -h <host> -p <port> -U <username> -d <dbname> --schema-only -f schema.sql
   ```

## Importing Data to a New Environment

### Restoring a Full Database Backup

1. Create a new PostgreSQL database:
   ```bash
   createdb bell24h
   ```

2. Restore from a dump file:
   ```bash
   pg_restore -h <host> -p <port> -U <username> -d bell24h -W bell24h-export.dump
   ```

### Using Drizzle Migrations

Bell24H now uses Drizzle ORM for schema management and migrations. To set up a fresh database:

1. Configure the new database connection in your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/bell24h
   ```

2. Run the database migration command:
   ```bash
   npm run db:migrate
   ```

This will create all necessary tables based on the migration files in the `drizzle` directory.

To generate new migrations after schema changes:

```bash
npm run db:generate
```

## Data Migration Strategies

### Option 1: Full Database Dump/Restore

Best for complete migration with all data intact:
- Export the full database as described above
- Restore to the new environment
- Update connection strings in your application

### Option 2: Schema-Only Migration with Manual Data Import

Best for selective data migration or when restructuring:
- Set up schema on new database using `npm run db:migrate`
- Export only specific data tables
- Import those tables to the new environment
- Useful when you want to clean up data during migration

### Option 3: API-Based Migration

For very selective migration or when transforming data:
- Create a custom migration script using the Bell24H API
- Fetch data from the old environment via API calls
- Transform data as needed
- Insert into the new environment

## Backup Best Practices

1. **Regular backups**: Schedule automated backups using cron jobs or your hosting provider's tools.

2. **Backup rotation**: Keep daily backups for a week, weekly backups for a month, and monthly backups for a year.

3. **Test your backups**: Regularly verify that your backups can be successfully restored.

4. **Offsite storage**: Store backups in a different location than your production database.

## Example Backup Script

```bash
#!/bin/bash
# bell24h-backup.sh

# Environment variables
DB_HOST="your_host"
DB_PORT="your_port"
DB_USER="your_username"
DB_NAME="your_dbname"
DB_PASSWORD="your_password"

# Create backup directory with date
BACKUP_DIR="bell24h_backups/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

# Set PGPASSWORD environment variable
export PGPASSWORD=$DB_PASSWORD

# Backup the database
pg_dump -h $DB_HOST -p $PORT -U $DB_USER -d $DB_NAME -F c -f "$BACKUP_DIR/bell24h_backup.dump"

# Remove PGPASSWORD environment variable
unset PGPASSWORD

# Optional: compress the backup
gzip "$BACKUP_DIR/bell24h_backup.dump"

# Optional: upload to cloud storage
# aws s3 cp "$BACKUP_DIR/bell24h_backup.dump.gz" s3://your-bucket/database-backups/

echo "Backup completed: $BACKUP_DIR/bell24h_backup.dump.gz"
```

Make this script executable and schedule it with cron:
```bash
chmod +x bell24h-backup.sh
crontab -e

# Add the following line to run daily at 2 AM:
0 2 * * * /path/to/bell24h-backup.sh
```

## Troubleshooting

### Common Migration Issues

1. **Version Compatibility**: Ensure PostgreSQL versions are compatible between environments.

2. **Character Encoding**: Verify that character encodings match to avoid text corruption.

3. **Permissions**: Make sure the database user has sufficient privileges.

4. **Connection Issues**: Check firewalls, network security groups, and database connection limits.

5. **Large Data Sets**: For very large databases, consider using parallel export/import tools or breaking down the migration into smaller chunks.

### Migration Verification

After migration, run these checks:

1. Count records in key tables to ensure all data was migrated.
2. Test key application workflows to verify data integrity.
3. Check application logs for any database-related errors.
4. Verify indexes and constraints are properly created.

## AI Model Data Migration

For AI model data and explanation history:

1. Export the explanations table:
   ```bash
   PGPASSWORD=<password> pg_dump -h <host> -p <port> -U <username> -d <dbname> -t explanations -F c -f explanations.dump
   ```

2. Export any model metadata tables:
   ```bash
   PGPASSWORD=<password> pg_dump -h <host> -p <port> -U <username> -d <dbname> -t model_metadata -F c -f model_metadata.dump
   ```

3. For model files themselves, copy them from the old environment to the new one:
   ```bash
   scp user@old-server:/path/to/models/* /path/to/new/models/
   ```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Database Migration Best Practices](https://www.percona.com/blog/2020/07/20/postgresql-migration-best-practices/)
