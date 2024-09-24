import { _decorator, Button, Color, Component, ImageAsset, Label, Node, resources, Sprite, SpriteFrame, Texture2D, Vec2 } from 'cc';
import { addElementManager } from './addElementManager';
const { ccclass, property } = _decorator;

@ccclass('addElItem')
export class addElItem extends Component {
    start() {
        this.initComponent();
    }

    update(deltaTime: number) {

    }


    initComponent() {
        this.getComponent(Button).node.on(Node.EventType.TOUCH_START, (event) => {
            this.onClick();
        });
    }


    onClick() {
        switch (this._data.name) {
            case "hammer":
                break;
            case "tBase":
                break;
            case "repair":
                break;
            case "levelUp":
                break;
            case "cancel":
                this.node.parent.getComponent(addElementManager).clear();
                break;
            case "delect":
                break;
            case "woodBox":
                break;

        }
    }

    //存储菜单数据
    private _data;


    initIcon(data) {
        this._data = data;
        resources.load(data.path, ImageAsset, (err: any, imageAsset) => {
            var spriteFrame = new SpriteFrame();
            var textrue = new Texture2D();
            textrue.image = imageAsset;
            spriteFrame.texture = textrue;
            this.node.getChildByName("icon").getComponent(Sprite).spriteFrame = spriteFrame;
            if (err) {
                console.log(err);
                return;
            }

        })
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


