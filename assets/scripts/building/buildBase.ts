import { _decorator, Component, Node, Vec2 } from 'cc';
import { base } from '../node/base';
import { grid } from '../grid';
const { ccclass, property } = _decorator;

@ccclass('buildBase')
export class buildBase extends base {

    protected _data: any;
    public get data(): any {
        return this._data;
    }

    start() {

    }
    //建筑 占用格子
    private _obGrids: grid[] = []
    public get obGrids(): grid[] {
        return this._obGrids;
    }


    //所在索引
    protected _cellX: number;
    protected _cellY: number
    public get cellX(): number {
        return this._cellX;
    }

    public get cellY(): number {
        return this._cellY
    }


    //初始化
    public init(pos: Vec2) {
        this._cellX = pos.x;
        this._cellY = pos.y;
    }



    //标记格子
    public signObGrids(g: grid) {
        if (this._obGrids.indexOf(g) == -1) {
            this._obGrids.push(g)
            g.isObstacle = true;
            g.isStatic = true;
        } else {
            console.error("销毁建筑时没清除 clearObGrids");
        }
    }

    //消除格子
    public clearObGrids() {
        this._obGrids.forEach(element => {
            element.isStatic = false;
            element.isObstacle = false;
        });
        this._obGrids.length=0;
        this.node.destroy();
    }


    //初始化数据
    public initBuild(data) {
        this._data = data;
    }

    update(deltaTime: number) {

    }
}


