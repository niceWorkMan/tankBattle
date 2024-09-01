import { _decorator, Collider2D, color, Color, Component, Contact2DType, instantiate, IPhysics2DContact, log, math, Node, resources, Sprite, tween, Vec2, Vec3 } from 'cc';
import { grid } from './grid';
import { aStar } from './core/aStar';
import { tankManager } from './tankManager';
import { enumTeam } from './common/enumTeam';
import { bullet } from './bullet';
import { gridManager } from './gridManager';
const { ccclass, property } = _decorator;

@ccclass('tank')
export class tank extends Component {

    private hpComp: Node;
    private tankCollider: Collider2D;
    private tankLayer: Node;

    start() {
        this.initComponent();
    }

    initComponent() {
        this.tManager = this.node.parent.parent.getComponent(tankManager);
        console.log("tankManager", this.tManager);

        this.gManager = this.node.parent.parent.getComponent(gridManager);
        this.hpComp = this.node.getChildByName("hp");
        if (this.tManager.node) {
            this.tankLayer = this.tManager.node.getChildByName("tankLayer");
        }
        else {
            alert("设置Layer失败")
        }


        //监听碰撞
        this.tankCollider = this.getComponent(Collider2D);
        this.tankCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

        //获取导航网格
        this.star = this.getComponent(aStar);
        this.star.tk = this;
        this.star.tManager = this.tManager;
        //添加至导航集合
        var dex = this.tManager.aStartCollection.indexOf(this.star);
        if (dex == -1) {
            this.tManager.aStartCollection.push(this.star);
        }
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
    public set tManager(v: tankManager) {
        this._tankManager = v;
    }
    public get tManager(): tankManager {
        return this._tankManager
    }

    //网格管理类
    private _gManager: gridManager;
    public set gManager(v: gridManager) {
        this._gManager = v;
    }
    public get gManager(): gridManager {
        return this._gManager
    }


    //aStart;
    private _aStar: aStar;
    public set star(v: aStar) {
        this._aStar = v;
    }
    public get star(): aStar {
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


    //当前站位的格子
    private _inObstaleGrid: grid;
    public get inObstaleGrid(): grid {
        return this._inObstaleGrid
    }



    //Hp(血条)
    private _hp: number = 100;
    public set hp(v: number) {
        if (v < 100 && v > 0) {
            this.hpComp.active = true;
            this.hpComp.getChildByName("forward").getComponent(Sprite).fillStart = 1 - v / 100;
        } else {
            this.hpComp.active = false;
        }
        this._hp = v;
    }
    public get hp(): number {
        return this._hp;
    }



    //死亡状态
    private _die: boolean = false;

    public set die(v: boolean) {
        this._die = v;
    }
    public get die(): boolean {
        return this._die
    }


    //开火间隔时间
    private _fireSpace: number = 1;
    public set fireSpace(v: number) {
        this._fireSpace = v;
    }
    public get fireSpace(): number {
        return this._fireSpace;
    }

    //开始导航
    startNav() {
        if (!this.star) {
            this.star = this.getComponent(aStar);
        }
        //重置数据
        this.star.resetGridArr();
        this.tManager.synCurrentState(this._aStar);
        //----------------------------------------------------
        //同步基础网格状态
        //寻路
        this.startGrid.cellX = this.tankInGridCellIndex.x;
        this.startGrid.cellY = this.tankInGridCellIndex.y;

        this.star.getPriceMixNeighborGrid(this.star.gridNodeArr[this.startGrid.cellX][this.startGrid.cellY], this.star.gridNodeArr[this.endGrid.cellX][this.endGrid.cellY]);
        this.star.tk = this;
    }

    //开始移动
    public navigationMove(closeList: grid[]) {
        if (!this.node)
            return;
        //从第0个点开始移动
        var moveIndex = 0;
        setTimeout(() => {
            this.tweenMove(moveIndex, closeList);
            console.warn("导航结束:", moveIndex, closeList.length);
            // closeList.forEach(element => {
            //     console.log(element.cellX, element.cellY);
            //     if(this.node)
            //     this.gManager.gridComponentArr[element.cellX][element.cellY].setSpriteColor({ r: 0, g: 0, b: 0, a: 200 })
            // });
        }, 0);

    }

    //移动核心逻辑
    tweenMove(nextIndex: number, closeList: grid[]) {
        //判断当前tank是否存在
        if (!this.node) {
            return;
        }
        this.tankInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY);
        this.startGrid = closeList[nextIndex];
        if (closeList.length == 0) {
            alert("错误的closeList长度")
        }
        //如果下一个目标点是障碍
        if (this._gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle) {
            //重新寻路时,当前格子一定要清空障碍属性；
            this._gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = false;
            this.startNav();
        }
        else {
            if (nextIndex + 1 <= closeList.length - 1) {
                //不是相邻格子
                if (Math.abs(closeList[nextIndex].cellX - closeList[nextIndex + 1].cellX) > 1 || Math.abs(closeList[nextIndex].cellY - closeList[nextIndex + 1].cellY) > 1) {
                    this.getComponent(Sprite).color = new Color(0, 0, 0, 225)
                    //重新寻路时,当前格子一定要清空障碍属性；
                    this._gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = false;
                    //重新导航
                    this.startNav();
                    return;
                }
                //位移
                var twMove = tween(this.node).to(this.moveSpeed, { position: closeList[nextIndex].getPosition() }, {
                    onUpdate: () => {
                    },
                    onComplete: () => {
                        //射击部分---------------------------------------
                        //设置当前tank坐标
                        this.tankInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY)
                        //更新占位
                        this.updateTankMoveObstacle(nextIndex, closeList);
                        //目标坦克
                        var targetTank = this.tManager.searchAttakTarget(this);
                        //攻击源坦克
                        twMove.removeSelf();
                        if (nextIndex + 1 <= closeList.length - 1) {
                            //车辆转弯   
                            var radian = Math.atan2(closeList[nextIndex + 1].cellY - closeList[nextIndex].cellY, closeList[nextIndex + 1].cellX - closeList[nextIndex].cellX);
                            var targetRot = radian * (180 / Math.PI);
                            if (this.node.eulerAngles.z !== targetRot) {
                                this.node.eulerAngles = new Vec3(0, 0, targetRot);

                                if (targetTank) {
                                    console.log("攻击", this.node.uuid);

                                    if (targetTank.tankInGridCellIndex) {
                                        this._stopIndex = nextIndex;
                                        this._closeList = closeList;
                                        this.attackTarget(targetTank);
                                        return;
                                    }
                                }
                            }

                            //继续移动
                            nextIndex++;
                            this.tweenMove(nextIndex, closeList);
                        }
                        else {
                            console.warn("单格子移动完毕");
                        }
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
                        //同步所有状态
                        this._tankManager.synGridCollectionState();
                        this.gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = false;
                        if (nextIndex - 1 > 0)
                            this.gManager.gridComponentArr[closeList[nextIndex - 1].cellX][closeList[nextIndex - 1].cellY].isObstacle = false;
                        if (nextIndex + 1 < closeList.length - 1)
                            this.gManager.gridComponentArr[closeList[nextIndex + 1].cellX][closeList[nextIndex + 1].cellY].isObstacle = false;
                        this.tManager.synGridCollectionState();
                        //销毁对象
                        this.destorySelf();
                    },
                }).start();
            }

        }

    }


