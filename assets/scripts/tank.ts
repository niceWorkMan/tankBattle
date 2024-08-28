import { _decorator, Color, Component, log, math, Node, Sprite, tween, Vec2, Vec3 } from 'cc';
import { grid } from './grid';
import { aStar } from './core/aStar';
import { tankManager } from './tankManager';
import { enumTeam } from './common/enumTeam';
const { ccclass, property } = _decorator;

@ccclass('tank')
export class tank extends Component {
    start() {

    }
    //坦克移动单元格时间
    private moveSpeed = 0.2;
    //坦克转向时间
    private rotateSpeed = 0.3;
    //等待障碍物时间 单位/秒
    private _waitObsTime = 0.5;
    public get waitObsTime(): number {
        return this._waitObsTime;
    }


    //当前所属队伍
    private _team: enumTeam;
    public get team(): enumTeam {
        return this._team
    }
    public set team(v: enumTeam) {
        this._team = v;
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
    private _aStar: aStar;
    public set aaStar(v: aStar) {
        this._aStar = v;
    }
    public get aaStar(): aStar {
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
    //开始导航
    startNav() {
        if (!this.aaStar) {
            //生成导航网格
            this.aaStar = new aStar(this.tankManager.gManager);
            this.aaStar.tk = this;
            this.aaStar.tankManager = this.tankManager;
            //添加至导航集合
            var dex = this.tankManager.aStartCollection.indexOf(this.aaStar);
            if (dex == -1) {
                this.tankManager.aStartCollection.push(this.aaStar);
            }
            //tk赋值
        } else {
            //同步基础网格状态

            this.aaStar.synGridState(this.tankManager.gManager);

        }
        this.aaStar.tk = this;
        //寻路
        if (this.aaStar)
            this.aaStar.getPriceMixNeighborGrid(this.aaStar.gridNodeArr[this.startGrid.cellX][this.startGrid.cellY], this.aaStar.gridNodeArr[this.endGrid.cellX][this.endGrid.cellY]);
    }

    //移动
    public navigationMove(closeList: grid[]) {
        //从第0个点开始移动
        var moveIndex = 0;
        this.tweenMove(moveIndex, closeList);

        console.log("导航结束:", closeList.length);
    }


    tweenMove(nextIndex: number, closeList: grid[]) {
        if (closeList.length == 0) {
            alert("错误的closeList长度")
        }
        //更新属性
        var refreshState = () => {
            //设置障碍属性--------------------------------------------
            if (closeList[nextIndex].parent) {
                //当前map状态
                closeList[nextIndex].parent.isObstacle = false;
                //原始map状态
                this._tankManager.gManager.gridComponentArr[closeList[nextIndex].parent.cellX][closeList[nextIndex].parent.cellY].isObstacle = false;
            }
            closeList[nextIndex].isObstacle = true;
            this._tankManager.gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = true;
            //同步所有状态
            this._tankManager.synGridCollectionState();
            //-------------------------------------------------------
        }


        //如果下一个目标点是障碍
        if (closeList[nextIndex].isObstacle) {
            //重新寻路
            //等待障碍离开继续前进
            setTimeout(() => {
                // this.startGrid = closeList[nextIndex];
                // this._tankManager.startNav(this);
                this.tweenMove(nextIndex, closeList);
            }, this._waitObsTime * 1000);
        }
        else {
            if (nextIndex + 1 <= closeList.length - 1) {
                //位移
                tween(this.node).to(this.moveSpeed, { position: closeList[nextIndex].getPosition() }, {
                    onUpdate: () => {
                    },
                    onComplete: () => {
                        if (nextIndex <= closeList.length - 1) {
                            //转弯
                            var radian = Math.atan2(closeList[nextIndex + 1].cellY - closeList[nextIndex].cellY, closeList[nextIndex + 1].cellX - closeList[nextIndex].cellX);
                            var targetRot = radian * (180 / Math.PI);
                            if (this.node.eulerAngles.z !== targetRot) {
                                tween(this.node).to(this.rotateSpeed, { eulerAngles: new Vec3(0, 0, targetRot) }, {
                                    onComplete: () => {
                                        nextIndex++;
                                        this.tweenMove(nextIndex, closeList);
                                        //更新网格属性
                                        refreshState();
                                    }
                                }).start();
                            }
                            else {
                                nextIndex++;
                                this.tweenMove(nextIndex, closeList);
                            }
                        }
                        else {
                            console.log("单格子移动完毕");
                        }
                        //更新网格属性
                        refreshState();
                    }
                }).start();
            }
            else {
                //最后一步特殊处理
                tween(this.node).to(this.moveSpeed, { position: closeList[closeList.length - 1].getPosition() }, {
                    onComplete: () => {
                        console.log("该路线移动完毕");
                        //更新网格属性
                        closeList[nextIndex].isObstacle = false;
                        this._tankManager.gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = false;
                        //同步所有状态
                        this._tankManager.synGridCollectionState();

                        //test 销毁
                        this.destorySelf();
                    },
                }).start();
            }

        }

    }

    destorySelf() {
        this.node.destroy()
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

    protected onDestroy(): void {
        if (this.aaStar.isValid) {
            this.aaStar==null;
        }
    }
}


