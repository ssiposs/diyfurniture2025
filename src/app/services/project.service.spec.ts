import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';
import axios from 'axios'; // Import axios to spy on it
import { CreateProjectDto } from '../models/project.models';
import { API_ENDPOINTS, API_URL } from '../constants/api-endpoints';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // 1. Import this

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // 2. Add to imports to satisfy the constructor
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createProject should post to correct URL and return data on success', async () => {
    // 1. Arrange (Prepare data)
    const mockInput: CreateProjectDto = { 
      name: 'Test Project', 
      description: 'A project for testing',
    };
    
    const mockBackendResponse = { 
      id: 1, 
      ...mockInput 
    };

    // We spy on 'post' and make it return a fake Promise immediately
    const axiosSpy = spyOn(axios, 'post').and.returnValue(
      Promise.resolve({ data: mockBackendResponse })
    );

    // 2. Act (Call the method)
    const result = await service.createProject(mockInput);

    // 3. Assert (Check results)
    const expectedUrl = API_URL + API_ENDPOINTS.PROJECTS.BASE;
    expect(axiosSpy).toHaveBeenCalledWith(expectedUrl, mockInput);
    expect(result).toEqual(mockBackendResponse);
  });

  it('createProject should rethrow error when API fails', async () => {
    // 1. Arrange
    const mockInput: CreateProjectDto = { name: 'Fail', description: 'This will fail' };
    const mockError = new Error('Network Error');

    // Make axios fail
    spyOn(axios, 'post').and.returnValue(Promise.reject(mockError));

    // 2. Act & Assert
    // We expect the promise to be rejected
    await expectAsync(service.createProject(mockInput)).toBeRejectedWith(mockError);
  });

  it('deleteProject should send delete request to correct URL', async () => {
    // 1. Arrange
    const projectId = 123;
    const expectedUrl = `${API_URL}${API_ENDPOINTS.PROJECTS.BASE}/${projectId}`;

    // Spy on axios.delete and return a resolved Promise (void)
    const axiosSpy = spyOn(axios, 'delete').and.returnValue(Promise.resolve({ data: {} }));

    // 2. Act
    await service.deleteProject(projectId);

    // 3. Assert
    expect(axiosSpy).toHaveBeenCalledWith(expectedUrl);
  });

  it('deleteProject should rethrow error when API fails', async () => {
    // 1. Arrange
    const projectId = 456;
    const mockError = new Error('Deletion failed');

    // Spy on axios.delete and return a rejected Promise
    spyOn(axios, 'delete').and.returnValue(Promise.reject(mockError));

    // 2. Act & Assert
    await expectAsync(service.deleteProject(projectId)).toBeRejectedWith(mockError);
  });
});