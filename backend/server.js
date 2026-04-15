const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false } 
});

const DEFAULT_USER_ID = 1;

// --- Event Types API ---
app.get('/api/event-types', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM event_types WHERE user_id = $1', [DEFAULT_USER_ID]);
    res.json(rows);
});

app.post('/api/event-types', async (req, res) => {
    const { title, duration, slug } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO event_types (user_id, title, duration, slug) VALUES ($1, $2, $3, $4) RETURNING *',
            [DEFAULT_USER_ID, title, duration, slug]
        );
        res.json(rows[0]);
    } catch (err) { res.status(400).json({ error: 'Slug must be unique' }); }
});

app.delete('/api/event-types/:id', async (req, res) => {
    await pool.query('DELETE FROM event_types WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// --- Availability API ---
app.get('/api/availability', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM availabilities WHERE user_id = $1 ORDER BY day_of_week', [DEFAULT_USER_ID]);
    res.json(rows);
});

app.post('/api/availability', async (req, res) => {
    const { availabilities } = req.body; 
    await pool.query('DELETE FROM availabilities WHERE user_id = $1', [DEFAULT_USER_ID]);
    for (let av of availabilities) {
        if (av.active) {
            await pool.query(
                'INSERT INTO availabilities (user_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
                [DEFAULT_USER_ID, av.day_of_week, av.start_time, av.end_time]
            );
        }
    }
    res.json({ success: true });
});

// --- Booking & Slots API ---
app.get('/api/slots/:slug', async (req, res) => {
    const { slug } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    
    // Get Event Info
    const eventTypeRes = await pool.query('SELECT * FROM event_types WHERE slug = $1', [slug]);
    if (eventTypeRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const eventType = eventTypeRes.rows[0];

    // Get Day Availability
    const dayOfWeek = new Date(date).getDay();
    const avRes = await pool.query('SELECT * FROM availabilities WHERE user_id = $1 AND day_of_week = $2', [DEFAULT_USER_ID, dayOfWeek]);
    if (avRes.rows.length === 0) return res.json({ slots: [] }); // No availability this day
    
    const { start_time, end_time } = avRes.rows[0];
    
    // Get Existing Bookings
    const bookingsRes = await pool.query(
        `SELECT start_time, end_time FROM bookings WHERE event_type_id = $1 AND DATE(start_time) = $2 AND status = 'active'`,
        [eventType.id, date]
    );
    const existingBookings = bookingsRes.rows;

    // Generate Slots
    let slots = [];
    let currentTime = new Date(`${date}T${start_time}`);
    const endTimeObj = new Date(`${date}T${end_time}`);

    while (currentTime.getTime() + eventType.duration * 60000 <= endTimeObj.getTime()) {
        const slotEnd = new Date(currentTime.getTime() + eventType.duration * 60000);
        
        // Check overlap
        const isOverlap = existingBookings.some(b => {
            const bStart = new Date(b.start_time);
            const bEnd = new Date(b.end_time);
            return (currentTime < bEnd && slotEnd > bStart);
        });

        if (!isOverlap) {
            slots.push(currentTime.toISOString());
        }
        currentTime = new Date(currentTime.getTime() + 15 * 60000); // Step every 15 mins
    }
    res.json({ eventType, slots });
});

app.post('/api/bookings', async (req, res) => {
    const { event_type_id, invitee_name, invitee_email, start_time } = req.body;
    
    const eventTypeRes = await pool.query('SELECT duration FROM event_types WHERE id = $1', [event_type_id]);
    const duration = eventTypeRes.rows[0].duration;
    
    const end_time = new Date(new Date(start_time).getTime() + duration * 60000).toISOString();

    const { rows } = await pool.query(
        'INSERT INTO bookings (event_type_id, invitee_name, invitee_email, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [event_type_id, invitee_name, invitee_email, start_time, end_time]
    );
    res.json(rows[0]);
});

// --- Meetings API ---
app.get('/api/meetings', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT b.*, e.title as event_title 
        FROM bookings b JOIN event_types e ON b.event_type_id = e.id 
        ORDER BY b.start_time DESC
    `);
    res.json(rows);
});

app.put('/api/meetings/:id/cancel', async (req, res) => {
    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', req.params.id]);
    res.json({ success: true });
});

if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}
module.exports = app; // Required for Vercel