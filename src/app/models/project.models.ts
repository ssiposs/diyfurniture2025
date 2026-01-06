export interface CreateProjectDto {
    name: string;
    description?: string;
  }
  
  export interface ProjectItem extends CreateProjectDto {
    id: number;
  }