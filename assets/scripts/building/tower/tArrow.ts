import { _decorator, Animation, Component, log, math, misc, Node, NodeEventType, tween, Vec2, Vec3 } from 'cc';
import { buildBase } from '../buildBase';
import { buildType } from '../../common/buildType';
import { UIManager } from '../../UIManager';
import { enumTeam } from '../../common/enumTeam';
import { element } from '../../node/element';
import { pool } from '../../core/pool';
import { bullet } from '../../bullet/bullet';
import { base } from '../../node/base';
import { gridManager } from '../../gridManager';
import { tankManager } from '../../tankManager';
import { editorManager } from '../../editorManager';
const { ccclass, property } = _decorator;

@ccclass('tArrow')
export class tArrow extends buildBase {
    constructor() {
        super();
        //初始化config的key
        this._key = "tArrow";
        //建筑类型
        this._buildType = buildType.build;
        //攻击距离
        this.attackDis = 6

        this.team = enumTeam.teamBlue;
    }

    public init(pos: math.Vec2): void {
        super.init(pos);
    }





    start() {
        this.node.on(NodeEventType.TOUCH_START, (e) => {
            //不向上冒泡
            e.bubbles = false;
            //生成操作菜单
            UIManager.Instance.addBuildUI(new Vec2(this.cellX, this.cellY), UIManager.Instance.getMenuArr(["levelUp", "repair", "delect", "cancel"]), false)
            //动画
            this.selectAnim(true);
            //存储
            //清除上一个选中动画
            if (UIManager.Instance.optionBuildData) {
                UIManager.Instance.optionBuildData.component.clearAnim();
                //清除菜单
                if (UIManager.Instance.optionBuildData.component._isPlace == false) {
                    UIManager.Instance.buildUIClear();
                }
            }
            //存储
            UIManager.Instance.optionBuildData = this.getOptionBuildData();

        })

        //查询管理类
        this._gManager = this.node.parent.parent.parent.getComponent(gridManager)
        this._tankManager = this.node.parent.parent.parent.getComponent(tankManager);

        //巡逻
        this.searchTarget();

    }

    searchTarget() {
        this.targetNode = this.tManager.searchAttakTarget(this);
        if (!this.targetNode) {
            setTimeout(() => {
                //再次寻找
                if (this.node) {
                    this.searchTarget();
                }
            }, 200);
        }
        else {
            this.attackTarget(this.targetNode);
        }
    }




    //生成子弹
    public spawnBullet(target: base, distance: number) {
        var nodeLayer = this.node.parent.parent.parent.getChildByName("effectLayer");
        //对象池
        var po: pool = this.node.parent.parent.parent.getComponent(pool)
        var edt: editorManager = this.node.parent.parent.parent.getComponent(editorManager)
        //获取对应的类和Prefab
        var key = "bulletTArrow";
        console.log(edt.propertyConfig, key);

        var cofResult = edt.propertyConfig[key]
        var bulletNode: Node = po.spawnBullet(key, nodeLayer)
        //获取类型
        var bClass: any = bulletNode.getComponent(cofResult.class);
        //设置父类
        var targetPos = target.node.getWorldPosition();
        var selfPos = this.node.getWorldPosition();
        var radian = Math.atan2(targetPos.y - selfPos.y, targetPos.x - selfPos.x);
        var targetRot = radian * (180 / Math.PI);
        bulletNode.setRotationFromEuler(0, 0, targetRot)// = new Vec3(0, 0, targetRot)
        bulletNode.getComponent(bullet).bulletType = this.team;
        //设置子弹父产生对象
        bulletNode.getComponent(bullet).attackParent = this;
        bulletNode.worldPosition = this.node.worldPosition;



        var pureTargetPos = new Vec3(target.node.worldPosition.x, target.node.worldPosition.y, target.node.worldPosition.z)
        //设置僵直
        this.isFireContrl = true;
        //子弹运动方向(运动到目标点)

        if (target) {
            bClass.bTween = tween(bulletNode).delay(0.5).to(0.5 * (distance / 5), { worldPosition: pureTargetPos }, {
                onStart: () => {
                    //取消僵直
                },
                onComplete: () => {
                    this.isFireContrl = false;
                    if (bulletNode) {
                        bClass.bTween.removeSelf();
                        //
                        var b: any = bulletNode.getComponent(cofResult.class);
                        if (b.sleep == false) {
                            b.sleep = true;
                        }

                    }
                },
            }).start();
        }
    }



    //攻击
    public attackTarget(target: base) {
        if (target.sleep == false) {
            //生成子弹
            this._fireInterval = setInterval(() => {
                //是否在射程内
                var distance = tankManager.Instance.getDisFromBoth(this, target);
                var isAttackDis = distance < this.attackDis
                //自身存在&&目标也存在
                if (isAttackDis && target.sleep == false) {
                    var anim: Animation = this.node.getComponent(Animation);
                    anim.play("tTowerFire")
                    this.spawnBullet(target, distance);
                }
                else {
                    //当前目标重置
                    this._targetNode = null;
                    //清除持续射击
                    clearInterval(this._fireInterval);
                    //寻找下一个目标
                    this.searchTarget();
                    console.log("寻找下个目标");
                }
            }, this._fireSpace * 500);
        }
        else {
            this._targetNode = null;
            clearInterval(this._fireInterval);
            //重新寻找对象
            this.searchTarget()
        }
    }


    //旋转对方炮筒
    public gunRote(target: base) {
        var root: Node = this.node
        if (target.node) {
            var radian = Math.atan2(target.node.worldPosition.y - this.node.worldPosition.y, target.node.worldPosition.x - this.node.worldPosition.x);
            var targetRot = radian * (180 / Math.PI);
            //目标转角（弧度）
            root.setWorldRotationFromEuler(0, 0, targetRot - 90);
        } else {
            //没有打击点
        }
    }

    update(deltaTime: number) {
        //指向
        if (this.sleep == false) {
            if (this.targetNode && this.isFireContrl == false) {
                {
                    this.gunRote(this.targetNode);
                }

            }
        }
    }

    protected onDestroy(): void {
        //清除持续射击
        clearInterval(this._fireInterval);
        this._fireInterval = null;
    }

    public getOptionBuildData() {
        return { key: this._key, component: this, class: this.constructor }
    }
}


