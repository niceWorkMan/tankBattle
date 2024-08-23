import { _decorator, Component, math, Node, Vec2 } from 'cc';
import { grid } from '../grid';
import { gridManager } from '../gridManager';
const { ccclass, property } = _decorator;

@ccclass('aStar')
export class aStar extends Component {
    //copy from gridManager 格子对象数组
    private _gridNodeArr: Node[][] = [];

    private _openList: grid[] = [];
    private _closeList: grid[] = [];

    //路径
    private _pathList: grid[] = [];

    start() {
        console.log("AStar start");
    }

    //初始化NodeArray
    public setGridNodeArr(_gridNodeArr: Node[][]) {
        this._gridNodeArr = _gridNodeArr;
    }




    update(deltaTime: number) {

    }

    


    //路径
    getPathList() {
        return this._pathList;
    }



    caculate(currentGrid: grid, startGrid: grid, endGrid: grid) {
        //遍历节点n所有的邻近节点：
        var mIdx = currentGrid.getCellIndex();


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
        var mIdx = startGrid.getCellIndex();
        var limitMatrix: Vec2[] = this.getNeighborMitrax(mIdx);
        //当前循环最小代价格子临时变量
        var mixGrid: grid;
        //当前代价值的临时变量
        var priceNum = 100000;
        for (var j = limitMatrix[0].x; j <= limitMatrix[0].y; j++) {
            for (var k = limitMatrix[1].x; k <= limitMatrix[1].y; k++) {
                var newIndex: Vec2 = new Vec2(j, k);
                var gObj: grid = this._gridNodeArr[newIndex.x][newIndex.y].getComponent(grid);
                if ((newIndex.x != mIdx.x || newIndex.y != mIdx.y) && !(newIndex.x != mIdx.x && newIndex.y != mIdx.y) && gObj.getObstacle() == false) {
                    if (this._closeList.indexOf(gObj) == -1) {
                        gObj.setSpriteColor({ r: 100, g: 100, b: 103, a: 255 })
                    }

                    var price = this.getGridPrice(gObj, startGrid, endGrid);
                    gObj.setLabel(price + "")
                    //加入开列表 如果不在闭表中包含
                    if (this._closeList.indexOf(gObj) == -1) {
                        //如果没在开表中加入开表
                        if (this._openList.indexOf(gObj) == -1) {
                            this._openList.push(gObj)
                        }
                        if (price <= priceNum) {
                            //遍历找出最小值
                            priceNum = price;
                            mixGrid = gObj;
                        }
                    }

                }
            }
        }
        //检测出最小代价
        this._pathList.push(mixGrid);
        mixGrid.setSpriteColor({ r: 55, g: 206, b: 73, a: 255 })
        var searchDex = this._openList.indexOf(mixGrid);
        //最小代价操作
        if (searchDex != -1) {
            //加入闭表
            this._closeList.push(mixGrid);
            //移出开表
            this._openList.splice(searchDex, 1);
        }

        //循环递归
        if (mixGrid != endGrid) {
            setTimeout(() => {
                this.getPriceMixNeighborGrid(mixGrid, endGrid)
            }, 100);
        }

        //跳出循环,显示所有路径
        else {
            for (var i = 0; i < this._closeList.length; i++) {
                this._closeList[i].setSpriteColor({ r: 55, g: 206, b: 73, a: 255 });
            }
        }
    }

    //获取格子的代价
    getGridPrice(currentGrid: grid, startGrid: grid, endGrid: grid) {
        //公式 h=f+g;
        var f = Math.abs(currentGrid.getCellIndex().x - startGrid.getCellIndex().x) + Math.abs(currentGrid.getCellIndex().y - startGrid.getCellIndex().y);
        var g = Math.abs(endGrid.getCellIndex().x - currentGrid.getCellIndex().x) + Math.abs(endGrid.getCellIndex().y - currentGrid.getCellIndex().y);
        var h = f + g;
        return h;
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



    clearList(){
        this._openList=[];
        this._closeList=[];
        this._pathList=[];
    }
}


