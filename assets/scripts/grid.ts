import { _decorator, Color, Component, Label, Node, NodeEventType, Sprite, tween, Vec2 } from 'cc';
import { gridManager } from './gridManager';
const { ccclass, property } = _decorator;

@ccclass('grid')
export class grid extends Component {
    private _sprite;
    private _indexLabel;

    private _cellX: number;

    public set cellX(v: number) {
        this._cellX = v;
    }
    public get cellX(): number {
        return this._cellX;
    }


    private _cellY: number;

    public set cellY(v: number) {
        this._cellY = v;
    }
    public get cellY(): number {
        return this._cellY;
    }

    private _gridManager;
    //是否是障碍物
    private _isObstacle: boolean;
    public set isObstacle(v: boolean) {
        this._isObstacle = v;
    }
    public get isObstacle(): boolean {
        return this._isObstacle
    }


    //父节点
    public _aStarParent: grid = null;


    //是否被搜索过该格子
    private _isSearch: boolean = false;
    public set isSearch(v: boolean) {
        this._isSearch = v;
    }
    public get isSearch(): boolean {
        return this._isSearch;
    }

    //上一个
    public _parent: grid;
    public set parent(v: grid) {
        this._parent = v;
    }

    public get parent(): grid {
        return this._parent;
    }



    //下一个
    public _next: grid;
    public set next(v: grid) {
        this._next = v;
    }

    public get next(): grid {
        return this._next;
    }



    //邻居格子
    private _neighorGrid: grid[];

    public set neighorGrid(v: grid[]) {
        this._neighorGrid = v;
    }

    public get neighorGrid(): grid[] {
        return this._neighorGrid;
    }


    //是否回溯过
    private _backCheck: boolean = false;
    public set backCheck(v: boolean) {
        this._backCheck = v;
    }

    public get backCheck(): boolean {
        return this._backCheck;
    }



    //代价
    private _price: number;
    public set price(v: number) {
        this._price = v;
    }

    public get price(): number {
        return this._price;
    }





    start() {
        this._sprite = this.getComponent(Sprite)
        //
        this.node.on(NodeEventType.MOUSE_DOWN, (e) => {
            this.tweenColor();
        })
        this.node.on(NodeEventType.TOUCH_START, (e) => {
            this.tweenColor();
        })
    }


    tweenColor() {
        //this._sprite = this.getComponent(Sprite)
        const cor = { r: 255, g: 255, b: 255, a: 255 };
        var tw = tween(cor).to(1, { r: 255, g: 255, b: 255, a: 0 }, {
            onUpdate: () => {
                this._sprite.color = cor;
                //console.log("cor.a", this._sprite.color, cor.a)
            }
        }).to(1, { r: 255, g: 255, b: 255, a: 50 }, {
            onUpdate: () => {
                this._sprite.color = cor;
                //console.log("cor.a", this._sprite.color, cor.a)
            }
        })
        tw.start();
    }

    /**
     * 设置方格索引
     */
    setIndexLabel(x: number, y: number) {
        var xLabel = x + "";
        var yLable = y + "";
        this._cellX = x;
        this._cellY = y;
        var indexLabelNode = this.node.getChildByName("indexLabel");
        this._indexLabel = indexLabelNode.getComponent(Label);
        this._indexLabel.string = "[" + xLabel + "," + yLable + "]";
    }

    setLabel(str) {
        this._indexLabel.color = { r: 255, g: 255, b: 255, a: 255 }
        this._indexLabel.string = str;
    }

    //障碍物
    setObstacle(isObstacle: boolean) {
        this._isObstacle = isObstacle;
        this._sprite = this.getComponent(Sprite)
        if (isObstacle) {
            this._sprite.color = { r: 216, g: 47, b: 47, a: 255 };
        }
        else {
           // this._sprite.color = { r: 230, g: 241, b: 103, a: 255 };
        }
    }


    setSpriteColor(c) {
        if (!this._sprite) {
            this._sprite = this.getComponent(Sprite);
        }
        this._sprite.color = c;
    }

    getObstacle(): boolean {
        return this._isObstacle;
    }

    setGridManager(gridManager: gridManager) {
        this._gridManager = gridManager;
    }



    //获取索引位置
    public getCellIndex() {
        return new Vec2(this._cellX, this._cellY);
    }
    
    //获取位置
    public getPosition(){
      return   this._gridManager.gridComponentArr[this._cellX][this._cellY].node.getPosition();
    }



    public test() {

        console.log("hellow")
    }
}


