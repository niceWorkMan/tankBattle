import { _decorator, Collider2D, Color, Component, Contact2DType, instantiate, IPhysics2DContact, log, math, Node, resources, Sprite, tween, Vec2, Vec3 } from 'cc';
import { grid } from './grid';
import { aStar } from './core/aStar';
import { tankManager } from './tankManager';
import { enumTeam } from './common/enumTeam';
import { bullet } from './bullet';
const { ccclass, property } = _decorator;

@ccclass('tank')
export class tank extends Component {

    private hpComp: Node;
    private firePoint: Node;
    private tankCollider: Collider2D;
    private tankLayer: Node;

    start() {
        this.initComponent();
    }

    initComponent() {
        this.hpComp = this.node.getChildByName("hp");
        this.firePoint = this.node.getChildByName("root").getChildByName("pao").getChildByName("point");
        this.tankLayer = this.tankManager.node.getChildByName("tankLayer");

        this.tankCollider = this.getComponent(Collider2D);

        this.tankCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }



    //坦克移动单元格时间
    private moveSpeed = 0.1;
    //坦克转向时间
    private rotateSpeed = 0.2;
    //等待障碍物时间 单位/秒
    private _waitObsTime = 0.5;
    public get waitObsTime(): number {
        return this._waitObsTime;
    }

    //当前Tank所在格子
    private _tankInGridCellIndex: Vec2;
    public set tankInGridCellIndex(v: Vec2) {
        this._tankInGridCellIndex = v;
    }
    public get tankInGridCellIndex(): Vec2 {
        return this._tankInGridCellIndex;
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



    //射程
    private _attackDis = 6;
    public set attackDis(v: number) {
        this._attackDis = v;
    }
    public get attackDis(): number {
        return this._attackDis
    }


    //目标坦克距离(用来存储 做排序继续拿)
    private _targetDis;
    public set targetDis(v: number) {
        this._targetDis = v;
    }
    public get targetDis(): number {
        return this._targetDis;
    }

    //目标tank
    private _targetTank: tank;
    public set targetTank(v: tank) {
        this._targetTank = v;
    }
    public get targetTank(): tank {
        return this._targetTank
    }


    //由于设计停止移动,在closelist中的位置
    private _stopIndex: number;
    public set stopIndex(v: number) {
        this._stopIndex = v;
    }
    public get stopIndex(): number {
        return this._stopIndex;
    }


    //路径
    private _closeList: grid[];
    public set closeList(v: grid[]) {
        this._closeList = v;
    }
    public get closeList(): grid[] {
        return this._closeList
    }


    //Hp(血条)
    private _hp: number = 100;
    public set hp(v: number) {
        if (v < 100) {
            this.hpComp.active = true;
            // if (this._hp <= 0) {
            //     this.getComponent(Sprite).color = new Color(0, 0, 0, 255);
            //     if (this.tankInGridCellIndex) {
            //         var dex = this.tankInGridCellIndex;
            //         this.tankManager.gManager.gridComponentArr[dex.x][dex.y].isObstacle = false;
            //         this.tankManager.synGridCollectionState();
            //         setTimeout(() => {
            //             this.destorySelf();
            //         }, 1000);
            //     }
            // }
        }
        this._hp = v;
    }
    public get hp(): number {
        return this._hp;
    }






    public damage() {

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
            //寻路
            this.aaStar.getPriceMixNeighborGrid(this.aaStar.gridNodeArr[this.startGrid.cellX][this.startGrid.cellY], this.aaStar.gridNodeArr[this.endGrid.cellX][this.endGrid.cellY]);
        } else {
            //同步基础网格状态
            this.tankManager.synGridCollectionState();
            //寻路
            if (this.tankInGridCellIndex) {

                //重新设置起点
                this.startGrid = this.aaStar.gridNodeArr[this.startGrid.cellX][this.startGrid.cellY];
                this.startGrid.isObstacle = false;
                //重置数据
                this.aaStar.resetGridArr();
                //重新寻路
                this.aaStar.getPriceMixNeighborGrid(this.aaStar.gridNodeArr[this.tankInGridCellIndex.x][this.tankInGridCellIndex.y], this.aaStar.gridNodeArr[this.endGrid.cellX][this.endGrid.cellY]);
            }
            else
                console.warn("没有当前的Tank所在格子位置,可能是tank未开始移动")
        }
        this.aaStar.tk = this;
    }

