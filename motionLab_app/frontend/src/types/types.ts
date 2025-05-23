export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  token?: string;
  is_email_verified: boolean;
}

export interface Project {
  id: string;
  name: string;
  is_processing: boolean;
  creation_date: string;
}

export interface Avatar {
  id: string;
  name: string;
  creation_date: string;
  filename: string;
  user_id?: string;
}

export interface ProjectSettings {
  projectName: string;
  xSensitivity: number;
  ySensitivity: number;
  stationary: boolean;
}