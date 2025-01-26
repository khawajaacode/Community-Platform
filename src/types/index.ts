export interface User {
  id: string;
  email: string;
  full_name: string;
  university: string;
  major: string;
  graduation_year: number;
  interests: string[];
  avatar_url?: string;
  created_at: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  course_code: string;
  description: string;
  created_by: string;
  members: string[];
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  organizer_id: string;
  type: 'academic' | 'social' | 'career';
  max_participants?: number;
  participants: string[];
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  uploaded_by: string;
  course_code: string;
  type: 'document' | 'link' | 'video';
  created_at: string;
}