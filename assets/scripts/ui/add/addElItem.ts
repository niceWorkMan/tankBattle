import { _decorator, Component, Label, Node, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('addElItem')
export class addElItem extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    //代价
    private _price
    public set price(v: Vec2) {
        this._price = v;
    }
    public get price(): string {
        return this._price;
    }


    //更新索引
    updateLab(context: string) {
        var lab = this.node.getChildByName("Label").getComponent(Label)
        lab.string = context;
    }
}


