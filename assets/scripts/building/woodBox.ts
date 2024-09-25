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
        this._buildType=buildType.build;
    }

    start() {
        this.node.getChildByName("Icon").on(NodeEventType.TOUCH_START, (e) => {
            //不向上冒泡
            e.bubbles = false;
            //生成操作菜单
            UIManager.Instance.addBuildUI(new Vec2(this.cellX,this.cellY),UIManager.Instance.getMenuArr(["levelUp","delect","cancel"]))
            //存储
            UIManager.Instance.optionBuildData={key:this._key,node:this.node,class:woodBox}
        })
    }

    public init(pos: math.Vec2): void {
        super.init(pos);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    update(deltaTime: number) {

    }
}


