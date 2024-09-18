import { _decorator, Component, Node, Vec2 } from 'cc';
import { obstaleBase } from './obstaleBase';
import { UIManager } from '../UIManager';
const { ccclass, property } = _decorator;

@ccclass('tree')
export class tree extends obstaleBase {
    constructor(){
        super();
    }

    start() {

    }

    init(pos:Vec2){
        this.node.on(Node.EventType.TOUCH_START, (e) => {
            //不向上冒泡 阻挡
            e.bubbles = false;
            //不允许建造
            this.isAllow(pos,false);
            //清除建造UI
            UIManager.Instance.clearBuildUI();
        }, this);
    }

    update(deltaTime: number) {
        
    }
}