    //销毁
    destorySelf() {
        //销毁当前网格障碍
        // if (this.tankInGridCellIndex)
        //     this.gManager.gridComponentArr[this, this.tankInGridCellIndex.x][this, this.tankInGridCellIndex.y].isObstacle = false;


        for (var i = 0; i < this.gManager.getGridMatrix.row; i++) {
            var _compArr_ins: grid[] = [];
            for (var j = 0; j < this.gManager.getGridMatrix.colum; j++) {
                if (this.gManager.gridComponentArr[i][j].moveObstaleParent == this) {
                    this.gManager.gridComponentArr[i][j].isObstacle = false;
                }
            }
        }
        this.tManager.synGridCollectionState();
        //从数组中移除
        var dex = this.tManager.tankCollection.indexOf(this);
        if (dex != -1) {
            this.tManager.tankCollection.splice(dex, 1);
        }

        //销毁自己
        if (this.node) {
            this.tManager.synGridCollectionRemove(this.star);
            this.node.destroy();
        }

    }


    protected onDestroy(): void {
        if (this.star.isValid) {

        }
    }


    //攻击
    public attackTarget(target: tank) {
        //开炮逻辑
        var attackFunc = () => {
            //红方生成子弹
            if (this.team == enumTeam.teamRed) {
                //下一帧执行 物理逻辑 不能在碰撞回调中调用
            }
            //随机开炮速度
            this._fireSpace = Math.random();
            if (this._fireInterval) {
                clearInterval(this._fireSpace);
            }
            this._fireInterval = setInterval(() => {
                //自身存在&&目标也存在
                if (this.node && target.node) {
                    this.spawnBullet();
                }
                else {
                    //停止射击  继续前进
                    clearInterval(this._fireInterval);
                    this.tweenMove(this.stopIndex, this.closeList);
                }
            }, this._fireSpace * 100);
        }

        //开炮和转向炮管逻辑
        if (target.node) {
            var root: Node = this.node.getChildByName("root");
            if (target.tankInGridCellIndex) {
                var radian = Math.atan2(target.node.position.y - this.node.position.y, target.node.position.x - this.node.position.x);
                var targetRot = radian * (180 / Math.PI);


                var targetEular: Vec3 = this.tManager.convertEularForParent(root);
                root.setWorldRotationFromEuler(0, 0, targetEular.z)
                attackFunc();
            } else {
                this.tweenMove(this.stopIndex, this.closeList);
                console.log("没有打积点");
            }
        } else {
            console.log("打击点已摧毁");
            var targetTank = this.tManager.searchAttakTarget(this);
            this.tweenMove(this.stopIndex, this.closeList);
        }


    }
    //旋转对方炮筒
    public gunRote(target: tank) {
        var root: Node = this.node.getChildByName("root");
        if (target.node) {
            var radian = Math.atan2(target.node.position.y - this.node.position.y, target.node.position.x - this.node.position.x);
            var targetRot = radian * (180 / Math.PI);
            //目标转角（弧度）
            root.setWorldRotationFromEuler(0, 0, targetRot);


        } else {
            console.log("没有打积点");
        }
    }


