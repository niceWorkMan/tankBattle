import { _decorator, Button, Color, Component, ImageAsset, Label, Node, resources, Sprite, SpriteFrame, Texture2D, Vec2 } from 'cc';
import { addElementManager } from './addElementManager';
import { UIManager } from '../../UIManager';
import { gridManager } from '../../gridManager';
import { editorManager } from '../../editorManager';
import { tankManager } from '../../tankManager';
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
                this.node.parent.getComponent(addElementManager).reInitAddUI(UIManager.Instance.getMenuArr(["woodBox", "last"]))
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
            case "last":
                this.node.parent.getComponent(addElementManager).reInitAddUI(UIManager.Instance.getMenuArr(["hammer", "tBase", "cancel"]))
                break;
            case "woodBox":
                this.placeBuild(this._data);
                break;

        }
    }




    //放置
    placeBuild(data) {
        var parent = this.node.parent.getComponent(addElementManager);
        //清除UI
        this.node.parent.getComponent(addElementManager).clear();


        if (this._data.zw) {
            // 1x2的建筑
            if (this._data.zw.x == 2, this._data.zw.y == 1) {
                gridManager.Instance.gridComponentArr[parent.lastCenter.x][parent.lastCenter.y]
                //向右
                if (this.checkCellPosIsValue(new Vec2(parent.lastCenter.x + 1, parent.lastCenter.y))) {
                    if (gridManager.Instance.gridComponentArr[parent.lastCenter.x + 1][parent.lastCenter.y].isStatic == false) {
                        //生成
                        var build = editorManager.Instance.placeBuild(parent.lastCenter, this._data.name);
                        //标记
                        build.signObGrids(gridManager.Instance.gridComponentArr[parent.lastCenter.x][parent.lastCenter.y]);
                        build.signObGrids(gridManager.Instance.gridComponentArr[parent.lastCenter.x + 1][parent.lastCenter.y]);
                        return;
                    }
                    else {
                        //当前位置不可
                        console.log("当前位置不可");
                    }
                }
                //向左
                if (this.checkCellPosIsValue(new Vec2(parent.lastCenter.x - 1, parent.lastCenter.y))) {
                    if (this.checkCellPosIsValue(new Vec2(parent.lastCenter.x - 1, parent.lastCenter.y))) {
                        if (gridManager.Instance.gridComponentArr[parent.lastCenter.x - 1][parent.lastCenter.y].isStatic == false) {
                            //生成
                            var build = editorManager.Instance.placeBuild(new Vec2(parent.lastCenter.x - 1, parent.lastCenter.y), this._data.name);
                            //标记
                            build.signObGrids(gridManager.Instance.gridComponentArr[parent.lastCenter.x][parent.lastCenter.y]);
                            build.signObGrids(gridManager.Instance.gridComponentArr[parent.lastCenter.x - 1][parent.lastCenter.y]);
                            return;
                        }
                        else {
                            //当前位置不可
                            console.log("当前位置不可");
                        }
                    }
                    else {
                        //当前位置不可
                        console.log("当前位置不可");
                    }
                }

            }
        }



    }

    checkCellPosIsValue(pos: Vec2) {
        var Matrix = gridManager.Instance.getGridMatrix;
        return pos.x >= 0 && pos.x < Matrix.row && pos.y >= 0 && pos.y < Matrix.colum;
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


