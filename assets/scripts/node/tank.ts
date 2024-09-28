import { _decorator, Animation, Collider2D, color, Color, Component, Contact2DType, instantiate, IPhysics2DContact, lerp, log, math, Node, resources, Sprite, TERRAIN_SOUTH_INDEX, Tween, tween, Vec2, Vec3 } from 'cc';
import { enumTeam } from '../common/enumTeam';
import { element } from './element';
import { aStar } from '../core/aStar';
import { gridManager } from '../gridManager';
import { tankManager } from '../tankManager';
import { grid_c } from '../core/grid_c';
import { bullet } from '../bullet/bullet';
import { pool } from '../core/pool';
import { base } from './base';
import { buildType } from '../common/buildType';
import { editorManager } from '../editorManager';
const { ccclass, property } = _decorator;

@ccclass('tank')
export class tank extends element {
    constructor() {
        super();
        //初始化config的key
        this._key = "tank";
        //不属于建筑类型
        this.buildType = buildType.none;
        //设置射程
        this._attackDis = 6
    }

    private _gun: Node

    start(): void {
        //监听碰撞
        this.nodeCollider = this.getComponent(Collider2D);
        this.nodeCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

        this.getComponent(aStar).key = this._key
        this._gun = this.node.getChildByName("root").getChildByName("gun");
    }


