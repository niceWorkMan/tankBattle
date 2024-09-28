import { _decorator, Animation, Component, math, Node, NodeEventType, tween, Vec2, Vec3 } from 'cc';
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
            //存储
            UIManager.Instance.optionBuildData = this.getOptionBuildData();
            //动画
            this.selectAnim(true);
        })

        //查询管理类
        this._gManager = this.node.parent.parent.parent.getComponent(gridManager)
        this._tankManager = this.node.parent.parent.parent.getComponent(tankManager);

        //巡逻
        this.searchTarget();

    }

    searchTarget() {
        var _cuurentTarget = this.tManager.searchAttakTarget(this);
        if (!_cuurentTarget) {
            setTimeout(() => {
                //再次寻找
                console.log("再次寻找");
                this.searchTarget();
            }, 500);
        }
        else {
            if (_cuurentTarget.sleep == false) {
                //攻击
                console.log("攻击:", _cuurentTarget.node.name);
                this.attackTarget(_cuurentTarget);
            }
            else{
                this.searchTarget();
            }
        }
    }

    
    //生成子弹
    public spawnBullet(target: base) {
        var nodeLayer = this.node.parent.parent.parent.getChildByName("tankLayer");
        //对象池
        var po: pool = this.node.parent.parent.parent.getComponent(pool)
        var edt: editorManager = this.node.parent.parent.parent.getComponent(editorManager)
        //获取对应的类和Prefab
        var key = "bulletTArrow";
        console.log(edt.propertyConfig,key);
        
        var cofResult = edt.propertyConfig[key]
        var bulletNode: Node = po.spawnBullet(key, nodeLayer)
        //获取类型
        var bClass: any = bulletNode.getComponent(cofResult.class);
        //设置父类
        var targetPos = target.node.getPosition();
        var selfPos = this.node.getPosition();
        var radian = Math.atan2(targetPos.y - selfPos.y, targetPos.x - selfPos.x);
        var targetRot = radian * (180 / Math.PI);
        bulletNode.eulerAngles = new Vec3(0, 0, targetRot)
        bulletNode.getComponent(bullet).bulletType = this.team;
        //设置子弹父产生对象
        bulletNode.getComponent(bullet).attackParent = this;
        bulletNode.worldPosition = this.node.worldPosition;

        //子弹运动方向(运动到目标点)
        if (target) {
            if (bClass.bTween != null) {
                bClass.bTween.removeSelf();
            }
            bClass.bTween = tween(bulletNode).to(0.5, { position: target.node.position }, {
                onComplete: () => {
                    if (bulletNode) {
                        bClass.bTween.removeSelf();
                        var b: any = bulletNode.getComponent(bClass);
                        if (b.sleep == false) {
                            b.sleep = true;
                        }

                    }
                },
            }).start();
        }
    }

    public generateBullet(target, stopIndex, closeList) {
        //随机开炮速度
        //this._fireSpace = Math.random();
        if (this._fireInterval) {
            clearInterval(this._fireSpace);
        }
        this._fireInterval = setInterval(() => {
            //自身存在&&目标也存在
            if (this.node && target.node) {
                //播放炮动画
                var anim: Animation = this.getComponent(Animation);
                anim.play("tTowerFire")
                this.spawnBullet(target);
            }
            else {
                //停止射击  继续前进
                clearInterval(this._fireInterval);
            }
        }, this._fireSpace * 1000);

    }


    //攻击
    public attackTarget(target: base) {
        if (this.isPause) {
            return;
        }

        if (target.sleep == false) {
            //生成子弹
            this._fireInterval = setInterval(() => {
                //自身存在&&目标也存在
                if (this.tManager.nodeCollection.indexOf(target) != -1) {
                    if (target.sleep) {
                        this._targetNode = null;
                        clearInterval(this._fireInterval);
                    }
                    var anim: Animation = this.getComponent(Animation);
                    anim.play("tTowerFire")
                    this.spawnBullet(target);
                }
                else {
                    this._targetNode = null;
                    clearInterval(this._fireInterval);

                }

            }, this._fireSpace * 200);
        }
        else {
            this._targetNode = null;
            clearInterval(this._fireInterval);
            //重新寻找对象
            this.searchTarget()
        }
    }





    //旋转对方炮筒
    public gunRote(target: element) {
        var root: Node = this.node
        if (target.node) {
            var radian = Math.atan2(target.node.position.y - this.node.position.y, target.node.position.x - this.node.position.x);
            var targetRot = radian * (180 / Math.PI);
            //目标转角（弧度）
            root.setWorldRotationFromEuler(0, 0, targetRot);
        } else {
            //没有打击点
        }
    }

    update(deltaTime: number) {

    }

    public getOptionBuildData() {
        return { key: this._key, component: this, class: this.constructor }
    }
}