    //连续发射函数
    private _fireInterval = null;
    public set fireInterva(v: any) {
        this._fireInterval = v;
    }
    public get value(): any {
        return this._fireInterval;
    }

    //生成子弹
    public spawnBullet() {
        var bulletNode: Node = instantiate(this.tManager.bulletBase);
        //设置父类
        this.tankLayer.addChild(bulletNode);
        bulletNode.getComponent(bullet).bulletType = this.team;
        bulletNode.getComponent(bullet).tankParent = this;
        bulletNode.worldPosition = this.node.getChildByName("root").getChildByName("pao").getChildByName("point").worldPosition;

        //子弹运动方向
        if (this.targetTank.node) {
            var twLast = tween(bulletNode).to(0.3, { position: this.targetTank.node.position }, {
                onComplete: () => {
                    bulletNode.destroy();
                    twLast.removeSelf();
                },
            }).start();
        }
    }

    //碰撞检测函数
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        var bu: bullet = otherCollider.getComponent(bullet);
        if (bu.tankParent != this) {
            // alert("碰撞2")
            //不是一队的 产生伤害
            if (bu.bulletType != this._team) {
                this.hp -= 5;
                if (this.hp > 0) {

                } else {
                    //停止连续射击  等待一帧
                    if (!this.die) {
                        this.die = true;
                        setTimeout(() => {
                            this.destorySelf();
                        }, 0);
                    }
                }
            }
            console.log("HP:", this.hp);

            //下一帧执行 物理逻辑 不能在碰撞回调中调用
            setTimeout(() => {
                bu.node.destroy();
            }, 0);
        }
    }




    update(deltaTime: number) {
        this.updateGunRotation(deltaTime);
    }

    //更新炮口旋转
    updateGunRotation(deltaTime: number) {
        if (this.targetTank) {
            this.gunRote(this.targetTank);
        }
    }



    //更新路径障碍坦克
    updateTankMoveObstacle(index: number, closeList: grid[]) {
        for (var i = 0; i < closeList.length; i++) {
            if (i == index) {
                this.gManager.gridComponentArr[closeList[i].cellX][closeList[i].cellY].isObstacle = true;
                //设置产生障碍的父对象
                this.gManager.gridComponentArr[closeList[i].cellX][closeList[i].cellY].moveObstaleParent = this;
                //设置当前的占位格子
                this._inObstaleGrid = this.gManager.gridComponentArr[closeList[i].cellX][closeList[i].cellY];
            }
            else {
                //前后一格的范围
                if (Math.abs(i - index) <= 1)
                   {
                    this.gManager.gridComponentArr[closeList[i].cellX][closeList[i].cellY].isObstacle = false;
                       //设置产生障碍的父对象 移除
                       this.gManager.gridComponentArr[closeList[i].cellX][closeList[i].cellY].moveObstaleParent = null;
                   }
            }
        }
        this.tManager.synGridCollectionState();
    }
}


