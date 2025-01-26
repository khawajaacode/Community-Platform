import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { StudyGroup } from '../types';
import { supabase } from '../lib/supabase';

export function StudyGroups() {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = React.useState<StudyGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    async function fetchStudyGroups() {
      try {
        const { data, error } = await supabase
          .from('study_groups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStudyGroups(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred while fetching study groups');
      } finally {
        setLoading(false);
      }
    }

    fetchStudyGroups();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
          <p className="mt-2 text-gray-600">Connect with peers and study together</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Create Study Group
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
        ) : studyGroups.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No study groups found. Create one to get started!</p>
          </div>
        ) : (
          studyGroups.map((group) => (
            <div key={group.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{group.course_code}</p>
              <p className="text-gray-600 mt-2">{group.description}</p>
              <div className="mt-4">
                <button className="text-indigo-600 hover:text-indigo-800">
                  Join Group
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}