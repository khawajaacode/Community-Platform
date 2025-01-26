import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { StudyGroup, Event, Resource } from '../types';
import { format } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = React.useState<StudyGroup[]>([]);
  const [events, setEvents] = React.useState<Event[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [studyGroupsResponse, eventsResponse, resourcesResponse] = await Promise.all([
          supabase
            .from('study_groups')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('events')
            .select('*')
            .gte('end_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(3),
          supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3)
        ]);

        if (studyGroupsResponse.error) throw studyGroupsResponse.error;
        if (eventsResponse.error) throw eventsResponse.error;
        if (resourcesResponse.error) throw resourcesResponse.error;

        setStudyGroups(studyGroupsResponse.data || []);
        setEvents(eventsResponse.data || []);
        setResources(resourcesResponse.data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred while fetching dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
        <p className="mt-2 text-gray-600">Here's what's happening in your academic community</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Study Groups Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Study Groups</h2>
          {studyGroups.length > 0 ? (
            <div className="space-y-4">
              {studyGroups.map(group => (
                <div key={group.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h3 className="font-medium text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.course_code}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Join or create study groups for your courses</p>
          )}
          <button 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            onClick={() => window.location.href = '/study-groups'}
          >
            View Study Groups
          </button>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(event.start_date), 'PPp')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Stay updated with academic and social events</p>
          )}
          <button 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            onClick={() => window.location.href = '/events'}
          >
            View Events
          </button>
        </div>

        {/* Resources */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Resources</h2>
          {resources.length > 0 ? (
            <div className="space-y-4">
              {resources.map(resource => (
                <div key={resource.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h3 className="font-medium text-gray-900">{resource.title}</h3>
                  <p className="text-sm text-gray-500">{resource.course_code}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Access shared academic materials and resources</p>
          )}
          <button 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            onClick={() => window.location.href = '/resources'}
          >
            View Resources
          </button>
        </div>
      </div>
    </div>
  );
}