import { _decorator, Component, Node } from 'cc';
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

    }

    update(deltaTime: number) {
        
    }
}


