import { _decorator, Component, log, math, Node, Vec2 } from 'cc';
import { grid } from '../grid';
import { gridManager } from '../gridManager';
const { ccclass, property } = _decorator;

@ccclass('aStar')
export class aStar extends Component {
    //copy from gridManager 格子对象数组
    private _gridNodeArr: Node[][] = [];

    private _closeList: grid[] = [];


    start() {
        console.log("AStar start");
    }

    //初始化NodeArray
    public setGridNodeArr(_gridNodeArr: Node[][]) {
        this._gridNodeArr = _gridNodeArr;
    }




    update(deltaTime: number) {

    }

    //获取相邻可用的格子
    getNeighborGrid(currentGrid: grid) {
        var mIdx = currentGrid.getCellIndex();
        console.log("mIdx", mIdx)
        var limitMatrix: Vec2[] = this.getNeighborMitrax(mIdx);
        console.log("maxtri", limitMatrix[0], limitMatrix[1])
        for (var j = limitMatrix[0].x; j <= limitMatrix[0].y; j++) {
            for (var k = limitMatrix[1].x; k <= limitMatrix[1].y; k++) {
                var newIndex: Vec2 = new Vec2(j, k);
                var gObj: grid = this._gridNodeArr[newIndex.x][newIndex.y].getComponent(grid);
                if ((newIndex.x != mIdx.x || newIndex.y != mIdx.y) && gObj.getObstacle() == false) {
                    gObj.setSpriteColor({ r: 100, g: 100, b: 103, a: 255 })
                }
            }
        }
    }

