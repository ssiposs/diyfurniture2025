import { FurnituremodelService } from 'src/app/furnituremodel/furnituremodel.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { pairwise, switchMap, takeUntil } from 'rxjs/operators';
import * as THREE from 'three';
import { BoxGeometry } from 'three';
import { Body } from './../furnituremodel/furnituremodels';

@Component({
  selector: 'app-view3d',
  templateUrl: './view3d.component.html',
  styleUrls: ['./view3d.component.scss'],
  standalone: false,
})
export class View3DComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  _canvas!: ElementRef<HTMLCanvasElement>;

  @Input() public rotationS: number = 0.05;

  @Input() public cameraZ: number = 2000;
  @Input() public fieldOfView: number = 80;

  @Input() public texture: string = '/assets/atisan.jpg';

  // Scroll-wheel zoom configuration
  private minCameraZ: number = 50;
  private maxCameraZ: number = 4900;
  // Base for exponential zoom scaling; higher = faster zoom per wheel step
  private wheelZoomSpeed: number = 1.0015;

  private bodies: Body[] = [];
  private selectedBody: number = 0;

  private get canvas(): HTMLCanvasElement {
    return this._canvas.nativeElement;
  }

  constructor(private furniture: FurnituremodelService) {}

  private loader = new THREE.TextureLoader();
  private material = new THREE.MeshBasicMaterial({
    map: this.loader.load(this.texture),
  });

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  // For picking and door animation
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private doorPivots: Array<{
    mesh: THREE.Mesh;
    pivot: THREE.Group;
    isOpen: boolean;
    openAngle: number;
    targetAngle: number;
  }> = [];
  private clock: THREE.Clock = new THREE.Clock();

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.scale.set(1, 1, 1);

    const aspectRatio = this.getAspectRation();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      1,
      5000
    );
    this.camera.position.z = this.cameraZ;
  }

  private getAspectRation(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private animate(delta: number) {
    // Smoothly animate doors towards their target angles
    const responsiveness = 1.5; // slower door animation
    const alpha = 1 - Math.exp(-responsiveness * delta);
    for (const d of this.doorPivots) {
      d.pivot.rotation.y += (d.targetAngle - d.pivot.rotation.y) * alpha;
    }
  }

  private startRendering() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    const component: View3DComponent = this;
    (function render() {
      requestAnimationFrame(render);
      const delta = component.clock.getDelta();
      component.animate(delta);
      component.renderer.render(component.scene, component.camera);
    })();
  }

  ngAfterViewInit(): void {
    this.createScene();
    this.startRendering();
    this.captureEvents(this._canvas.nativeElement);
  }

  public captureEvents(canvasEl: HTMLCanvasElement): void {
    // Rotate the scene on mouse drag
    fromEvent(this.canvas, 'mousedown')
      .pipe(
        switchMap(() => {
          return fromEvent<MouseEvent>(this.canvas, 'mousemove').pipe(
            takeUntil(fromEvent(this.canvas, 'mouseup')),
            takeUntil(fromEvent(this.canvas, 'mouseleave')),
            pairwise()
          );
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = this.canvas.getBoundingClientRect();
        const x2 = res[0].clientX - rect.left;
        const y2 = res[0].clientY - rect.top;
        const x1 = res[1].clientX - rect.left;
        const y1 = res[1].clientY - rect.top;
        this.scene.rotation.y += (x2 - x1) / 10;
        this.scene.rotation.x += (y1 - y2) / 10;
        this.renderer.render(this.scene, this.camera);
      });

    // Double click to toggle doors open/close
    fromEvent<MouseEvent>(this.canvas, 'dblclick').subscribe((e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.doorPivots.map((d) => d.mesh),
        false
      );
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const door = this.doorPivots.find((d) => d.mesh === hit);
        if (door) {
          door.isOpen = !door.isOpen;
          door.targetAngle = door.isOpen ? door.openAngle : 0;
        }
      }
    });

    // Scroll wheel zoom
    fromEvent<WheelEvent>(this.canvas, 'wheel', { passive: false }).subscribe(
      (e: WheelEvent) => {
        e.preventDefault();
        const factor = Math.pow(this.wheelZoomSpeed, e.deltaY);
        this.camera.position.z = THREE.MathUtils.clamp(
          this.camera.position.z * factor,
          this.minCameraZ,
          this.maxCameraZ
        );
        this.renderer.render(this.scene, this.camera);
      }
    );

    // Load and update model
    this.furniture.getFurnitureBody().subscribe((bodies) => {
      if (bodies.length < 1) return;
      this.bodies = bodies;
      const body = bodies[this.selectedBody];

      // Clear scene and door state
      for (let i = this.scene.children.length - 1; i >= 0; i--) {
        const obj = this.scene.children[i];
        this.scene.remove(obj);
      }
      this.doorPivots = [];
      this.drawBody(body);
    });

    this.furniture.getSelectedFurniture$().subscribe((id) => {
      if (typeof id === 'number') {
        this.selectedBody = id as number;
        const selectedElem = this.bodies.find(
          (el) => el.id == this.selectedBody
        );
        if (selectedElem == null) return;

        for (let i = this.scene.children.length - 1; i >= 0; i--) {
          const obj = this.scene.children[i];
          this.scene.remove(obj);
        }
        this.doorPivots = [];
        this.drawBody(selectedElem);
      }
    });
  }

  ngOnInit(): void {}

  private drawBody(body: Body) {
    const thickness = body.thickness;
    const bodyDepth = body.deepth;

    // Carcass
    const geometryBottom = new BoxGeometry(body.width, thickness, bodyDepth);
    const bottom: THREE.Mesh = new THREE.Mesh(geometryBottom, this.material);
    bottom.position.add(
      new THREE.Vector3(0, -(body.height - thickness) / 2, 0)
    );
    this.scene.add(bottom);

    const geometryTop = new BoxGeometry(body.width, thickness, bodyDepth);
    const top: THREE.Mesh = new THREE.Mesh(geometryTop, this.material);
    top.position.add(
      new THREE.Vector3(0, (body.height - thickness) / 2, 0)
    );
    this.scene.add(top);

    const geometryLeft = new BoxGeometry(
      thickness,
      body.height - 2 * thickness,
      bodyDepth
    );
    const left: THREE.Mesh = new THREE.Mesh(geometryLeft, this.material);
    left.position.add(
      new THREE.Vector3(-(body.width - thickness) / 2, 0, 0)
    );
    this.scene.add(left);

    const geometryRight = new BoxGeometry(
      thickness,
      body.height - 2 * thickness,
      bodyDepth
    );
    const right: THREE.Mesh = new THREE.Mesh(geometryRight, this.material);
    right.position.add(
      new THREE.Vector3((body.width - thickness) / 2, 0, 0)
    );
    this.scene.add(right);

    const backMaterial = new THREE.MeshBasicMaterial({ color: 0xd2d2d2 });
    const geometryBack = new BoxGeometry(body.width, body.height, 4);
    const back: THREE.Mesh = new THREE.Mesh(geometryBack, backMaterial);
    back.position.add(new THREE.Vector3(0, 0, -bodyDepth / 2));
    this.scene.add(back);

    // Front elements as doors (hinged)
    for (const element of body.frontElements) {
      const doorGeom = new BoxGeometry(element.width, element.height, thickness);
      const doorMesh: THREE.Mesh = new THREE.Mesh(doorGeom, this.material);

      // Compute door center in world (scene) space based on existing placement
      const centerX =
        -body.width / 2 + element.width / 2 + element.x;
      const centerY =
        -body.height / 2 + element.height / 2 + element.y;
      const frontZ = bodyDepth / 2; // hinge axis at carcass front plane to avoid intersection

      // Determine hinge side by position: left of center => left door, else right
      const hingeLeft = centerX < 0;

      const pivot = new THREE.Group();
      const maxOpen = THREE.MathUtils.degToRad(100); // realistic ~100° door opening
      let openAngle = hingeLeft ? -maxOpen : maxOpen;

      if (hingeLeft) {
        // Hinge at left edge of the door
        pivot.position.set(centerX - element.width / 2, centerY, frontZ + 0.1);
        doorMesh.position.set(element.width / 2, 0, thickness / 2);
      } else {
        // Hinge at right edge of the door
        pivot.position.set(centerX + element.width / 2, centerY, frontZ + 0.1);
        doorMesh.position.set(-element.width / 2, 0, thickness / 2);
      }

      pivot.add(doorMesh);
      this.scene.add(pivot);

      this.doorPivots.push({
        mesh: doorMesh,
        pivot,
        isOpen: false,
        openAngle,
        targetAngle: 0,
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}
