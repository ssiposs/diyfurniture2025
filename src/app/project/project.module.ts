import { FurnituremodelModule } from "../furnituremodel/furnituremodel.module";
import { ProjectComponent } from "./project.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../material.module";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";

@NgModule({
  declarations: [ProjectComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FurnituremodelModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  exports: [ProjectComponent],
})
export class ProjectModule {}
