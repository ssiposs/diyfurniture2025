import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { PageEvent } from "@angular/material/paginator";
import {
  Project,
  ProjectService,
  PagedResponse,
} from "../services/project.service";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"],
  standalone: false,
})
export class ProjectComponent implements OnInit, OnDestroy {
  // State
  loading = false;
  error = "";
  animatedView = true;

  // Detail view
  selectedItem: Project | null = null;
  showDetail = false;

  // Table
  displayedColumns: string[] = ["row"];
  dataSource: Project[] = [];

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 25, 50];

  private destroy$ = new Subject<void>();

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = "";

    this.projectService
      .getProjectsPaged(this.currentPage, this.pageSize)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (response: PagedResponse<Project>) => {
          console.log("Full response:", response); // <-- ADD
          console.log("totalElements:", response.totalElements); // <-- ADD

          this.dataSource = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.currentPage = response.number;
        },
        error: (err) => {
          console.error("Failed to load projects:", err);
          this.error = "Something went wrong when fetching projects.";
        },
      });
  }

  onPageChange(event: PageEvent): void {
    console.log("Page event:", event); // Debug
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProjects();
  }

  retry(): void {
    this.loadProjects();
  }

  toggleView(): void {
    this.animatedView = !this.animatedView;
  }

  openItem(item: Project): void {
    console.log("open:", item);
    this.selectedItem = item;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedItem = null;
  }

  deleteItem(item: Project): void {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    this.projectService
      .deleteProject(item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Reload current page after deletion
          // If current page becomes empty, go to previous page
          if (this.dataSource.length === 1 && this.currentPage > 0) {
            this.currentPage--;
          }
          this.loadProjects();

          if (this.selectedItem?.id === item.id) {
            this.closeDetail();
          }
        },
        error: (err) => {
          console.error("Failed to delete project:", err);
          alert("Failed to delete project. Please try again.");
        },
      });
  }

  archiveItem(item: Project): void {
    console.log("archive:", item);

    this.projectService
      .archiveProject(item.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadProjects(); // Reload to reflect changes
          alert(`Project "${item.name}" has been archived.`);
        },
        error: (err) => {
          console.error("Failed to archive project:", err);
          alert("Failed to archive project. Please try again.");
        },
      });
  }
}
