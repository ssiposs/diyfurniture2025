import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'; // Import SnackBar
import { ProjectService } from '../../services/project.service'; // Import Service

@Component({
  selector: 'app-add-item-dialog',
  templateUrl: './add-item-dialog.component.html',
  styleUrls: ['./add-item-dialog.component.scss'],
  standalone: false
})
export class AddItemDialogComponent {
  itemForm: FormGroup;
  isSaving = false; // To disable button while saving
  errorMessage = ''; // To show error inside modal

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddItemDialogComponent>,
    private projectService: ProjectService, // Inject Service
    private snackBar: MatSnackBar // Inject Toast Service
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  async onSubmit() {
    if (this.itemForm.invalid) return;

    this.isSaving = true;
    this.errorMessage = '';

    try {
      // 1. Call the API
      const newItem = await this.projectService.createProject(this.itemForm.value);

      // 2. Show Success Toast
      this.snackBar.open('Project created successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'] // You can style this in global css
      });

      // 3. Close the dialog and pass the new item back
      this.dialogRef.close(newItem);

    } catch (error) {
      // 4. Handle Error: Keep dialog open, show message
      console.error(error);
      this.errorMessage = 'Failed to create project. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}