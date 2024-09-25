import { _decorator, Collider2D, Component, IPhysics2DContact, math, Node } from 'cc';
import { element } from '../node/element';
import { buildType } from '../common/buildType';
import { buildBase } from './buildBase';
const { ccclass, property } = _decorator;

@ccclass('woodRoom')
export class woodRoom extends buildBase {

    constructor() {
        super();
        //初始化config的key
        this._key = "woodRoom";
        //建筑类型
        this._buildType=buildType.build;
    }

    start() {

    }

    public init(pos: math.Vec2): void {
        super.init(pos);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    update(deltaTime: number) {

    }
}


