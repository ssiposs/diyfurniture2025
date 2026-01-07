import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry, map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { CreateProjectDto, ProjectItem, ProjectVersionResponse, UpdateProjectRequest, UpdateProjectResponse } from "../models/project.models";

export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Paginated response interface
export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  private readonly baseUrl = `${environment.apiBase}/projects`;

  constructor(private http: HttpClient) {}

  // POST /projects - Create new project (HttpClient verzió)
  createProject(item: CreateProjectDto): Observable<Project> {
    return this.http
      .post<Project>(this.baseUrl, item)
      .pipe(catchError(this.handleError));
  }

  // GET /projects - csak a content tömböt adja vissza
  getProjects(): Observable<Project[]> {
    console.log("Fetching from:", this.baseUrl);

    return this.http.get<PagedResponse<Project>>(this.baseUrl).pipe(
      map((response) => {
        console.log("Raw response:", response);
        return response.content;
      }),
      retry(1),
      catchError(this.handleError)
    );
  }

  // GET /projects (paginated) - teljes paginated response
  getProjectsPaged(
    page: number = 0,
    size: number = 10
  ): Observable<PagedResponse<Project>> {
    return this.http
      .get<PagedResponse<Project>>(`${this.baseUrl}?page=${page}&size=${size}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // GET /projects/:id
  getProject(id: number): Observable<Project> {
    return this.http
      .get<Project>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // PUT /projects/:id
  updateProject(id: number, request: UpdateProjectRequest): Observable<UpdateProjectResponse> {
    return this.http
      .put<UpdateProjectResponse>(`${this.baseUrl}/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  // GET /projects/:id/versions
  getProjectVersions(id: number): Observable<ProjectVersionResponse[]> {
    return this.http
      .get<ProjectVersionResponse[]>(`${this.baseUrl}/${id}/versions`)
      .pipe(catchError(this.handleError));
  }

  // POST /projects/:id/versions/:versionId/restore
  restoreVersion(projectId: number, versionId: number): Observable<Project> {
    // This matches the standard REST pattern for restore
    return this.http.post<Project>(`${this.baseUrl}/${projectId}/versions/${versionId}/restore`, {});
  }

  // DELETE /projects/:id
  deleteProject(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // POST /projects/:id/archive
  archiveProject(id: number): Observable<Project> {
    return this.http
      .post<Project>(`${this.baseUrl}/${id}/archive`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error("API Error:", error);
    return throwError(() => error);
  }

  // Mock verzió teszteléshez
  getMockProjects(): Observable<Project[]> {
    const shouldFail = Math.random() < 0.3;

    return new Observable((observer) => {
      setTimeout(() => {
        if (shouldFail) {
          observer.error(new Error("Network error: failed to fetch projects"));
          return;
        }

        observer.next([
          { id: 1, name: "Living Room Set", description: "Modern furniture collection" },
          { id: 2, name: "Office Desk", description: "Ergonomic workspace" },
          { id: 3, name: "Kitchen Cabinet", description: "Storage solution" },
          { id: 4, name: "Bedroom Wardrobe", description: "Spacious closet" },
          { id: 5, name: "Bookshelf", description: "Wall-mounted shelving" },
          { id: 6, name: "Dining Table", description: "Extendable table for 6-8" },
          { id: 7, name: "TV Stand", description: "Entertainment center" },
          { id: 8, name: "Shoe Rack", description: "Entryway organizer" },
        ]);
        observer.complete();
      }, 800);
    });
  }
}