import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProjectComponent } from "./project.component";
import { BomService } from "../services/bom.service";
import { LocalStorageService } from "ngx-webstorage";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { of, throwError } from "rxjs";

fdescribe("ProjectComponent - Unit Tests", () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let bomServiceMock: any;
  let localStorageMock: any;

  beforeEach(async () => {
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
      schemas: [NO_ERRORS_SCHEMA], // unit tesztnél nem érdekel a DOM
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
  });

  it("toggleView switches animatedView", () => {
    const initial = component.animatedView;
    component.toggleView();
    expect(component.animatedView).toBe(!initial);
  });

  it("openItem sets detail state", () => {
    const item = { id: 5 };
    component.openItem(item);
    expect(component.selectedItem).toBe(item);
    expect(component.showDetail).toBe(true);
  });

  it("closeDetail clears detail state", () => {
    component.selectedItem = { id: 1 };
    component.showDetail = true;
    component.closeDetail();
    expect(component.selectedItem).toBe(null);
    expect(component.showDetail).toBe(false);
  });

  it("deleteItem removes item", () => {
    spyOn(window, "confirm").and.returnValue(true);
    component.dataSource = [{ id: 1 }, { id: 2 }];
    component.deleteItem({ id: 1 });
    expect(component.dataSource).toEqual([{ id: 2 }]);
  });

  it("retry resets error and reloads", () => {
    const spy = spyOn(component, "ngOnInit");
    component.error = "x";
    component.retry();
    expect(component.error).toBe("");
    expect(component.loading).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it("handles service success", () => {
    const mockData = [{ id: 1 }];
    bomServiceMock.getMockBomForProject.and.returnValue(of(mockData));
    component.ngOnInit();
    expect(component.dataSource).toEqual(mockData);
    expect(component.loading).toBe(false);
  });

  it("handles service error", () => {
    bomServiceMock.getMockBomForProject.and.returnValue(
      throwError(() => new Error("fail"))
    );
    component.ngOnInit();
    expect(component.dataSource.length).toBe(0);
    expect(component.error).toBe("Something went wrong when fetching data.");
  });
});
