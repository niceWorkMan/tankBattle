import { _decorator, Component, Node } from 'cc';
import { base } from '../node/base';
const { ccclass, property } = _decorator;

@ccclass('buildBase')
export class buildBase extends base {

    protected _data: any;
    public get data() : any {
        return this._data;
    }
    
    start() {

    }
    
    //初始化数据
    public initBuild(data) {
        this._data = data;
    }

    update(deltaTime: number) {

    }
}


