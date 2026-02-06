const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function streamData() {
    console.log('--- CANLI VERİ AKIŞI BAŞLATILIYOR ---');

    // Read CSV
    const csvPath = path.join(__dirname, 'data.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });

    console.log(`${records.length} satır veri okundu. Saniyede 1 satır gönderilecek...`);

    for (let i = 0; i < records.length; i++) {
        const row = records[i];

        // Use current time for the timestamp so it appears "Live" in the charts
        const currentTimestamp = new Date().toISOString();

        const query = `
            INSERT INTO railway_telemetry (
                timestamp, segment_id, ray_temperature, train_temperature, 
                ray_vibration_x, ray_vibration_y, ray_vibration_z,
                train_vibration_x, train_vibration_y, train_vibration_z,
                rail_slope, train_speed, train_weight, ambient_temperature
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;

        const values = [
            currentTimestamp,
            row.segment_id,
            parseFloat(row.ray_temperature),
            parseFloat(row.train_temperature),
            parseFloat(row.ray_vibration_x),
            parseFloat(row.ray_vibration_y),
            parseFloat(row.ray_vibration_z),
            parseFloat(row.train_vibration_x),
            parseFloat(row.train_vibration_y),
            parseFloat(row.train_vibration_z),
            parseFloat(row.rail_slope),
            parseFloat(row.train_speed),
            parseFloat(row.train_weight),
            parseFloat(row.ambient_temperature)
        ];

        try {
            await pool.query(query, values);
            process.stdout.write(`\r[LIVE] Gönderilen Satır: ${i + 1}/${records.length} | Hız: ${row.train_speed} km/h | Sıcaklık: ${row.ray_temperature}°C `);
        } catch (err) {
            console.error('\nKayıt hatası:', err.message);
        }

        // Wait 1 second before sending the next row
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n--- AKIŞ TAMAMLANDI ---');
    pool.end();
}

streamData();
