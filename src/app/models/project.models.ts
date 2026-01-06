export interface CreateProjectDto {
    name: string;
    width: number;
    height: number;
    depth: number;
    description?: string;
  }
  
  export interface ProjectItem extends CreateProjectDto {
    id: number;
  }