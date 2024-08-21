import { _decorator, Component, Label, Node, NodeEventType, Sprite, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('grid')
export class grid extends Component {
    private _sprite;
    private _indexLabel;
    private _cellX;
    private _cellY;


    start() {
        //this.tweenColor();
        this.node.on(NodeEventType.MOUSE_DOWN, (e) => {
            this.tweenColor();
        })
        this.node.on(NodeEventType.TOUCH_START, (e) => {
            this.tweenColor();
        })
    }


    tweenColor() {
        this._sprite = this.getComponent(Sprite)
        const cor = { r: 255, g: 255, b: 255, a: 255 };
        var tw = tween(cor).to(1, { r: 255, g: 255, b: 255, a: 0 }, {
            onUpdate: () => {
                this._sprite.color = cor;
                //console.log("cor.a", this._sprite.color, cor.a)
            }
        }).to(1, { r: 255, g: 255, b: 255, a: 50 }, {
            onUpdate: () => {
                this._sprite.color = cor;
                //console.log("cor.a", this._sprite.color, cor.a)
            }
        })
        tw.start();
    }

    /**
     * 设置方格索引
     */
    setIndexLabel(x, y) {
        x = x + "";
        y = y + "";
        this._cellX=x;
        this._cellY=y;
        var indexLabelNode = this.node.getChildByName("indexLabel");
        this._indexLabel = indexLabelNode.getComponent(Label);
        this._indexLabel.string = "[" + x + "," + y + "]";
    }



    public test() {
        
        console.log("hellow")
    }
}


