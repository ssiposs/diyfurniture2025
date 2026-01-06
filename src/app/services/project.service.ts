import { Injectable } from '@angular/core';
import axios from 'axios';
import { CreateProjectDto, ProjectItem } from '../models/project.models';
import { API_ENDPOINTS, API_URL } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root' // This makes the service available everywhere
})
export class ProjectService {
  // In a real app, this URL usually comes from environment.ts

  constructor() { }

  /**
   * Sends a POST request to create a new project item.
   * Returns a Promise because Axios is Promise-based.
   */
  async createProject(item: CreateProjectDto): Promise<ProjectItem> {
    try {
      const url = API_URL + API_ENDPOINTS.PROJECTS.BASE;
      const response = await axios.post<ProjectItem>(url, item);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error; // Rethrow to handle it in the component
    }
  }
}