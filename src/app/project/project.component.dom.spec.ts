import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { ProjectComponent } from "./project.component";
import { BomService } from "../services/bom.service";
import { LocalStorageService } from "ngx-webstorage";
import { of } from "rxjs";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

fdescribe("ProjectComponent - DOM Tests", () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let bomServiceMock: any;
  let localStorageMock: any;

  console.log("DOM Tests suite loaded");
  beforeEach(async () => {
    console.log("DOM Tests beforeEach started");
    bomServiceMock = {
      getMockBomForProject: jasmine.createSpy("getMockBomForProject"),
    };
    localStorageMock = {
      retrieve: jasmine.createSpy(),
      store: jasmine.createSpy(),
      clear: jasmine.createSpy(),
    };

    await TestBed.configureTestingModule({
      declarations: [ProjectComponent],
      providers: [
        { provide: BomService, useValue: bomServiceMock },
        { provide: LocalStorageService, useValue: localStorageMock },
      ],
      imports: [
        MatTableModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
  });

  it("renders table rows when data loads", fakeAsync(() => {
    const mockData = [
      { id: 1, name: "A", width: 10, height: 20, depth: 30 },
      { id: 2, name: "B", width: 5, height: 10, depth: 15 },
      { id: 3, name: "C", width: 2, height: 4, depth: 6 },
    ];

    bomServiceMock.getMockBomForProject.and.returnValue(of(mockData));

    component.ngOnInit(); // service meghívása
    tick(); // Observable “lép”
    fixture.detectChanges(); // DOM frissítés

    const rows = fixture.nativeElement.querySelectorAll("tr[mat-row]");
    expect(rows.length).toBe(mockData.length);
  }));

  it("shows error message when service fails", fakeAsync(() => {
    bomServiceMock.getMockBomForProject.and.returnValue(of([]));
    component.error = "Something went wrong";
    fixture.detectChanges();

    const errorDiv = fixture.nativeElement.querySelector(".info-box.error");
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toContain("Something went wrong");
  }));
});

console.log("=== DOM TEST FILE LOADED ===");
