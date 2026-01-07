export interface CreateProjectDto {
    name: string;
    description?: string;
  }
  
  export interface ProjectItem extends CreateProjectDto {
    id: number;
  }

export interface UpdateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectResponse {
  id: number;
  name: string;
  description: string;
  updatedAt: string;
}

export interface ProjectVersionResponse {
  id: number;
  versionNumber: number;
  savedAt: string;
  versionNote: string;
  name: string;
  description: string;
}