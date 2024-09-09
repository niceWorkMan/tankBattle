import { _decorator, Component, Node, Tween } from 'cc';
import { enumTeam } from '../common/enumTeam';
import { element } from '../node/element';
const { ccclass, property } = _decorator;

@ccclass('bullet')
export class bullet extends Component {

    start() {

    }


    //配置键
    protected _key: string;
    public set key(v: string) {
        this._key = v;
    }
    public get key(): string {
        return this._key
    }



    //父类tank
    private _attackParent: element;
    public set attackParent(v: element) {
        this._attackParent = v;
    }
    public get attackParent(): element {
        return this._attackParent;
    }



    initData(btype: enumTeam) {
        this._bulletType = btype;
    }
    //子弹类型
    private _bulletType: enumTeam;

    public set bulletType(v: enumTeam) {
        this._bulletType = v;
    }

    public get bulletType(): enumTeam {
        return this._bulletType;
    }


    //用于对象池 是否休眠
    private _isSleep: boolean = false;
    public set sleep(v: boolean) {
        this._isSleep = v;
        this.node.active=!v;
        if(v==true){
            this.removeTween();
        }
    }
    public get sleep(): boolean {
        return this._isSleep;
    }


    //子弹动画
    public bTween: Tween<Node> = null;

    public removeTween(){
        if(this.bTween){
          this.bTween.removeSelf();
        }
    }

    update(deltaTime: number) {

    }
}


