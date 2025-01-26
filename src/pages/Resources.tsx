import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Resource } from '../types';
import { supabase } from '../lib/supabase';

export function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setResources(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred while fetching resources');
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <p className="mt-2 text-gray-600">Access and share academic materials</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Upload Resource
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
        ) : resources.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No resources found. Upload one to get started!</p>
          </div>
        ) : (
          resources.map((resource) => (
            <div key={resource.id} className="bg-white p-6 rounded-lg shadow-md">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                resource.type === 'document' ? 'bg-blue-100 text-blue-800' :
                resource.type === 'link' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {resource.type}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">{resource.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{resource.course_code}</p>
              <p className="text-gray-600 mt-2">{resource.description}</p>
              <a 
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
              >
                View Resource
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}