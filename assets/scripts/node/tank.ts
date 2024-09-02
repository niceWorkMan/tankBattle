import { _decorator, Collider2D, color, Color, Component, Contact2DType, instantiate, IPhysics2DContact, log, math, Node, resources, Sprite, tween, Vec2, Vec3 } from 'cc';
import { grid } from '../grid';
import { enumTeam } from '../common/enumTeam';
import { bullet } from '../bullet';
import { element } from './element';
const { ccclass, property } = _decorator;

@ccclass('tank')
export class tank extends element {


    //移动核心逻辑
   override tweenMove(nextIndex: number, closeList: grid[]) {
        //判断当前tank是否存在
        if (!this.node) {
            return;
        }
        this.startGrid = closeList[nextIndex];
        if (closeList.length == 0) {
            alert("错误的closeList长度")
        }
        //到达最后一个点,移动结束
        if (nextIndex == closeList.length - 1) {
            this.node.active = false;
            this.destorySelf();
            return;
        }

        //如果下一个目标点是障碍
        if (nextIndex + 1 <= closeList.length - 1) {

            //更新当前坐标
            this.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY);
            //检测下个坐标是否有障碍物
            if (this._gManager.gridComponentArr[closeList[nextIndex + 1].cellX][closeList[nextIndex + 1].cellY].isObstacle) {
                this.startNav();
            }
            else {
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
                        this.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY)
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
                                //攻击
                                if (targetTank) {
                                    if (targetTank.nodeInGridCellIndex) {
                                        this._stopIndex = nextIndex;
                                        this._closeList = closeList;
                                        this.attackTarget(targetTank);
                                        return;
                                    }
                                } else {
                                    //炮筒转到正向(局部eular角)
                                    var root: Node = this.node.getChildByName("root");
                                    root.eulerAngles = new Vec3(0, 0, 0);
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
            this.nodeInGridCellIndex = new Vec2(-1, -1);
        }


    }



    protected onDestroy(): void {
        if (this.star.isValid) {

        }
    }


    //攻击
    public attackTarget(target: element) {
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
            if (target.nodeInGridCellIndex) {
                var radian = Math.atan2(target.node.position.y - this.node.position.y, target.node.position.x - this.node.position.x);
                var targetRot = radian * (180 / Math.PI);

                var targetEular: Vec3 = this.tManager.convertEularForParent(root);
                root.setWorldRotationFromEuler(0, 0, targetEular.z)
                attackFunc();
            } else {
                //没有打击点
                this.tweenMove(this.stopIndex, this.closeList);
            }
        } else {
            //打击点已摧毁
            this.tweenMove(this.stopIndex, this.closeList);
        }


    }
    //旋转对方炮筒
    public gunRote(target: element) {
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
        var bulletNode: Node = instantiate(this.tManager.bulletPrefab);
        //设置父类
        this.nodeLayer.addChild(bulletNode);
        bulletNode.getComponent(bullet).bulletType = this.team;
        bulletNode.getComponent(bullet).tankParent = this;
        bulletNode.worldPosition = this.node.getChildByName("root").getChildByName("pao").getChildByName("point").worldPosition;

        //子弹运动方向
        if (this.targetNode.node) {
            var twLast = tween(bulletNode).to(0.3, { position: this.targetNode.node.position }, {
                onComplete: () => {
                    bulletNode.destroy();
                    twLast.removeSelf();
                },
            }).start();
        }
    }

    //碰撞检测函数
    override onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        var bu: bullet = otherCollider.getComponent(bullet);
        if (bu.tankParent != this) {
            //不是一队的 产生伤害
            if (bu.bulletType != this._team) {
                this.hp -= 5;
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
            console.log("HP:", this.hp);


        }
    }




    update(deltaTime: number) {
        this.updateGunRotation(deltaTime);
    }

    //更新炮口旋转
    updateGunRotation(deltaTime: number) {
        if (this.targetNode) {
            this.gunRote(this.targetNode);
        }
    }
}


