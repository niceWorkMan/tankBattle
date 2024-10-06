import { _decorator, Component, Node } from 'cc';
import { UIManager } from '../UIManager';
const { ccclass, property } = _decorator;

@ccclass('userData')
export class userData extends Component {
    constructor(){
        super();
        userData._instance=this;
    }

    private static _instance: userData = null;
    // 只能通过自身进行初始化
    public static get Instance() {
        if (this._instance == null) {
            //获取单例失败
            console.log("获取TankManager单例失败");
        }
        return this._instance;
    }

    private _data:any={woodNum:0}
    private _woodNum: number = 0;
    public set woodNum(v: number) {
        this._woodNum = v;
        this._data.woodNum=v;
        UIManager.Instance.resNumUpdate(this._data)
    }
    public get woodNum() : number {
        return this._woodNum
    }
    



    start() {

    }

    update(deltaTime: number) {

    }
}


