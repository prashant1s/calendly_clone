import React, { useState, useEffect } from 'react';
import API from '../api';
import { format, isBefore } from 'date-fns';

export default function Meetings() {
    const [meetings, setMeetings] = useState([]);
    const [filter, setFilter] = useState('upcoming'); // 'upcoming' or 'past'

    const fetchMeetings = async () => {
        const { data } = await API.get('/meetings');
        return data;
    };

    useEffect(() => { 
        fetchMeetings().then(data => setMeetings(data)); 
    }, []);

    const handleCancel = async (id) => {
        if(window.confirm('Cancel this meeting?')) {
            await API.put(`/meetings/${id}/cancel`);
            fetchMeetings().then(data => setMeetings(data));
        }
    };

    // Filter logic
    const now = new Date();
    const filteredMeetings = meetings.filter(m => {
        const isPast = isBefore(new Date(m.start_time), now);
        return filter === 'upcoming' ? !isPast : isPast;
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Scheduled Events</h2>
                
                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-md">
                    <button onClick={() => setFilter('upcoming')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'upcoming' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                        Upcoming
                    </button>
                    <button onClick={() => setFilter('past')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'past' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                        Past
                    </button>
                </div>
            </div>
            
            <div className="divide-y divide-gray-100">
                {filteredMeetings.map(m => (
                    <div key={m.id} className="p-6 flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-3 mb-1">
                                <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {m.status}
                                </span>
                                <span className="font-semibold text-gray-800">{format(new Date(m.start_time), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <p className="text-gray-600">{format(new Date(m.start_time), 'h:mm a')} - {format(new Date(m.end_time), 'h:mm a')}</p>
                            <p className="text-gray-800 font-medium mt-2">{m.invitee_name} <span className="text-gray-400 font-normal">({m.invitee_email})</span></p>
                            <p className="text-sm text-gray-500">Event: {m.event_title}</p>
                        </div>
                        {m.status === 'active' && filter === 'upcoming' && (
                            <button onClick={() => handleCancel(m.id)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm font-medium hover:border-gray-500 transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>
                ))}
                {filteredMeetings.length === 0 && (
                    <p className="p-8 text-center text-gray-500">No {filter} meetings found.</p>
                )}
            </div>
        </div>
    );
}