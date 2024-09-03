import { _decorator, Animation, Collider2D, Color, Component, Contact2DType, IPhysics2DContact, Node, Sprite, tween, Vec2, Vec3 } from 'cc';
import { element } from './element';
import { grid } from '../grid';
import { aStar } from '../core/aStar';
import { gridManager } from '../gridManager';
import { tankManager } from '../tankManager';
import { bullet } from '../bullet';
const { ccclass, property } = _decorator;

@ccclass('boy01')
export class boy01 extends element {

    constructor() {
        super();
        //初始化config的key
        this._key = "boy01";
    }
    private animClip: Animation;

    start(): void {
        this.nodeCollider = this.getComponent(Collider2D);
        this.nodeCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        //设置移动速度
        this.moveSpeed = 0.2;

        this.getComponent(aStar).key = this._key
        //默认动画
        this.animClip = this.node.getComponent(Animation);
    }

    //移动核心逻辑
    override tweenMove(nextIndex: number, closeList: grid[]) {
        if (!this.node) {
            return;
        }
        var star = this.getComponent(aStar);
        this._gManager = this.node.parent.parent.getComponent(gridManager)
        this._tankManager = this.node.parent.parent.getComponent(tankManager);
        //判断当前tank是否存在
        if (!this.node) {
            return;
        }
        star.startGrid = closeList[nextIndex];
        if (closeList.length == 0) {
            alert("错误的closeList长度")
        }
        //到达最后一个点,移动结束
        if (nextIndex == closeList.length - 1) {
            this.node.active = false;
            this.destorySelf();
            return;
        }
        //是否暂停
        if (this.isPause) {
            this._stopIndex = nextIndex;
            this._closeList = closeList;
            return;
        }

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
                var twMove = tween(this.node).to(this.moveSpeed, { position: closeList[nextIndex].getPosition() }, {
                    onUpdate: () => {
                    },
                    onComplete: () => {
                        //射击部分---------------------------------------
                        //设置当前tank坐标
                        star.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY)
                        //目标坦克
                        var targetTank = this.tManager.searchAttakTarget(this);
                        //攻击源坦克
                        twMove.removeSelf();
                        if (nextIndex + 1 <= closeList.length - 1) {
                            //车辆转弯   
                            var radian = Math.atan2(closeList[nextIndex + 1].cellY - closeList[nextIndex].cellY, closeList[nextIndex + 1].cellX - closeList[nextIndex].cellX);
                            var targetRot = radian * (180 / Math.PI);
                            if (this.node.eulerAngles.z !== targetRot) {
                                switch (targetRot) {
                                    case -90:
                                        this.animClip.play('boy01_down');
                                        break;
                                    case 90:
                                        this.animClip.play('boy01_up');
                                        break;
                                    case 0:
                                        this.animClip.play('boy01_right');
                                        break
                                    case 180:
                                        this.animClip.play('boy01_left');
                                }
                            }
                            //继续移动
                            nextIndex++;
                            this.tweenMove(nextIndex, closeList);
                        }
                        else {

                        }
                        //-----------------------------------------------

                    }
                }).start();
            }
            //更新格子
            this.gManager.upDataObstale();

        }
        //list最后一个不设置Obstale
        else {
            star.nodeInGridCellIndex = new Vec2(-1, -1);
        }


    }


    //碰撞检测函数
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        var bu: bullet = otherCollider.getComponent(bullet);
        if (bu.tankParent != this) {
            //不是一队的 产生伤害
            if (bu.bulletType != this._team) {
                setTimeout(() => {
                    this.hp -= 50;
                }, 0);
                if (this.hp > 0) {
                    //还可以扛
                } else {
                    //停止连续射击  等待一帧
                    if (!this.die) {
                        this.die = true;
                        setTimeout(() => {
                            this.destorySelf();
                        }, 0);
                    }
                }
                //下一帧执行 物理逻辑 不能在碰撞回调中调用(不能放在最外层 会被同队伍的对象截断碰撞)
                setTimeout(() => {
                    bu.node.destroy();
                }, 0);
            }
        }
    }

    update(deltaTime: number) {

    }
}


