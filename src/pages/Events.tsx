import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Event } from '../types';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

export function Events() {
  const { user } = useAuth();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('end_date', new Date().toISOString())
          .order('start_date', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred while fetching events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="mt-2 text-gray-600">Discover and join campus events</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Create Event
        </button>
      </header>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No events found. Create one to get started!</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-lg shadow-md">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.type === 'academic' ? 'bg-blue-100 text-blue-800' :
                event.type === 'social' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {event.type}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">{event.title}</h3>
              <p className="text-gray-600 mt-2">{event.description}</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500">
                  {format(new Date(event.start_date), 'PPp')}
                </p>
                <p className="text-sm text-gray-500">{event.location}</p>
              </div>
              <button className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100">
                Join Event
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}