    //移动核心逻辑
    override tweenMove(nextIndex: number, closeList: grid_c[]) {

        var star = this.getComponent(aStar);
        //对象池中跳出
        if (this.sleep) {
            return;
        }

        if (!this.node) {
            return;
        }

        //是否暂停
        if (this.isPause) {
            this._stopIndex = nextIndex;
            this._closeList = closeList;
            return;
        }
        //如果不存在
        if (!closeList[nextIndex]) {
            return;
        }

        this._gManager = this.node.parent.parent.getComponent(gridManager)
        this._tankManager = this.node.parent.parent.getComponent(tankManager);


        //判断当前tank是否存在
        if (!this.node) {
            return;
        }
        star.startGrid = this._gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY];
        if (closeList.length == 0) {
            console.log("错误的closeList长度");
        }
        //到达最后一个点,移动结束
        //如果下一个目标点是障碍
        if (nextIndex + 1 <= closeList.length - 1) {
            //更新当前坐标
            star.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY);
            //检测下个坐标是否有障碍物
            if (this._gManager.gridComponentArr[closeList[nextIndex + 1].cellX][closeList[nextIndex + 1].cellY].isObstacle) {
                star.startNav();
            }
            else {
                //不是相邻格子
                if (Math.abs(closeList[nextIndex].cellX - closeList[nextIndex + 1].cellX) > 1 || Math.abs(closeList[nextIndex].cellY - closeList[nextIndex + 1].cellY) > 1) {
                    this.getComponent(Sprite).color = new Color(0, 0, 0, 225)
                    //重新寻路时,当前格子一定要清空障碍属性；
                    this._gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = false;
                    //重新导航
                    star.startNav();
                    return;
                }
                //位移
                if (this.lastTweenMove) {
                    this.lastTweenMove.removeSelf();
                    this.lastTweenMove = null;
                }
                this.lastTweenMove = tween(this.node).to(this.moveSpeed, { position: this.node.getComponent(aStar).getPosition(closeList[nextIndex]) }, {
                    onUpdate: () => {
                    },
                    onComplete: () => {
                        if (this.isPause || this.sleep) {
                            // 动画带delay 再次判断是否需要跳出
                            return;
                        }
                        //不存在了
                        if (!closeList[nextIndex]) {
                            return;
                        }
                        //射击部分---------------------------------------
                        //设置当前tank坐标
                        star.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY)
                        //移除动画
                        if (this.lastTweenMove) {
                            this.lastTweenMove.removeSelf();
                            this.lastTweenMove = null;
                        }
                        else {
                            //没有动画了就清空了
                            this.stopIndex = null;
                            nextIndex = closeList.length - 1;
                            closeList.length = 0;
                            return;
                        }
                        //目标坦克
                        //攻击源坦克

                        if (nextIndex + 1 <= closeList.length - 1) {
                            //车辆转弯   
                            var radian = Math.atan2(closeList[nextIndex + 1].cellY - closeList[nextIndex].cellY, closeList[nextIndex + 1].cellX - closeList[nextIndex].cellX);
                            var targetRot = radian * (180 / Math.PI);
                            if (this.node.eulerAngles.z !== targetRot) {
                                this.node.eulerAngles = new Vec3(0, 0, targetRot);
                                //攻击
                                var targetTank = this.tManager.searchAttakTarget(this);
                                if (targetTank) {
                                    if (targetTank.sleep == false) {
                                        if (targetTank.getComponent(aStar).nodeInGridCellIndex) {
                                            this._stopIndex = nextIndex;
                                            this._closeList = closeList;
                                            //攻击
                                            this.attackTarget(targetTank, nextIndex, closeList);
                                            return;
                                        }
                                    }
                                    targetTank.destroyTarget();
                                } else {
                                    //炮筒转到正向(局部eular角)
                                    var root: Node = this.node.getChildByName("root");
                                    root.eulerAngles = new Vec3(0, 0, 0);
                                }
                            }

                            //不是
                            if (!this.sleep) {
                                //继续移动
                                nextIndex++;
                                this.tweenMove(nextIndex, closeList);
                            }
                        }
                        else {
                        }
                        //-----------------------------------------------

                    }
                }).start();
            }
            //更新格子 （占位）
            //this._gManager.upDataObstale();

        }
        //最后一个格子
        else {
            //判断是否真的移动到终点
            if (star.endGrid == star.finalGrid) {
                if (this.node) {
                    this.destorySelf();
                }
            }
            else {
                //设置结束点为最终终点
                star.endGrid = star.finalGrid
                star.nodeInGridCellIndex = new Vec2(star.endGrid.cellX, star.endGrid.cellY);
                //继续导航
                star.startNav();
            }
        }


    }


    protected onDestroy(): void {
    }



    public generateBullet(target, stopIndex, closeList) {
        //红方生成子弹
        if (this.team == enumTeam.teamRed) {
            //下一帧执行 物理逻辑 不能在碰撞回调中调用
        }
        //随机开炮速度
        //this._fireSpace = Math.random();
        if (this._fireInterval) {
            clearInterval(this._fireSpace);
        }
        this._fireInterval = setInterval(() => {
            //自身存在&&目标也存在
            if (this.node && target.node) {
                if (target.sleep == false) {
                    //播放炮动画
                    var anim: Animation = this._gun.getComponent(Animation);
                    anim.play("fire_t001")
                    this.spawnBullet(target);
                } else {
                    //停止射击  继续前进
                    clearInterval(this._fireInterval);
                    if (!this.sleep)
                        this.tweenMove(stopIndex, closeList);
                }
            }
            else {
                //停止射击  继续前进
                clearInterval(this._fireInterval);
                if (!this.sleep)
                    this.tweenMove(stopIndex, closeList);
            }
        }, this._fireSpace * 1000);

    }


    //攻击
    public attackTarget(target: base, stopIndex: number, closeList: grid_c[]) {
        if (this.isPause) {
            return;
        }

        var root: Node = this.node.getChildByName("root");
        if (target.getComponent(aStar).nodeInGridCellIndex) {
            var targetEular: Vec3 = this.tManager.convertEularForParent(root);
            root.setWorldRotationFromEuler(0, 0, targetEular.z)
        }

        if (target.sleep == false) {
            //生成子弹
            this._fireInterval = setInterval(() => {
                //自身存在&&目标也存在
                if (this.tManager.nodeCollection.indexOf(target) != -1) {
                    if (target.sleep || this.sleep) {
                        this._targetNode = null;
                        clearInterval(this._fireInterval);
                        //移动
                        if (target.sleep) {
                            this.tweenMove(stopIndex, closeList);
                        }
                        return
                    }
                    var anim: Animation = this._gun.getComponent(Animation);
                    anim.play("fire_t001")
                    this.spawnBullet(target);
                }
                else {
                    this._targetNode = null;
                    clearInterval(this._fireInterval);
                    //移动
                    this.tweenMove(stopIndex, closeList);
                }

            }, this._fireSpace * 200);
        }
        else {
            this._targetNode = null;
            clearInterval(this._fireInterval);
            //移动
            this.tweenMove(stopIndex, closeList);
        }
    }





    //旋转对方炮筒
    public gunRote(target: base) {
        var root: Node = this.node.getChildByName("root");
        if (target.node) {
            var radian = Math.atan2(target.node.position.y - this.node.position.y, target.node.position.x - this.node.position.x);
            var targetRot = radian * (180 / Math.PI);
            //目标转角（弧度）
            root.setWorldRotationFromEuler(0, 0, targetRot);
        } else {
            //没有打击点
        }
    }


    //生成子弹
    public spawnBullet(target: base) {
        if (this.sleep)
            return;
        var nodeLayer = this.node.parent.parent.getChildByName("tankLayer");
        //对象池
        var po: pool = this.node.parent.parent.getComponent(pool)
        var edt:editorManager=this.node.parent.parent.getComponent(editorManager)
        //获取对应的类和Prefab
        var key = "bulletTank";
        var cofResult = edt.propertyConfig[key]
        var bulletNode: Node = po.spawnBullet("bulletTank", nodeLayer)
        //获取类型
        var bClass: any = bulletNode.getComponent(cofResult.class);
        //设置父类
        var targetPos = target.node.getPosition();
        var selfPos = this.node.getPosition();
        var radian = Math.atan2(targetPos.y - selfPos.y, targetPos.x - selfPos.x);
        var targetRot = radian * (180 / Math.PI);
        bulletNode.eulerAngles = new Vec3(0, 0, targetRot)
        bulletNode.getComponent(bullet).bulletType = this.team;
        bulletNode.getComponent(bullet).attackParent = this;
        bulletNode.worldPosition = this.node.getChildByName("root").getChildByName("gun").getChildByName("point").worldPosition;

        //子弹运动方向(运动到目标点)
        if (target) {
            if (bClass.bTween != null) {
                bClass.bTween.removeSelf();
            }
            bClass.bTween = tween(bulletNode).to(0.5, { position: target.node.position }, {
                onComplete: () => {
                    if (bulletNode) {
                        bClass.bTween.removeSelf();
                        var b: any = bulletNode.getComponent(cofResult.class);
                        if (b.sleep == false) {
                            b.sleep = true;
                        }

                    }
                },
            }).start();
        }
    }


    //碰撞检测函数
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    }


    protected override pause(p: boolean): void {
        if (p) {
            if (this._fireInterval) {
                clearInterval(this._fireInterval);
            }
        }
    }




    update(deltaTime: number) {
        this.updateGunRotation(deltaTime);
    }

    //更新炮口旋转
    updateGunRotation(deltaTime: number) {
        if (this.targetNode) {
            if (!this.isPause && !this.sleep) {
                this.gunRote(this.targetNode);
            }
        }
    }
}


