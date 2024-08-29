import { _decorator, Component, Node } from 'cc';
import { enumTeam } from './common/enumTeam';
import { tank } from './tank';
const { ccclass, property } = _decorator;

@ccclass('bullet')
export class bullet extends Component {
    start() {

    }
    

    //父类tank
    private _tankParent: tank;
    public set tankParent(v: tank) {
        this._tankParent = v;
    }
    public get tankParent(): tank {
        return this._tankParent;
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



    update(deltaTime: number) {

    }
}


