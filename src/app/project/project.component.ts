import { Component, OnInit } from "@angular/core";
import { Body } from "../furnituremodel/furnituremodels";
import { FurnituremodelService } from "../furnituremodel/furnituremodel.service";
import {
  BomItem,
  BomService,
  FurnitureBackendItem,
} from "../services/bom.service";

import { MatDialog } from '@angular/material/dialog';
import { AddItemDialogComponent } from './add-item-dialog/add-item-dialog.component';
import { ProjectService } from "../services/project.service";
import { CreateProjectDto } from "../models/project.models";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"],
  standalone: false,
})
export class ProjectComponent implements OnInit {
  private bodies: Body[] = [];
  private selectedBody: number = 0;

  loading = false;
  isSaving = false;

  error = "";
  animatedView = true; // Toggle az animált nézethez
  selectedItem: any = null; // A kiválasztott item a detail view-hoz
  showDetail = false; // Detail view megjelenítése

  constructor(
    private furniture: FurnituremodelService,
    private bom: BomService,
    private dialog: MatDialog,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  // Változás: mostantól csak egy oszlop van
  public displayedColumns: string[] = ["row"];
  public dataSource: any[] = [];

  ngOnInit() {
    this.loading = true;

    this.bom.getMockBomForProject().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Something went wrong when fetching data.";
        this.loading = false;
      },
    });
  }

  toggleView() {
    this.animatedView = !this.animatedView;
  }

  openItem(item: any) {
    console.log("open:", item);
    this.selectedItem = item;
    this.showDetail = true;
  }

  closeDetail() {
    this.showDetail = false;
    this.selectedItem = null;
  }

  archiveItem(item: any) {
    console.log("archive:", item);
    alert(`Archiving item ${item.id}`);
  }

  retry() {
    this.error = "";
    this.loading = true;
    this.ngOnInit(); // újratölti az adatokat
  }

  private loadBomForSelected(): void {
    this.bom.getBomForProject().subscribe((items) => {
      this.dataSource = items;
    });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '600px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      // If we get a result, it means the API call was ALREADY successful
      if (result) {
        this.dataSource = [result, ...this.dataSource];
      }
    });
  }


  async deleteItem(item: any) {
    // 1. Confirm with the user
    if (confirm(`Are you sure you want to delete item "${item.name || item.id}"?`)) {
      
      try {
        // 2. Call the backend
        await this.projectService.deleteProject(item.id);

        // 3. On Success: Update the UI (Remove from table)
        this.dataSource = this.dataSource.filter((i) => i.id !== item.id);

        // 4. Close the detail view if the deleted item was currently open
        if (this.selectedItem?.id === item.id) {
          this.closeDetail();
        }

        // 5. Show Success Feedback
        this.snackBar.open('Project deleted successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

      } catch (error) {
        // 6. Handle Error
        this.snackBar.open('Failed to delete project. Please try again.', 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar'], // Ensure you have styles for this or remove panelClass
        });
      }
    }
  }
}
