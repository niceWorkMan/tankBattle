import { _decorator, Color, Component, instantiate, log, math, Node, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
import { grid } from '../grid';
import { gridManager } from '../gridManager';
import { tank } from '../tank';
import { tankManager } from '../tankManager';

const { ccclass, property } = _decorator;

@ccclass('aStar')
export class aStar extends Component {
    constructor(gManager: gridManager) {
        super();
        if (gManager) {
            this.gManager = gManager;
            this._gridMatrix = gManager.gridMatrix;
            //生成网格
            this.tankNaviGrid(gManager);
            //更新网格
        }
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
    public set tankManager(v: tankManager) {
        this._tankManager = v;
    }
    public get tankManager(): tankManager {
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
    tankNaviGrid(gManager: gridManager) {
        for (var i = 0; i < this._gridMatrix.row; i++) {
            var _compArr_ins: grid[] = [];
            for (var j = 0; j < this._gridMatrix.colum; j++) {
                var _grid: Node = instantiate(this.gManager.gridPrefab);
                //不在操作AStar网格中的视图渲染
                var gScript = _grid.getComponent(grid)
                //加入一维数组
                _compArr_ins.push(gScript);
                if (gScript) {
                    gScript.setGridManager(this.gManager);
                    gScript.setIndexLabel(i, j);
                    gScript.setObstacle(gManager.gridComponentArr[i][j].isObstacle);
                }
            }
            //加入二维数组
            this._gridNodeArr.push(_compArr_ins)
        }
    }

    //copy from gridManager 格子对象数组
    private _gridNodeArr: grid[][] = [];
    public get gridNodeArr(): grid[][] {
        return this._gridNodeArr
    }

    //查询路径结果
    private _closeList: grid[] = [];
    public get closeList(): grid[] {
        return this._closeList;
    }
    public set closeList(v: grid[]) {
        this._closeList = v;
    }


    //格子矩阵
    private _gridMatrix;
    public set gridMatri(v: {}) {
        this._gridMatrix = v;
    }


    start() {
        console.log("AStar start");
    }



    //坦克对象
    private _tk: tank
    public set tk(v: tank) {
        this._tk = v;
    }
    public get tk(): tank {
        return this._tk;
    }



    update(deltaTime: number) {

    }
    //获取相邻可用的格子
    getNeighborGrid(currentGrid: grid) {
        var mIdx = currentGrid.getCellIndex();
        var limitMatrix: Vec2[] = this.getNeighborMitrax(mIdx);
        for (var j = limitMatrix[0].x; j <= limitMatrix[0].y; j++) {
            for (var k = limitMatrix[1].x; k <= limitMatrix[1].y; k++) {
                var newIndex: Vec2 = new Vec2(j, k);
                var gObj: grid = this._gridNodeArr[newIndex.x][newIndex.y];
                if ((newIndex.x != mIdx.x || newIndex.y != mIdx.y) && gObj.getObstacle() == false) {
                    //gObj.setSpriteColor({ r: 100, g: 100, b: 103, a: 255 })
                }
            }
        }
    }

    //获取到最小代价的格子
    getPriceMixNeighborGrid(startGrid: grid, endGrid: grid) {
        var mIdx = new Vec2(startGrid.cellX, startGrid.cellY);
        var limitMatrix: Vec2[] = this.getNeighborMitrax(mIdx);
  
        //所有可能的路径格子
        var gridUsedMaxtri: grid[] = [];
        for (var j = limitMatrix[0].x; j <= limitMatrix[0].y; j++) {
            for (var k = limitMatrix[1].x; k <= limitMatrix[1].y; k++) {
                var newIndex: Vec2 = new Vec2(j, k);
                var gObj: grid = this._gridNodeArr[newIndex.x][newIndex.y];
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
            var collection: grid[] = this.checkParentGrid(startGrid)
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
        //复位closeList 放在远点过滤前面
        this.gridNodeArr[this.tk.startGrid.cellX][this.tk.startGrid.cellY].isSearch = false
        this.gridNodeArr[this.tk.startGrid.cellX][this.tk.startGrid.cellY].backCheck = false;
        this.gridNodeArr[this.tk.endGrid.cellX][this.tk.endGrid.cellY].isSearch = false;
        this.gridNodeArr[this.tk.endGrid.cellX][this.tk.endGrid.cellY].backCheck = false;
        for (var i = 0; i < this._closeList.length; i++) {
            this._closeList[i].isSearch = false;
            this._closeList[i].backCheck = false;
            this._closeList[i].price = 10000;
        };
        //远点过滤
        this.removefarGrid(this._closeList);
        //头尾加入
        if (this.closeList.length > 0) {
            this.closeList.unshift(this.gridNodeArr[this.tk.startGrid.cellX][this.tk.startGrid.cellY])
            this.closeList.push(this.gridNodeArr[this.tk.endGrid.cellX][this.tk.endGrid.cellY])
        }
        else {
            console.warn("当前路径无法到达终点");
            setTimeout(() => {
               this.tk.startNav();
            }, this.tk.waitObsTime*1000);
            return;
        }
        //重新设置Parent和Next
        //显示路径
        for (var i = 0; i < this._closeList.length; i++) {
            //this._closeList[i].setLabel("路:" + i)
            //this.gManager.gridComponentArr[this._closeList[i].cellX][this._closeList[i].cellY].setLabel("路:" + i);
            //this._closeList[i].setSpriteColor({ r: 0, g: 21, b: 225, a: 255 });
            //this.gManager.gridComponentArr[this._closeList[i].cellX][this._closeList[i].cellY].setSpriteColor({ r: 0, g: 21, b: 225, a: 255 });
            if (i > 0) {
                this._closeList[i].parent = this._closeList[i - 1];
            }
            if (i < this._closeList.length - 2) {
                this._closeList[i].next = this._closeList[i + 1];
            }
        }

        this.tk.node.active = true;
        //开始导航
        if (this.tk)
            this.tk.navigationMove(this._closeList);

    }


    //移除远点的点(蓝色是已有数据的最优解)
    removefarGrid(list: grid[]): grid[] {
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


    closeListAdd(g: grid) {
        var index = this._closeList.indexOf(g)
        if (index == -1) {
            this._closeList.push(g)
        }
    }

    //移除回溯路线点
    removeBackGrid(startGrid: grid) {
        var rgDex = this._closeList.indexOf(startGrid);
        if (rgDex != -1) {
            this._closeList.splice(rgDex, 1);
            //设置颜色
            //startGrid.setSpriteColor({ r: 0, g: 0, b: 0, a: 255 })
        }
    }


    //检查回退父节点Neighbor
    checkParentGrid(cuGrid: grid): grid[] {
        //检查父级有没有Neigbor
        var grids = [];
        if (cuGrid.parent)
            grids = this.caculteParentNeighborGrids(cuGrid.parent);
        else {//内部结束
            console.warn("结束");
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
                    var searchGrids: grid[] = this.checkParentGrid(cuGrid.parent);
                    return searchGrids;
                } else {
                    //内部结束
                    console.warn("结束");
                    return grid[0];
                }
            } else {
                console.warn("查询失败 结束");
            }
            //移除在闭表里的对象
            this.removeBackGrid(cuGrid);
            //回溯检查标记 标记之后不再检查
            cuGrid.backCheck = true;
        }
        return grids;
    }

    //计算父节点的neighbor
    caculteParentNeighborGrids(cuGrid: grid): grid[] {
        var collectionGrids: grid[] = [];
        if (cuGrid.neighorGrid != null) {
            var parentSearchGrids: grid[] = cuGrid.neighorGrid;
            for (var i = 0; i < parentSearchGrids.length; i++) {
                if (parentSearchGrids[i].isSearch == false) {
                    collectionGrids.push(parentSearchGrids[i]);
                }
            }
            return collectionGrids;
        }
        else {
            console.warn("cuGrid.neighorGrid 不存在");
            return collectionGrids;
        }
    }



    //递归循环查找
    delayLoopSearch(cuGrid: grid, endGrid: grid) {
        //必须setTimeout间隔执行 不然会有错误
        setTimeout(() => {
            //cuGrid.setSpriteColor({ r: 55, g: 206, b: 73, a: 255 });
            this.getPriceMixNeighborGrid(cuGrid, endGrid)
        }, 0);
    }

    //冒泡排序代价
    sortPriceOfGrid(gArr: grid[]): grid[] {
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
    getGridPrice(currentGrid: grid, startGrid: grid, endGrid: grid) {
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
    compareIndexOfGrid(g1: grid, g2: grid) {
        return g1 == g2
    }


    //获取周围格子检索矩阵
    getNeighborMitrax(mIdx: Vec2): Vec2[] {
        var gridMatrixSize = this._gridMatrix;
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
                this.gridNodeArr[i][j].parent=null;
                this.gridNodeArr[i][j].next=null;
                //isSearch=false很重要
                this.gridNodeArr[i][j].isObstacle=false;
                this.gridNodeArr[i][j].isSearch=false;
                this.gridNodeArr[i][j].backCheck=false;
                this.gridNodeArr[i][j].neighorGrid=[];
             }
        }
        this.closeList=[];
        this.tankManager.synGridCollectionState();
    }

    public Clear(){
        this._gridNodeArr=null;
        this.closeList=null;
    }
}


