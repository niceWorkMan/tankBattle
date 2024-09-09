import { _decorator, Component, Node } from 'cc';
import { bullet } from './bullet';
const { ccclass, property } = _decorator;

@ccclass('bulletTank')
export class bulletTank extends bullet {

    constructor() {
        super();
            //初始化config的key
            this._key = "bulletTank";
    }

    start() {

    }
    update(deltaTime: number) {

    }
}