    //获取到最小代价的格子
    getPriceMixNeighborGrid(startGrid: grid, endGrid: grid) {
        var mIdx = new Vec2(startGrid.cellX, startGrid.cellY);
        var limitMatrix: Vec2[] = this.getNeighborMitrax(mIdx);
        //当前循环最小代价格子临时变量
        var mixGrid: grid;
        //当前代价值的临时变量
        var priceNum = 100000;
        //所有可能的路径格子
        var gridUsedMaxtri: grid[] = [];
        for (var j = limitMatrix[0].x; j <= limitMatrix[0].y; j++) {
            for (var k = limitMatrix[1].x; k <= limitMatrix[1].y; k++) {
                var newIndex: Vec2 = new Vec2(j, k);
                var gObj: grid = this._gridNodeArr[newIndex.x][newIndex.y].getComponent(grid);
                if ((newIndex.x != mIdx.x || newIndex.y != mIdx.y) && !(newIndex.x != mIdx.x && newIndex.y != mIdx.y) && gObj.backCheck == false && gObj.getObstacle() == false) {
                    if (this._closeList.indexOf(gObj) == -1) {
                        gObj.setSpriteColor({ r: 100, g: 100, b: 103, a: 255 })
                    }

                    var price = this.getGridPrice(gObj, startGrid, endGrid);
                    gObj.price = price;
                    gObj.setLabel(price + "")
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
            console.log("----------------------------------------");
            for (var a = 0; a < gridUsedMaxtri.length; a++) {
                console.log("price:", gridUsedMaxtri[a].price);
            }
            console.log("----------------------------------------");
            startGrid.neighorGrid = gridUsedMaxtri;
            if (!this.compareIndexOfGrid(gridUsedMaxtri[0], endGrid)) {
                console.log("取得是1：", gridUsedMaxtri[0].price);

                this.delayLoopSearch(gridUsedMaxtri[0], endGrid);
                this._closeList.push(gridUsedMaxtri[0])
            } else {
                for (var i = 0; i < this._closeList.length; i++) {
                    this._closeList[i].setSpriteColor({ r: 55, g: 206, b: 73, a: 255 });
                }
            }
            //设置Parent
            var usedGrid = this._gridNodeArr[gridUsedMaxtri[0].cellX][gridUsedMaxtri[0].cellY].getComponent(grid);
            var last = this._gridNodeArr[startGrid.cellX][startGrid.cellY].getComponent(grid);
            usedGrid.parent = last;
        }
        //回退搜索Neighbor
        else {
            //找父节点
            var collection: grid[] = this.checkParentGrid(startGrid)

            //计算代价
            for (var i = 0; i < collection.length; i++) {
                collection[i].price = this.getGridPrice(collection[i], startGrid, endGrid);
            }
            //排序优先使用代价最小的
            collection = this.sortPriceOfGrid(collection);
            //移除回溯路线
            var rgDex = this._closeList.indexOf(startGrid);
            this._closeList.splice(rgDex, 1);
            //设置颜色
            startGrid.setSpriteColor({ r: 0, g: 0, b: 0, a: 255 })

            //移除回溯路线2
            var rgDex2 = this._closeList.indexOf(startGrid.parent);
            this._closeList.splice(rgDex2, 1);
            //设置颜色
            startGrid.parent.setSpriteColor({ r: 0, g: 0, b: 0, a: 255 })

            if (!this.compareIndexOfGrid(collection[0], endGrid)) {
                console.log("取得是2：", collection[0].price);
                collection[0].parent = startGrid;
                this.delayLoopSearch(collection[0], endGrid);
                this._closeList.push(collection[0])
            } else {
                // for (var i = 0; i < this._closeList.length; i++) {
                //     this._closeList[i].setSpriteColor({ r: 55, g: 206, b: 73, a: 255 });
                // }
            }



        }
    }

    //检查回退父节点Neighbor
    checkParentGrid(cuGrid: grid): grid[] {
        //检查父级有没有Neigbor
        var grids = this.caculteParentNeighborGrids(cuGrid.parent);
        //没有
        if (grids.length == 0) {
            //移除在闭表里的对象
            var dex = this._closeList.indexOf(cuGrid);
            this._closeList.splice(dex, 1);
            cuGrid.setSpriteColor({ r: 0, g: 0, b: 0, a: 255 });
            //回溯检查标记 标记之后不再检查
            cuGrid.backCheck = true;
            //继续向腹肌查询
            if (cuGrid.parent != null) {
                var searchGrids: grid[] = this.checkParentGrid(cuGrid.parent);
                return searchGrids;
            } else {
                //内部结束
                console.log("结束");
                return grid[0];
            }

        } else {
            return grids;
        }
    }


    caculteParentNeighborGrids(cuGrid: grid): grid[] {
        var collectionGrids: grid[] = [];
        if (cuGrid.neighorGrid) {
            var parentSearchGrids: grid[] = cuGrid.neighorGrid;

            console.log("检索neighorGrid长度:", cuGrid.neighorGrid.length);
            for (var i = 0; i < parentSearchGrids.length; i++) {
                if (parentSearchGrids[i].isSearch == false) {
                    collectionGrids.push(parentSearchGrids[i]);
                }
            }
            return collectionGrids;
        }
        else {
            console.error("cuGrid.neighorGrid 不存在");

            return collectionGrids;
        }
    }

    delayLoopSearch(cuGrid: grid, endGrid: grid) {
        setTimeout(() => {
            cuGrid.setSpriteColor({ r: 55, g: 206, b: 73, a: 255 });
            this.getPriceMixNeighborGrid(cuGrid, endGrid)
        }, 100);
    }

    //冒泡排序代价
    sortPriceOfGrid(gArr: grid[]): grid[] {
        for (var i = 0; i < gArr.length; i++) {
            for (var j = 0; j < gArr.length - i - 1; j++) {
                if (gArr[j].price > gArr[j + 1].price) {
                    var temp = gArr[j];
                    gArr[j] = gArr[j + 1];
                    gArr[j + 1] = temp;
                }
            }
        }
        return gArr;
    }

    //是否周围有可用的格子
    isVaildGrid(startGrid: grid) {
        var isVaild = false;
        var mIdx = startGrid.getCellIndex();
        var limitMatrix: Vec2[] = this.getNeighborMitrax(mIdx);
        for (var j = limitMatrix[0].x; j <= limitMatrix[0].y; j++) {
            for (var k = limitMatrix[1].x; k <= limitMatrix[1].y; k++) {
                var newIndex: Vec2 = new Vec2(j, k);
                var gObj: grid = this._gridNodeArr[newIndex.x][newIndex.y].getComponent(grid);
                if ((newIndex.x != mIdx.x || newIndex.y != mIdx.y) && !(newIndex.x != mIdx.x && newIndex.y != mIdx.y) && gObj.getObstacle() == false && gObj.isSearch == false) {
                    isVaild = true;
                    break;
                }
            }
        }
        return isVaild;
    }

    //获取格子的代价
    getGridPrice(currentGrid: grid, startGrid: grid, endGrid: grid) {
        //公式 h=f+g;
        var f = Math.abs(currentGrid.getCellIndex().x - startGrid.getCellIndex().x) + Math.abs(currentGrid.getCellIndex().y - startGrid.getCellIndex().y);
        var g = Math.abs(endGrid.getCellIndex().x - currentGrid.getCellIndex().x) + Math.abs(endGrid.getCellIndex().y - currentGrid.getCellIndex().y);
        var h = f + g;

        var x2 = Math.pow(Math.abs(endGrid.getCellIndex().x - currentGrid.getCellIndex().x), 2);
        var y2 = Math.pow(Math.abs(endGrid.getCellIndex().y - currentGrid.getCellIndex().y), 2);
        h = Math.sqrt(x2 + y2);
        return Math.floor(h);
    }


    //比较格子的索引
    compareIndexOfGrid(g1: grid, g2: grid) {
        return (g1.getCellIndex().x == g2.getCellIndex().x) && (g1.getCellIndex().y == g2.getCellIndex().y)
    }


    //获取周围格子检索矩阵
    getNeighborMitrax(mIdx: Vec2): Vec2[] {
        var gm = this.node.getComponent(gridManager)
        if (!gm) {
            console.error("gm isNot Vaild")
        }
        var gridMatrixSize = gm.getGridMatrix();
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



    clearList() {
        this._closeList = [];
    }
}