    //移动
    public navigationMove(closeList: grid[]) {
        //从第0个点开始移动
        var moveIndex = 0;
        this.tweenMove(moveIndex, closeList);

        console.warn("导航结束:", closeList.length);
    }


    tweenMove(nextIndex: number, closeList: grid[]) {

        this.tankInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY);
        this.startGrid = closeList[nextIndex];
        if (closeList.length == 0) {
            alert("错误的closeList长度")
        }
        //更新属性（占用2个格子的目标）
        var refreshState = () => {
            //设置障碍属性--------------------------------------------
            if (nextIndex - 1 >= 0) {
                this._tankManager.gManager.gridComponentArr[closeList[nextIndex - 1].cellX][closeList[nextIndex - 1].cellY].isObstacle = false;
            }
            this._tankManager.gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = true;
            //同步所有状态

            this._tankManager.synGridCollectionState();
            //-------------------------------------------------------
        }

        var newNavi = () => {
            setTimeout(() => {
                //this.startGrid = closeList[nextIndex];
                //this.tweenMove(nextIndex, closeList);
                this._tankManager.gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = false;
                if (nextIndex - 1 > 0)
                    this._tankManager.gManager.gridComponentArr[closeList[nextIndex - 1].cellX][closeList[nextIndex - 1].cellY].isObstacle = false;
                this.tankManager.synGridCollectionState();
                this.startNav();
                //this.destorySelf();
                //this.startNav();
            }, this._waitObsTime * 500);
        }
        //如果下一个目标点是障碍
        if (this._tankManager.gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle) {
            //重新寻路
            //等待障碍离开继续前进
            if (nextIndex + 1 < closeList.length - 1) {
                if (this._tankManager.gManager.gridComponentArr[closeList[nextIndex + 1].cellX][closeList[nextIndex + 1].cellY].isObstacle) {
                    newNavi();
                    return;
                }
            }
            newNavi();
        }
        else {
            //
            if (nextIndex + 1 <= closeList.length - 1) {
                //不是相邻格子
                if (Math.abs(closeList[nextIndex].cellX - closeList[nextIndex + 1].cellX) > 1 || Math.abs(closeList[nextIndex].cellY - closeList[nextIndex + 1].cellY) > 1) {
                    this.getComponent(Sprite).color = new Color(0, 0, 0, 225)
                    this.startNav();
                    return;
                }
                //设置当前tank所在格子
                //位移
                var twMove = tween(this.node).to(this.moveSpeed, { position: closeList[nextIndex].getPosition() }, {
                    onUpdate: () => {
                    },
                    onComplete: () => {
                        //射击部分---------------------------------------
                        var targetTank = this.tankManager.searchAttakTarget(this);

                        twMove.removeSelf();
                        if (nextIndex <= closeList.length - 1) {
                            //转弯
                            var radian = Math.atan2(closeList[nextIndex + 1].cellY - closeList[nextIndex].cellY, closeList[nextIndex + 1].cellX - closeList[nextIndex].cellX);
                            var targetRot = radian * (180 / Math.PI);
                            if (this.node.eulerAngles.z !== targetRot) {
                                var twRotate = tween(this.node).to(this.rotateSpeed, { eulerAngles: new Vec3(0, 0, targetRot) }, {
                                    onComplete: () => {
                                        twRotate.removeSelf();

                                        //没有目标 移动
                                        if (!targetTank) {
                                            nextIndex++;
                                            this.tweenMove(nextIndex, closeList);
                                            //更新网格属性
                                            refreshState();
                                        }
                                        //找到目标,停止移动开始射击
                                        else {
                                            if (targetTank.tankInGridCellIndex) {
                                                this._stopIndex = nextIndex;
                                                this._closeList = closeList;
                                                this.attackTarget(targetTank);
                                            } else {
                                                nextIndex++;
                                                this.tweenMove(nextIndex, closeList);
                                                //更新网格属性
                                                refreshState();
                                            }

                                        }
                                    }
                                }).start();
                            }
                            else {
                                //没有目标 移动
                                if (!targetTank) {
                                    nextIndex++;
                                    this.tweenMove(nextIndex, closeList);
                                    //更新网格属性
                                    refreshState();
                                }
                                //找到目标,停止移动开始射击
                                else {
                                    //有坐标信息后打击
                                    if (targetTank.tankInGridCellIndex) {
                                        this._stopIndex = nextIndex;
                                        this._closeList = closeList;
                                        this.attackTarget(targetTank);
                                    } else {
                                        nextIndex++;
                                        this.tweenMove(nextIndex, closeList);
                                        //更新网格属性
                                        refreshState();
                                    }

                                }
                            }
                        }
                        else {
                            console.warn("单格子移动完毕");
                        }
                        //更新网格属性
                        refreshState();
                        //-----------------------------------------------




                    }
                }).start();
            }
            else {
                //最后一步特殊处理
                var twLast = tween(this.node).to(this.moveSpeed, { position: closeList[closeList.length - 1].getPosition() }, {
                    onComplete: () => {
                        twLast.removeSelf();
                        console.warn("该路线移动完毕");
                        //更新网格属性
                        this._tankManager.gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = false;
                        //同步所有状态
                        this._tankManager.synGridCollectionState();
                        //销毁对象
                        this.destorySelf();
                    },
                }).start();
            }

        }

    }

    destorySelf() {
        //从数组中移除
        var dex = this.tankManager.tankCollection.indexOf(this);
        this.tankManager.tankCollection.splice(dex, 1);
        //销毁坦克节点
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

        }
    }



    //攻击
    public attackTarget(target: tank) {
        var root: Node = this.node.getChildByName("root");
        if (target.tankInGridCellIndex) {
            var radian = Math.atan2(target.tankInGridCellIndex.y - this.tankInGridCellIndex.y, target.tankInGridCellIndex.x - this.tankInGridCellIndex.x);
            var targetRot = radian * (180 / Math.PI);
            if (root.eulerAngles.z !== targetRot) {
                var tw = tween(root).to(this.rotateSpeed, { eulerAngles: new Vec3(0, 0, targetRot - this.node.eulerAngles.z) }, {
                    onComplete: () => {
                        console.log("转向完成");
                        //生成子弹
                        if (this.team == enumTeam.teamRed) {
                            this.spawnBullet();
                        }
                    }
                }).start();
            }
        } else {
            console.log("没有打积点");
        }

    }



    public spawnBullet() {
        var bulletNode: Node = instantiate(this.tankManager.bulletBase);
        //设置父类
        this.tankLayer.addChild(bulletNode);
        bulletNode.getComponent(bullet).tankParent = this;
        bulletNode.position = this.node.position;

        var twLast = tween(bulletNode).to(3, { position: this.targetTank.node.position }, {
            onComplete: () => {
            },
        }).start();
    }


    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        var bu: bullet = otherCollider.getComponent(bullet);
        if (bu.tankParent != this) {
            alert("碰撞2")
            //不是一队的 产生伤害
            if (bu.bulletType != this._team) {
                this.hp -= 20;
                //otherCollider.node.destroy();
                if(this.hp>0){
                    bu.tankParent.spawnBullet();
                }
            }
        }
    }
}


