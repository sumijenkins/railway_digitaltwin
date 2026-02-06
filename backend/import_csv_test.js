const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Directly specify the connection parameters
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'digitaltwin',
    password: 'Postgres26',
    port: 5432,
});

async function importCSV() {
    const filePath = path.join(__dirname, 'data.csv');

    if (!fs.existsSync(filePath)) {
        console.error('HATA: backend klasöründe data.csv dosyası bulunamadı!');
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const headers = lines[0].split(',');

    console.log(`${lines.length - 1} satır veri işleniyor...`);

    const client = await pool.connect();
    try {
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

            if (i % 100 === 0) console.log(`${i} satır yüklendi...`);
        }

        await client.query('COMMIT');
        console.log('Tebrikler! Tüm veriler başarıyla veritabanına aktarıldı.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.log('HATA oluştu, veriler geri alındı:', err.message);
    } finally {
        client.release();
        process.exit();
    }
}

importCSV();
