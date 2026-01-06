import { FurnituremodelModule } from "../furnituremodel/furnituremodel.module";
import { ProjectComponent } from "./project.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../material.module";
import { ReactiveFormsModule } from "@angular/forms";
import { AddItemDialogComponent } from "./add-item-dialog/add-item-dialog.component";

@NgModule({
  declarations: [ProjectComponent, AddItemDialogComponent],
  imports: [CommonModule, MaterialModule, FurnituremodelModule, ReactiveFormsModule],
  exports: [ProjectComponent],
})
export class ProjectModule {}
