import { Component, Input, OnInit } from '@angular/core';
import { PositionHOptions, PositionVOptions } from "../position-options";

interface ParsedMaterial {
  url: string
  name: string
  isImage: boolean
}

@Component({
  selector: 'test-help-materials',
  templateUrl: './test-help-materials.component.html',
  styleUrls: ['./test-help-materials.component.css']
})
export class TestHelpMaterialsComponent implements OnInit {

  static imageExtentions = new Set<string>(["bmp", "gif", "jpg", "jpeg", "png", "psd", "pspimage", "tga", "thm", "tif", "tiff", "yuv", "ai", "eps", "ps", "svg", "dds", "raw", "cr2", "nef", "orf", "sr2"]);

  @Input() materials: string[];

  @Input() positionH: PositionHOptions;
  @Input() positionV: PositionVOptions;
  @Input() altText: string;

  parsedMaterials: ParsedMaterial[];

  isOnly1Material: boolean;

  previewImageUrl: string;

  constructor() { }

  ngOnInit() {
    this.parsedMaterials = this.materials.map(this.parseMaterial).filter(pm => pm !== null);
    this.isOnly1Material = this.parsedMaterials.length === 1;

    if(!this.positionH) this.positionH = 'right';
    if(!this.positionV) this.positionV = 'top';
  }

  showPreview(imageUrl: string) {
    this.previewImageUrl = imageUrl
  }

  hidePreview() {
    this.previewImageUrl = undefined;
  }

  private parseMaterial(material: string): ParsedMaterial {
    if (!material) {
      return null;
    }
    const nameWithExtention = material.split("/").pop() || "";
    const nameParts = nameWithExtention.split(".");
    const name = nameParts.shift();
    const extension = nameParts.shift();
    let isImage: boolean = extension ? TestHelpMaterialsComponent.imageExtentions.has(extension) : false;
    return {
      url: material,
      name: name,
      isImage: isImage
    }
  }

}
