import { _decorator, Color, Component, instantiate, log, math, Node, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
import { grid } from '../grid';
import { gridManager } from '../gridManager';
import { tank } from '../node/tank';
import { tankManager } from '../tankManager';
import { element } from '../node/element';
import { grid_c } from './grid_c';

const { ccclass, property } = _decorator;


@ccclass('aStar')
export class aStar extends Component {

    //起始点
    protected _startGrid;
    public get startGrid(): grid {
        return this._startGrid
    }
    public set startGrid(v: grid) {
        this._startGrid = v;
    }

    //结束点
    protected _endGrid;
    public get endGrid(): grid {
        return this._endGrid
    }
    public set endGrid(v: grid) {
        this._endGrid = v;
    }


    //当前Tank所在格子
    private _nodeInGridCellIndex: Vec2;
    public set nodeInGridCellIndex(v: Vec2) {
        this._nodeInGridCellIndex = v;
    }
    public get nodeInGridCellIndex(): Vec2 {
        return this._nodeInGridCellIndex;
    }


    //配置键
    protected _key: string;
    public set key(v: string) {
        this._key = v;
    }
    public get key(): string {
        return this._key
    }


    start() {
        //保证在element的Start()函数后执行
        this.initComponent();
    }


    initComponent() {
        this.gManager = this.node.parent.parent.getComponent(gridManager);
        this.tManager = this.node.parent.parent.getComponent(tankManager);

        this._gridMatrix = this.gManager.getGridMatrix;
        //生成网格
        this.tankNaviGrid();
        this.tManager.synGridCollectionAdd(this);
        //开始导航
        this.startNav();
    }

    public startNav() {

        //重置数据
        this.resetGridArr();
        this.tManager.synCurrentState(this);
        //----------------------------------------------------
        //同步基础网格状态
        //寻路
        this.startGrid.cellX = this.nodeInGridCellIndex.x;
        this.startGrid.cellY = this.nodeInGridCellIndex.y;

        this.getPriceMixNeighborGrid(this.gridNodeArr[this.startGrid.cellX][this.startGrid.cellY], this.gridNodeArr[this.endGrid.cellX][this.endGrid.cellY])

    }


    //同步网格状态
    synGridState(gManager: gridManager) {
        var originGridArr = gManager.gridComponentArr;
        for (var i = 0; i < this._gridMatrix.row; i++) {
            for (var j = 0; j < this._gridMatrix.colum; j++) {
                this._gridNodeArr[i][j].isObstacle = originGridArr[i][j].isObstacle;
            }
        }

    }




    //坦克管理类
    private _tankManager: tankManager
    public set tManager(v: tankManager) {
        this._tankManager = v;
    }
    public get tManager(): tankManager {
        return this._tankManager
    }

    //网格管理
    private _gridManager: gridManager;
    public set gManager(v: gridManager) {
        this._gridManager = v;
    }

    public get gManager(): gridManager {
        return this._gridManager
    }


    //初始化导航网格(只在内存中保存数据)
    tankNaviGrid() {
        for (var i = 0; i < this._gridMatrix.row; i++) {
            var _compArr_ins: grid_c[] = [];
            for (var j = 0; j < this._gridMatrix.colum; j++) {
                var _grid:grid_c =new grid_c();
                _grid.cellX=i;
                _grid.cellY=j;
                _grid.setObstacle(this.gManager.gridComponentArr[i][j].isObstacle)
                _compArr_ins.push(_grid);
            }
            //加入二维数组
            this._gridNodeArr.push(_compArr_ins)
        }
    }

    //copy from gridManager 格子对象数组
    private _gridNodeArr: grid_c[][] = [];
    public get gridNodeArr(): grid_c[][] {
        return this._gridNodeArr
    }

    //查询路径结果
    private _closeList: grid_c[] = [];
    public get closeList(): grid_c[] {
        return this._closeList;
    }
    public set closeList(v: grid_c[]) {
        this._closeList = v;
    }


    //格子矩阵
    private _gridMatrix;
    public set gridMatri(v: {}) {
        this._gridMatrix = v;
    }


    //坦克对象
    private _tk: any
    public set tk(v: any) {
        this._tk = v;
    }
    public get tk(): any {
        return this._tk;
    }



    //生成时所用的子类
    private _spawmComponentType: any
    public set spawmComponentType(v: any) {
        this._spawmComponentType = v;
    }


    //获取位置
    public getPosition(g:grid_c) {
        var pos:Vec3=this.node.parent.parent.getComponent(gridManager).gridComponentArr[g.cellX][g.cellY].node.getPosition();
        //console.log("测试:x:"+g.cellX+"  y:"+g.cellY+"  位置:x:"+pos.x+"  y:"+pos.y);
        return pos;
    }

    update(deltaTime: number) {

    }
    //获取相邻可用的格子
    getNeighborGrid(currentGrid: grid_c) {
        var mIdx = currentGrid.getCellIndex();
        var limitMatrix: Vec2[] = this.getNeighborMitrax(mIdx);
        for (var j = limitMatrix[0].x; j <= limitMatrix[0].y; j++) {
            for (var k = limitMatrix[1].x; k <= limitMatrix[1].y; k++) {
                var newIndex: Vec2 = new Vec2(j, k);
                var gObj: grid_c = this._gridNodeArr[newIndex.x][newIndex.y];
                if ((newIndex.x != mIdx.x || newIndex.y != mIdx.y) && gObj.getObstacle() == false) {
                    //gObj.setSpriteColor({ r: 100, g: 100, b: 103, a: 255 })
                }
            }
        }
    }

    //获取到最小代价的格子
    getPriceMixNeighborGrid(startGrid: grid_c, endGrid: grid_c) {
        var mIdx = new Vec2(startGrid.cellX, startGrid.cellY);
        var limitMatrix: Vec2[] = this.getNeighborMitrax(mIdx);

        //所有可能的路径格子
        var gridUsedMaxtri: grid_c[] = [];
        for (var j = limitMatrix[0].x; j <= limitMatrix[0].y; j++) {
            for (var k = limitMatrix[1].x; k <= limitMatrix[1].y; k++) {
                var newIndex: Vec2 = new Vec2(j, k);
                var gObj: grid_c = this._gridNodeArr[newIndex.x][newIndex.y];
                if ((newIndex.x != mIdx.x || newIndex.y != mIdx.y) && !(newIndex.x != mIdx.x && newIndex.y != mIdx.y) && gObj.backCheck == false && gObj.getObstacle() == false) {
                    if (this._closeList.indexOf(gObj) == -1) {
                        //检索搜索格
                        // gObj.setSpriteColor({ r: 100, g: 100, b: 103, a: 255 })
                    }
                    var price = this.getGridPrice(gObj, startGrid, endGrid);
                    gObj.price = price;
                    //gObj.setLabel(price + "")
                    //加入开列表 如果不在闭表中包含
                    if (gObj.isSearch == false)
                        gridUsedMaxtri.push(gObj);
                }
            }
        }
        //标记搜索过了
        startGrid.isSearch = true;
        //排序搜索数组
        if (gridUsedMaxtri.length > 0) {
            gridUsedMaxtri = this.sortPriceOfGrid(gridUsedMaxtri);
            startGrid.neighorGrid = gridUsedMaxtri;
            if (!this.compareIndexOfGrid(gridUsedMaxtri[0], endGrid)) {
                gridUsedMaxtri[0].parent = startGrid;
                startGrid.next = gridUsedMaxtri[0];
                this.delayLoopSearch(gridUsedMaxtri[0], endGrid);
                this.closeListAdd(gridUsedMaxtri[0])
            } else {
                //
                this.showPath();
            }
            //设置Parent
            var usedGrid = this._gridNodeArr[gridUsedMaxtri[0].cellX][gridUsedMaxtri[0].cellY];
            var last = this._gridNodeArr[startGrid.cellX][startGrid.cellY];
            usedGrid.parent = last;
        }
        //回退搜索Neighbor
        else {
            //找父节点
            var collection: grid_c[] = this.checkParentGrid(startGrid)
            if (collection) {
                //计算代价
                for (var i = 0; i < collection.length; i++) {
                    collection[i].price = this.getGridPrice(collection[i], startGrid, endGrid);
                }
                //排序优先使用代价最小的
                collection = this.sortPriceOfGrid(collection);
                //如果collection不存在
                if (collection.length == 0) {
                    this.showPath();
                }
                else {
                    //进入下个循环
                    if (!this.compareIndexOfGrid(collection[0], endGrid)) {
                        collection[0].parent = startGrid;
                        startGrid.next = collection[0];
                        this.delayLoopSearch(collection[0], endGrid);
                        this.closeListAdd(collection[0])
                    } else {
                        this.showPath();
                    }
                }

            } else {
                //结束
                console.error("cuGrid.neighorGrid 不存在", this._closeList.length);
                this.showPath();
            }

        }
    }

    //显示路径（绿色是已经粗算的路径）
    showPath() {
        if (!this || !this.startGrid || !this.endGrid) {
            return;
        }
        //复位closeList 放在远点过滤前面
        this.gridNodeArr[this.startGrid.cellX][this.startGrid.cellY].isSearch = false
        this.gridNodeArr[this.startGrid.cellX][this.startGrid.cellY].backCheck = false;
        this.gridNodeArr[this.endGrid.cellX][this.endGrid.cellY].isSearch = false;
        this.gridNodeArr[this.endGrid.cellX][this.endGrid.cellY].backCheck = false;
        for (var i = 0; i < this._closeList.length; i++) {
            this._closeList[i].isSearch = false;
            this._closeList[i].backCheck = false;
            this._closeList[i].price = 10000;
        };
        //远点过滤
        this.removefarGrid(this._closeList);
        //头尾加入
        if (this.closeList.length > 0) {
            this.closeList.unshift(this.gridNodeArr[this.startGrid.cellX][this.startGrid.cellY])
            this.closeList.push(this.gridNodeArr[this.endGrid.cellX][this.endGrid.cellY])
        }
        else {
            //console.warn("当前路径无法到达终点");
            setTimeout(() => {
                if (this.tk)
                    this.startNav();
            }, this.tk.waitObsTime * 1000);
            return;
        }
        //重新设置Parent和Next
        //显示路径
        for (var i = 0; i < this._closeList.length; i++) {
            //this._closeList[i].setLabel("路:" + i)
            //this.gManager.gridComponentArr[this._closeList[i].cellX][this._closeList[i].cellY].setLabel("路:" + i);
            //this._closeList[i].setSpriteColor({ r: 0, g: 21, b: 225, a: 255 });
            //this.gManager.gridComponentArr[this._closeList[i].cellX][this._closeList[i].cellY].olor({ r: 0, g: 21, b: 225, a: 255 });
            if (i > 0) {
                this._closeList[i].parent = this._closeList[i - 1];
            }
            if (i < this._closeList.length - 2) {
                this._closeList[i].next = this._closeList[i + 1];
            }
        }

        this.node.active = true;
        //开始导航
        if (this.tk) {
            this.tk.navigationMove(this._closeList);
        }
        else {
            alert("漏网之鱼")
        }

    }


    //移除远点的点(蓝色是已有数据的最优解)
    removefarGrid(list: grid_c[]): grid_c[] {
        for (var i = 0; i < list.length; i++) {
            for (var j = i; j < list.length; j++) {
                //x 相同 y 间隔
                var isNeighborowColumn = (list[i].cellX == list[j].cellX) && (Math.abs(list[i].cellY - list[j].cellY) == 1) && (Math.abs(j - i) >= 3);
                var isNeighborRow = (list[i].cellY == list[j].cellY) && (Math.abs(list[i].cellX - list[j].cellX) == 1) && (Math.abs(j - i) >= 3);

                if (isNeighborowColumn || isNeighborRow) {
                    list.splice(i + 1, j - i - 1);
                    this.removefarGrid(list);
                    return list
                }
            }
        }
        return list;
    }


    closeListAdd(g: grid_c) {
        var index = this._closeList.indexOf(g)
        if (index == -1) {
            this._closeList.push(g)
        }
    }

    //移除回溯路线点
    removeBackGrid(startGrid: grid_c) {
        var rgDex = this._closeList.indexOf(startGrid);
        if (rgDex != -1) {
            this._closeList.splice(rgDex, 1);
            //设置颜色
            //startGrid.setSpriteColor({ r: 0, g: 0, b: 0, a: 255 })
        }
    }


    //检查回退父节点Neighbor
    checkParentGrid(cuGrid: grid_c): grid_c[] {
        //检查父级有没有Neigbor
        var grids = [];
        if (cuGrid.parent)
            grids = this.caculteParentNeighborGrids(cuGrid.parent);
        else {//内部结束
            //console.warn("结束");
            return grids;
        }
        //没有
        if (grids) {
            if (grids.length == 0) {
                //移除在闭表里的对象
                this.removeBackGrid(cuGrid);
                //回溯检查标记 标记之后不再检查
                cuGrid.backCheck = true;
                //继续向腹肌查询
                if (cuGrid.parent != null) {
                    var searchGrids: grid_c[] = this.checkParentGrid(cuGrid.parent);
                    return searchGrids;
                } else {
                    //内部结束
                    //console.warn("结束");
                    return grid_c[0];
                }
            } else {
               // console.warn("查询失败 结束");
            }
            //移除在闭表里的对象
            this.removeBackGrid(cuGrid);
            //回溯检查标记 标记之后不再检查
            cuGrid.backCheck = true;
        }
        return grids;
    }

    //计算父节点的neighbor
    caculteParentNeighborGrids(cuGrid: grid_c): grid_c[] {
        var collectionGrids: grid_c[] = [];
        if (cuGrid.neighorGrid != null) {
            var parentSearchGrids: grid_c[] = cuGrid.neighorGrid;
            for (var i = 0; i < parentSearchGrids.length; i++) {
                if (parentSearchGrids[i].isSearch == false) {
                    collectionGrids.push(parentSearchGrids[i]);
                }
            }
            return collectionGrids;
        }
        else {
            //console.warn("cuGrid.neighorGrid 不存在");
            return collectionGrids;
        }
    }



    //递归循环查找
    delayLoopSearch(cuGrid: grid_c, endGrid: grid_c) {
        //必须setTimeout间隔执行 不然会有错误
        setTimeout(() => {
            //cuGrid.setSpriteColor({ r: 55, g: 206, b: 73, a: 255 });
            if (this.node)
                this.getPriceMixNeighborGrid(cuGrid, endGrid)
        }, 0);
    }

    //冒泡排序代价
    sortPriceOfGrid(gArr: grid_c[]): grid_c[] {
        //排序
        for (var i = 0; i < gArr.length; i++) {
            for (var j = 0; j < gArr.length - i - 1; j++) {
                if (gArr[j].price > gArr[j + 1].price) {
                    var temp = gArr[j];
                    gArr[j] = gArr[j + 1];
                    gArr[j + 1] = temp;
                }
            }
        }
        //过滤掉新增的 不可用路径点isObstacle=true的对象
        for (var i = 0; i < gArr.length; i++) {
            if (gArr[i].isObstacle) {
                var index = gArr.indexOf(gArr[i]);
                gArr.splice(index, 1);
            }
        }
        return gArr;
    }

    //获取格子的代价
    getGridPrice(currentGrid: grid_c, startGrid: grid_c, endGrid: grid_c) {
        //公式 h=f+g;
        var f = Math.abs(currentGrid.getCellIndex().x - startGrid.getCellIndex().x) + Math.abs(currentGrid.getCellIndex().y - startGrid.getCellIndex().y);
        var g = Math.abs(endGrid.getCellIndex().x - currentGrid.getCellIndex().x) + Math.abs(endGrid.getCellIndex().y - currentGrid.getCellIndex().y);
        var h = f + g;

        //斜边算法
        // var x2 = Math.pow(Math.abs(endGrid.getCellIndex().x - currentGrid.getCellIndex().x), 2);
        // var y2 = Math.pow(Math.abs(endGrid.getCellIndex().y - currentGrid.getCellIndex().y), 2);
        // h = Math.sqrt(x2 + y2);
        return Math.floor(h);
    }


    //比较格子的索引
    compareIndexOfGrid(g1: grid_c, g2: grid_c) {
        return g1 == g2
    }


    //获取周围格子检索矩阵
    getNeighborMitrax(mIdx: Vec2): Vec2[] {
        if (!this.node) {
            return;
        }
        var gridMatrixSize = this.node.parent.parent.getComponent(gridManager).getGridMatrix;
        //设置当前格子四周矩阵设置
        var xMin;
        var xMax;
        if (mIdx.x == 0) {
            xMin = mIdx.x;
            xMax = mIdx.x + 1;
        }
        else if (mIdx.x == gridMatrixSize.row - 1) {
            xMin = mIdx.x - 1;
            xMax = mIdx.x;
        }
        else {
            xMin = mIdx.x - 1;
            xMax = mIdx.x + 1;
        }

        var yMin;
        var yMax;
        if (mIdx.y == 0) {
            yMin = mIdx.y
            yMax = mIdx.y + 1
        }
        else if (mIdx.y == gridMatrixSize.colum - 1) {
            yMin = mIdx.y - 1
            yMax = mIdx.y
        }
        else {
            yMin = mIdx.y - 1
            yMax = mIdx.y + 1;
        }
        return [new Vec2(xMin, xMax), new Vec2(yMin, yMax)];
    }




    //重置格子的数据
    public resetGridArr() {
        for (var i = 0; i < this._gridMatrix.row; i++) {
            for (var j = 0; j < this._gridMatrix.colum; j++) {
                this._gridNodeArr[i][j].parent = null;
                this._gridNodeArr[i][j].next = null;
                //isSearch=false很重要
                this._gridNodeArr[i][j].isObstacle = false;
                this._gridNodeArr[i][j].isSearch = false;
                this._gridNodeArr[i][j].backCheck = false;
                this._gridNodeArr[i][j].neighorGrid = [];
            }
        }
        this._closeList = [];
    }


    protected onDestroy(): void {
        this._gridNodeArr = null;
    }

}


