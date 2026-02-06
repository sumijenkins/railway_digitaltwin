const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'digitaltwin',
    password: 'Postgres26',
    port: 5432,
});

async function setupAndImport() {
    const client = await pool.connect();

    try {
        console.log('📊 Creating database schema...');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schema);

        console.log('✓ Schema created successfully');
        console.log('📥 Starting CSV import...');

        // Import CSV
        const csvPath = path.join(__dirname, 'data.csv');
        const content = fs.readFileSync(csvPath, 'utf-8');
        const lines = content.split('\n');

        console.log(`Processing ${lines.length - 1} rows...`);

        await client.query('BEGIN');

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',');
            const query = `
                INSERT INTO railway_telemetry (
                    timestamp, segment_id, ray_temperature, train_temperature, 
                    ray_vibration_x, ray_vibration_y, ray_vibration_z,
                    train_vibration_x, train_vibration_y, train_vibration_z,
                    rail_slope, train_speed, train_weight, ambient_temperature
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `;

            await client.query(query, values.map(v => v.trim()));

            if (i % 500 === 0) console.log(`  → ${i} rows imported...`);
        }

        await client.query('COMMIT');
        console.log('🎉 Success! All data imported into database.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', err.message);
    } finally {
        client.release();
        await pool.end();
        process.exit();
    }
}

setupAndImport();
