import { _decorator, Component, Node, Vec2 } from 'cc';
import { grid } from '../grid';
import { gridManager } from '../gridManager';
const { ccclass, property } = _decorator;

@ccclass('aStar')
export class aStar extends Component {
    //copy from gridManager 格子对象数组
    private _gridNodeArr: Node[][] = [];

    private _openList: grid[]=[];
    private _closeList: grid[]=[];

    //路径
    private _pathList: grid[]=[];

    start() {
        console.log("AStar start");
    }

    //初始化NodeArray
    public setGridNodeArr(_gridNodeArr: Node[][]) {
        this._gridNodeArr = _gridNodeArr;
    }




    update(deltaTime: number) {

    }

    getParentList(g: grid) {
        if (g._aStarParent != null) {
            this._pathList.push(g);
            this.getParentList(g._aStarParent);
        } else {
            this._pathList.push(g);
        }
    }

    //路径
    getPathList(){
        return this._pathList;
    }



    caculate(startGrid: grid, endGrid: grid) {
        this._openList.push(startGrid);
        //如果open_set不为空，则从open_set中选取优先级最高的节点n：
        if (this._openList.length > 0) {
            this._openList.forEach(element => {
                for (var i = 0; i < this._openList.length; i++) {
                    var element = this._openList[i];
                    //如果节点n为终点
                    if (element.getCellIndex().x == endGrid.getCellIndex().x&&element.getCellIndex().y == endGrid.getCellIndex().y) {
                        //从终点开始逐步追踪parent节点，一直达到起点；返回找到的结果路径，算法结束
                        this.getParentList(element);
                        break;
                    }
                    //如果节点n不是终点
                    else {
                        //将节点n从open_set中删除，并加入close_set中；
                        var index = this._openList.indexOf(element);
                        if (index != -1) {
                            this._openList.splice(index, 1);
                        }
                        this._closeList.push(element);
                    }

                    //遍历节点n所有的邻近节点：
                    var mIdx = element.getCellIndex();

                    var limitMatrix: Vec2[] = this.getNeighborMitrax(mIdx);

                    for (var j = limitMatrix[0].x; j <= limitMatrix[0].y; j++) {
                        for (var k = limitMatrix[1].x; k <= limitMatrix[1].y; k++) {
                            var newIndex: Vec2 = new Vec2(j, k);
                            var gObj: grid = this._gridNodeArr[newIndex.x][newIndex.y].getComponent(grid);
                            if ((newIndex.x != mIdx.x||newIndex.y != mIdx.y)&&gObj.getObstacle()==false) {
                                //将节点n从open_set中删除，并加入close_set中；
                                var isInClose = this.checkInCloseList(newIndex);
                                if (isInClose) {
                                    continue;
                                }
                                else {
                                    gObj._aStarParent = element;
                                    this.caculate(gObj, endGrid);
                                }
                            }

                        }
                    }
                }
            });
        }
    }


    getNeighborMitrax(mIdx: Vec2): Vec2[] {
        var gm = this.node.getComponent(gridManager)
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


    //检查OpenList是否含有该索引
    checkInOpenList(index: Vec2) {
        var isFind = false;
        for (var i = 0; i < this._openList.length; i++) {
            if (this._openList[i].getCellIndex() == index) {
                isFind = true;
                break;
            }
        }
        return isFind;
    }

    //检查CloseList是否含有该索引
    checkInCloseList(index: Vec2) {
        var isFind = false;
        for (var i = 0; i < this._closeList.length; i++) {
            if (this._closeList[i].getCellIndex() == index) {
                isFind = true;
                break;
            }
        }
        return isFind;
    }


    public test(x, y) {
        this._gridNodeArr[x][y].getComponent(grid).tweenColor();
    }
}


