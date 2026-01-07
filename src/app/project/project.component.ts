import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { PageEvent } from "@angular/material/paginator";
import {
  Project,
  ProjectService,
  PagedResponse,
} from "../services/project.service";

import { MatDialog } from "@angular/material/dialog";
import { AddItemDialogComponent } from "./add-item-dialog/add-item-dialog.component";

import { BomService } from "../services/bom.service";
import { FurnituremodelService } from "../furnituremodel/furnituremodel.service";
import { EditProjectDialogComponent } from "./edit-item-dialog/edit-item-dialog.component";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"],
  standalone: false,
})
export class ProjectComponent implements OnInit, OnDestroy {
  // State
  loading = false;
  isSaving = false;
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

  constructor(
    private furniture: FurnituremodelService,
    private bom: BomService,
    private dialog: MatDialog,
    private projectService: ProjectService
  ) {}

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
          console.log("Full response:", response);
          console.log("totalElements:", response.totalElements);

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
    console.log("Page event:", event);
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
          this.loadProjects();
          alert(`Project "${item.name}" has been archived.`);
        },
        error: (err) => {
          console.error("Failed to archive project:", err);
          alert("Failed to archive project. Please try again.");
        },
      });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: "600px",
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource = [result, ...this.dataSource];
      }
    });
  }

  openEditDialog(item: Project): void {
    const dialogRef = this.dialog.open(EditProjectDialogComponent, {
      width: '800px', // Wider to accommodate the version table
      data: { project: item },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the list to show updated name/description
        this.loadProjects(); 
        // If the detail view was open, update the selected item too
        if (this.selectedItem?.id === result.id) {
          this.selectedItem = result;
        }
      }
    });
  }
}