import { FurnituremodelModule } from "../furnituremodel/furnituremodel.module";
import { ProjectComponent } from "./project.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../material.module";

@NgModule({
  declarations: [ProjectComponent],
  imports: [CommonModule, MaterialModule, FurnituremodelModule],
  exports: [ProjectComponent],
})
export class ProjectModule {}
