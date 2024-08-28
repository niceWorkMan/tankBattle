import { _decorator, Component, log, math, Node, tween, Vec2, Vec3 } from 'cc';
import { grid } from './grid';
import { aStar } from './core/aStar';
import { tankManager } from './tankManager';
const { ccclass, property } = _decorator;

@ccclass('tank')
export class tank extends Component {
    start() {

    }

    //坦克管理类
    private _tankManager: tankManager
    public set tankManager(v: tankManager) {
        this._tankManager = v;
    }
    public get tankManager(): tankManager {
        return this._tankManager
    }

    //aStart;
    private _aStar:aStar;
    public set aaStar (v : aStar) {
        this._aStar = v;
    }
    public get aaStar() : aStar {
        return this._aStar
    }
    
    

    //起始点
    private _startGrid;
    public get startGrid(): grid {
        return this._startGrid
    }
    public set startGrid(v: grid) {
        this._startGrid = v;
    }

    //结束点
    private _endGrid;
    public get endGrid(): grid {
        return this._endGrid
    }
    public set endGrid(v: grid) {
        this._endGrid = v;
    }


    //移动
    public navigationMove(closeList: grid[]) {
        //从第0个点开始移动
        var moveIndex = 0;
        this.tweenMove(moveIndex, closeList);

        console.log("导航结束:", closeList.length);
    }


    tweenMove(nextIndex: number, closeList: grid[]) {
        this.node.rotation
        var self = this;
        //如果下一个目标点是障碍
        if (closeList[nextIndex].isObstacle) {
            //重新寻路
            if (nextIndex > 0) {
                this.startGrid = closeList[nextIndex];
                this._tankManager.startNav(this);
            }
            return;
        }

        var targetEular = nextIndex + 1 < closeList.length ? this.getAngleByTwoPos(closeList[nextIndex], closeList[nextIndex + 1]) : new Vec3(this.node.eulerAngles.x, this.node.eulerAngles.y, this.node.eulerAngles.z);
        tween(this.node).to(0.5, { position: closeList[nextIndex].node.getPosition(), eulerAngles: targetEular }, {
            onUpdate: () => {
            },
            onComplete: () => {
                if (nextIndex < closeList.length - 1) {
                    nextIndex++;
                    self.tweenMove(nextIndex, closeList);
                }
                else {
                    console.log("移动完毕");
                }
                //设置障碍属性--------------------------------------------
                if (closeList[nextIndex].parent) {
                    //当前map状态
                    closeList[nextIndex].parent.isObstacle = false;
                    //原始map状态
                    this._tankManager.gManager.gridComponentArr[closeList[nextIndex].parent.cellX][closeList[nextIndex].parent.cellY].isObstacle=false;
                }
                closeList[nextIndex].isObstacle = true;
                this._tankManager.gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle=true;
                //同步所有状态
                this._tankManager.synGridCollectionState();
                //-------------------------------------------------------
            }
        }).start();
    }


    getAngleByTwoPos(g1: grid, g2: grid): Vec3 {
        var angle = new Vec3(0, 0, 0);
        if (g1.cellX == g2.cellX) {
            if (g1.cellY < g2.cellY) {
                angle.z = 90;
            } else {
                angle.z = -90;
            }
        }
        if (g1.cellY == g2.cellY) {
            if (g1.cellX < g2.cellX) {
                angle.z = 0;
            } else {
                angle.z = 180;
            }
        }
        return angle;
    }


    update(deltaTime: number) {

    }
}


