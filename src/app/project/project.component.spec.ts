import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ProjectComponent } from "./project.component";
import { BomService } from "../services/bom.service";
import { LocalStorageService } from "ngx-webstorage";

describe("ProjectComponent", () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let bomServiceMock: any;

  beforeEach(async () => {
    bomServiceMock = {
      getMockBomForProject: jasmine.createSpy("getMockBomForProject"),
    };

    const localStorageMock = {
      retrieve: jasmine.createSpy("retrieve"),
      store: jasmine.createSpy("store"),
      clear: jasmine.createSpy("clear"),
    };

    await TestBed.configureTestingModule({
      declarations: [ProjectComponent],
      providers: [
        { provide: BomService, useValue: bomServiceMock },
        { provide: LocalStorageService, useValue: localStorageMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
  });

  it("loads data successfully on init", () => {
    const mockData = [{ id: 1, width: 10, height: 20, depth: 30 }];
    bomServiceMock.getMockBomForProject.mockReturnValue(of(mockData));

    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe("");
    expect(component.dataSource).toEqual(mockData);
  });

  it("shows error message when service fails", () => {
    bomServiceMock.getMockBomForProject.mockReturnValue(
      throwError(() => new Error("fail"))
    );

    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe("Something went wrong when fetching data.");
    expect(component.dataSource.length).toBe(0);
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
});
