import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, log, Node, Tween } from 'cc';
import { enumTeam } from '../common/enumTeam';
import { base } from '../node/base';
import { editorManager } from '../editorManager';
import { tankManager } from '../tankManager';
const { ccclass, property } = _decorator;

@ccclass('bullet')
export class bullet extends Component {

    start() {
    }


    //配置键
    protected _key: string;
    public set key(v: string) {
        this._key = v;
    }
    public get key(): string {
        return this._key
    }


    //伤害
    protected _damage: number = 1;
    public get damage(): number {
        return this._damage;
    }

    //父类tank
    private _attackParent: base;
    public set attackParent(v: base) {
        this._attackParent = v;
    }
    public get attackParent(): base {
        return this._attackParent;
    }



    initData(btype: enumTeam) {
        this._bulletType = btype;
    }
    //子弹类型
    private _bulletType: enumTeam;

    public set bulletType(v: enumTeam) {
        this._bulletType = v;
    }

    public get bulletType(): enumTeam {
        return this._bulletType;
    }


    //用于对象池 是否休眠
    private _isSleep: boolean = false;
    public set sleep(v: boolean) {
        this._isSleep = v;
        this.node.active = !v;
        if (v == true) {
            this.removeTween();
        }
    }
    public get sleep(): boolean {
        return this._isSleep;
    }


    //子弹动画
    public bTween: Tween<Node> = null;

    public removeTween() {
        if (this.bTween) {
            this.bTween.removeSelf();
        }
    }

    update(deltaTime: number) {

    }

    //碰撞检测函数
    protected onCollision(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        var config = tankManager.Instance.getProperotyConfig();
        if (config) {
            var itemConfig: any = config[otherCollider.node.name];
            if (!itemConfig) {
                //没有匹配对象
                console.log("没有匹配对象");
                return;
            }
            //过滤和父对象碰撞
            var target: any = otherCollider.getComponent(itemConfig.class);
            //过滤同队和 子弹打到子弹
            if (this.attackParent.node != otherCollider.node && target.key.indexOf("bullet") == -1) {
                if (this.bulletType != target._team) {
                    setTimeout(() => {
                        target.hp -= this.damage;
                        if (target.hp > 0) {
                            //还可以扛
                        } else {
                            //停止连续射击  等待一帧
                            target.destroyTarget();
                        }
                        //休眠
                        if (this.sleep == false) {
                            this.sleep = true;
                        }
                    }, 0);
                    //下一帧执行 物理逻辑 不能在碰撞回调中调用(不能放在最外层 会被同队伍的对象截断碰撞)
                }
            }
        } else {
            alert("配置表加载失败")
        }
    }
}


