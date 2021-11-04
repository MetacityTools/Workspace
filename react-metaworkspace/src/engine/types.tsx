import { Vector2, Vector3 } from "three";


export type IBBox = [[number, number, number], [number, number, number]];
export type IVecBBox = [Vector3, Vector3];
export type IBRect = [[number, number], [number, number]];

export type NumToStr = { [id: number]: string };
export type StrToNum = { [ois: string]: number };

export interface ITile {
    box: IBBox,
    x: number,
    y: number,
    file: string
}

export interface ILayout {
    tile_size: number,
    tiles: ITile[]
}

export interface ILayerBaseData {
    layout: ILayout,
    name: string,
    init: boolean,  
}

export interface ILayerData extends ILayerBaseData {
    size: number
}

export interface IOverlayData extends ILayerBaseData {
    source: string,
    target: string
}

export interface ILayer {
    name: string,
    project: string,
    focus(point: Vector2): void,
}

export interface IOverlay extends ILayer{
    source: string,
    target: string
}

export interface IAttribute {
    data: string,
    type: string,
}

export interface IModel {
    attributes: {[name: string]: IAttribute};
    tags: {[name: string]: any},
    type: string,
    vertices: string
}