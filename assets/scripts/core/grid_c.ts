import { Vec2 } from "cc";

export class grid_c {
    private _cellX: number;
    public get cellX(): number {
        return this._cellX;
    }
    public set cellX(v: number) {
        this._cellX = v;
    }

    private _cellY: number;
    public get cellY(): number {
        return this._cellY;
    }
    public set cellY(v: number) {
        this._cellY = v;
    }

    //是否是障碍物
    private _isObstacle: boolean;
    public set isObstacle(v: boolean) {
        this._isObstacle = v;
    }
    public get isObstacle(): boolean {
        return this._isObstacle
    }


    //障碍物是否是静态的
    private _isStatic: boolean
    public set isStatic(v: boolean) {
        this._isStatic = v;
    }
    public get isStatic(): boolean {
        return this._isStatic;
    }

    //上一个
    public _parent: grid_c;
    public set parent(v: grid_c) {
        this._parent = v;
    }
    public get parent(): grid_c {
        return this._parent;
    }



    //下一个
    public _next: grid_c;
    public set next(v: grid_c) {
        this._next = v;
    }

    public get next(): grid_c {
        return this._next;
    }


    //设置障碍
    setObstacle(obstale: boolean) {
        this.isObstacle = obstale;
    }

    getObstacle(): boolean {
        return this._isObstacle;
    }


    //-------------------------------------
    //代价
    private _price: number;
    public set price(v: number) {
        this._price = v;
    }

    public get price(): number {
        return this._price;
    }

    //邻居格子
    private _neighorGrid: grid_c[];
    public set neighorGrid(v: grid_c[]) {
        this._neighorGrid = v;
    }
    public get neighorGrid(): grid_c[] {
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


    //是否被搜索过该格子
    private _isSearch: boolean = false;
    public set isSearch(v: boolean) {
        this._isSearch = v;
    }
    public get isSearch(): boolean {
        return this._isSearch;
    }



    //获取索引位置
    public getCellIndex() {
        return new Vec2(this._cellX, this._cellY);
    }



    public resetProperty(){
        this._backCheck=false;
        this._isSearch=false;
        this._isObstacle=false;
        this._isStatic=false;
        this._parent=null;
        this._next=null;
        this._price=10000;

    }
}


