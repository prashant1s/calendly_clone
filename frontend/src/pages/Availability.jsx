import React, { useState, useEffect } from 'react';
import API from '../api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Availability() {
    const [schedule, setSchedule] = useState(DAYS.map((d, i) => ({ day_of_week: i, active: false, start_time: '09:00', end_time: '17:00' })));
    
    // Auto-detect browser timezone
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

    useEffect(() => {
        const loadAvailability = async () => {
            const { data } = await API.get('/availability');
            if (data.length > 0) {
                const newSchedule = [...schedule];
                data.forEach(d => {
                    newSchedule[d.day_of_week] = { ...d, active: true, start_time: d.start_time.substring(0, 5), end_time: d.end_time.substring(0, 5) };
                });
                setSchedule(newSchedule);
            }
        };
        loadAvailability();
    }, []);

    const save = async () => {
        await API.post('/availability', { availabilities: schedule });
        alert(`Availability & Timezone (${timezone}) Saved!`);
    };

    return (
        <div className="bg-white p-8 shadow-sm rounded-lg border border-gray-200">
            <h2 className="text-2xl font-semibold mb-2">Default Hours</h2>
            <p className="text-gray-500 mb-6 text-sm">Define your standard weekly working hours.</p>
            
            {/* Timezone Selector */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center">
                <label className="text-gray-700 font-medium mr-4">Timezone</label>
                <select 
                    value={timezone} 
                    onChange={(e) => setTimezone(e.target.value)} 
                    className="border border-gray-300 rounded p-2 outline-none focus:border-blue-500 bg-white"
                >
                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                        {Intl.DateTimeFormat().resolvedOptions().timeZone} (Local)
                    </option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                </select>
            </div>

            {schedule.map((day, idx) => (
                <div key={idx} className="flex items-center mb-4 py-2 border-b border-gray-50">
                    <label className="flex items-center w-32 cursor-pointer">
                        <input type="checkbox" checked={day.active} onChange={(e) => {
                            const newSched = [...schedule];
                            newSched[idx].active = e.target.checked;
                            setSchedule(newSched);
                        }} className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                        <span className={`font-medium ${day.active ? 'text-gray-800' : 'text-gray-400'}`}>{DAYS[idx]}</span>
                    </label>
                    
                    {day.active ? (
                        <div className="flex items-center space-x-3">
                            <input type="time" value={day.start_time} onChange={(e) => {
                                const newSched = [...schedule]; newSched[idx].start_time = e.target.value; setSchedule(newSched);
                            }} className="border p-2 rounded text-sm"/>
                            <span className="text-gray-500">-</span>
                            <input type="time" value={day.end_time} onChange={(e) => {
                                const newSched = [...schedule]; newSched[idx].end_time = e.target.value; setSchedule(newSched);
                            }} className="border p-2 rounded text-sm"/>
                        </div>
                    ) : <span className="text-gray-400 italic text-sm">Unavailable</span>}
                </div>
            ))}
            
            <button onClick={save} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">
                Save Changes
            </button>
        </div>
    );
}