import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-item-dialog',
  templateUrl: './add-item-dialog.component.html',
  styleUrls: ['./add-item-dialog.component.scss'],
  standalone: false
})
export class AddItemDialogComponent {
  itemForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddItemDialogComponent>
  ) {
    // Initialize the form with validators
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      width: [0, [Validators.required, Validators.min(1)]],
      height: [0, [Validators.required, Validators.min(1)]],
      depth: [0, [Validators.required, Validators.min(1)]],
      description: ['']
    });
  }

  onSubmit() {
    if (this.itemForm.valid) {
      // Close the dialog and pass the form value back to the parent
      this.dialogRef.close(this.itemForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}