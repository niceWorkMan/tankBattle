import { _decorator, Color, Component, Label, Node, NodeEventType, Sprite, tween, Vec2 } from 'cc';
import { gridManager } from './gridManager';
const { ccclass, property } = _decorator;

@ccclass('grid')
export class grid extends Component {
    private _sprite;
    private _indexLabel;
    private _cellX:number;
    private _cellY:number;
    private _gridManager;
    //是否是障碍物
    private _isObstacle: boolean;
    //父节点
    public _aStarParent: grid = null;





    start() {
        this._sprite = this.getComponent(Sprite)
        //
        this.node.on(NodeEventType.MOUSE_DOWN, (e) => {
            this.tweenColor();
        })
        this.node.on(NodeEventType.TOUCH_START, (e) => {
            this.tweenColor();
        })
    }


    tweenColor() {
        //this._sprite = this.getComponent(Sprite)
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
    setIndexLabel(x:number, y:number) {
        var xLabel = x + "";
        var yLable = y + "";
        this._cellX = x;
        this._cellY = y;
        var indexLabelNode = this.node.getChildByName("indexLabel");
        this._indexLabel = indexLabelNode.getComponent(Label);
        this._indexLabel.string = "[" + xLabel + "," + yLable + "]";
    }

    setLabel(str){
        this._indexLabel.string =str;
    }

    //障碍物
    setObstacle(isObstacle: boolean) {
        this._isObstacle = isObstacle;
        this._sprite = this.getComponent(Sprite)
        if (isObstacle) {
            this._sprite.color = { r: 216, g: 47, b: 47, a: 255 };
        }
        else {
            this._sprite.color = { r: 230, g: 241, b: 103, a: 255 };
        }
    }


    setSpriteColor(c){
        this._sprite.color = c;
    }

    getObstacle():boolean{
        return this._isObstacle ;
    }

    setGridManager(gridManager: gridManager) {
        this._gridManager = gridManager;
    }

    //获取索引位置
    getCellIndex() {
        return new Vec2(this._cellX, this._cellY);
    }



    public test() {

        console.log("hellow")
    }
}


