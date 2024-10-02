import { _decorator, Collider2D, Component, IPhysics2DContact, math, Node, NodeEventType, Vec2 } from 'cc';
import { buildType } from '../common/buildType';
import { buildBase } from './buildBase';
import { UIManager } from '../UIManager';
const { ccclass, property } = _decorator;

@ccclass('woodBox')
export class woodBox extends buildBase {

    constructor() {
        super();
        //初始化config的key
        this._key = "woodBox";
        //建筑类型
        this._buildType = buildType.build;
    }

    start() {
        this.node.getChildByName("Icon").on(NodeEventType.TOUCH_START, (e) => {
            //如果已经被放置 可以被选中
            if (this.isPlace) {
                //不向上冒泡
                e.bubbles = false;
                //生成操作菜单
                UIManager.Instance.addBuildUI(new Vec2(this.cellX, this.cellY), UIManager.Instance.getMenuArr(["levelUp", "repair", "delect", "cancel"]), false)
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
                //动画
                this.selectAnim(true);
            }
        })

    }

    public init(pos: math.Vec2): void {
        super.init(pos);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    update(deltaTime: number) {

    }

    public getOptionBuildData() {
        return { key: this._key, component: this, class: this.constructor }
    }
}


