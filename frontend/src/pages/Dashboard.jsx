import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { Clock, Link as LinkIcon, Trash, Pencil, Plus } from 'lucide-react';

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, title: '', duration: 15, slug: '' });

    const fetchEvents = async () => {
        const { data } = await API.get('/event-types');
        return data;
    };

    useEffect(() => { 
        fetchEvents().then(data => setEvents(data));
    }, []);

    const handleDelete = async (id) => {
        if(window.confirm('Delete this event?')) {
            await API.delete(`/event-types/${id}`);
            fetchEvents().then(data => setEvents(data));
        }
    }

    const openNewModal = () => {
        setFormData({ id: null, title: '', duration: 15, slug: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (ev) => {
        setFormData({ id: ev.id, title: ev.title, duration: ev.duration, slug: ev.slug });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) await API.put(`/event-types/${formData.id}`, formData);
            else await API.post('/event-types', formData);
            
            setIsModalOpen(false);
            fetchEvents().then(data => setEvents(data));
        } catch (error) {
            console.log(error);
            const apiMessage = error?.response?.data?.error;
            alert(apiMessage || 'Error saving event. Please try again.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-light text-gray-800">My Link</h2>
                <button onClick={openNewModal} className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-colors">
                    <Plus size={18} className="mr-2" /> New Event Type
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.map(ev => (
                    <div key={ev.id} className="bg-white border-t-4 border-blue-500 rounded-lg shadow-sm p-5 flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{ev.title}</h3>
                        <p className="text-gray-500 flex items-center mb-6">
                            <Clock size={16} className="mr-2"/> {ev.duration} mins
                        </p>
                        
                        <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                            <Link to={`/book/${ev.slug}`} target="_blank" className="text-blue-600 flex items-center text-sm font-medium hover:underline">
                                <LinkIcon size={14} className="mr-1" /> View Booking Page
                            </Link>
                            <div className="flex space-x-3">
                                <button onClick={() => openEditModal(ev)} className="text-gray-400 hover:text-blue-600 transition-colors">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDelete(ev.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                    <Trash size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">
                                {formData.id ? 'Edit Event Type' : 'Add Event Type'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                <input required type="number" min="1" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">/book/</span>
                                    <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700">Save Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}