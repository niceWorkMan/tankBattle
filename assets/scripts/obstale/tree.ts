import { _decorator, Component, Node, Vec2 } from 'cc';
import { obstaleBase } from './obstaleBase';
import { UIManager } from '../UIManager';
const { ccclass, property } = _decorator;

@ccclass('tree')
export class tree extends obstaleBase {
    constructor() {
        super();
    }

    start() {

    }


    public init(pos: Vec2): void {
        //调用父类方法
        super.init(pos);
        //监听touch
        this.node.on(Node.EventType.TOUCH_START, (e) => {
            //不向上冒泡 阻挡
            e.bubbles = false;
            //不允许建造
            this.isAllow(pos, false);
            //清除建造UI
            UIManager.Instance.clearBuildUI();
        }, this);
    }

    update(deltaTime: number) {

    }
}


