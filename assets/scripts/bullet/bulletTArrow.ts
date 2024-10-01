import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { bullet } from './bullet';
const { ccclass, property } = _decorator;

@ccclass('bulletTArrow')
export class bulletTArrow extends bullet {
    constructor() {
        super();
            //初始化config的key
            this._key = "bulletTArrow";
            //初始化子弹伤害
            this._damage=5;
    }

    start() {
        var nodeCollider = this.node.getComponent(Collider2D);
        nodeCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

        //调用父类检测
        onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
            // 碰撞逻辑 
            this.onCollision(selfCollider, otherCollider, contact);
        }
    

    update(deltaTime: number) {
        
    }
}


