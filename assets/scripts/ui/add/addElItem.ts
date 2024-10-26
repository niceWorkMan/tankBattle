import { _decorator, Button, Color, Component, ImageAsset, Label, Node, resources, Sprite, SpriteFrame, Texture2D, Vec2, Vec3 } from 'cc';
import { addElementManager } from './addElementManager';
import { UIManager } from '../../UIManager';
import { gridManager } from '../../gridManager';
import { editorManager } from '../../editorManager';
import { tankManager } from '../../tankManager';
import { grid } from '../../grid';
const { ccclass, property } = _decorator;

@ccclass('addElItem')
export class addElItem extends Component {
    start() {
        this.initComponent();

        //初始化IconUI
        this.initIconUI();
    }



    update(deltaTime: number) {

    }


    initComponent() {
        this.getComponent(Button).node.on(Node.EventType.TOUCH_START, (event) => {
            this.onClick();
        });
    }


    onClick() {
        var parent = this.node.parent.getComponent(addElementManager);
        //清除上一个动画
        if (UIManager.Instance.optionBuildData) {
            UIManager.Instance.optionBuildData.component.clearAnim();
        }
        switch (this._data.name) {
            case "hammer":
                this.node.parent.getComponent(addElementManager).reInitAddUI(UIManager.Instance.getMenuArr(["woodBox", "oreBox", "last"]))
                break;
            case "tBase":

                this.placeBuild(this._data);
                break;
            case "repair":
                break;
            case "levelUp":
                break;
            case "cancel":
                //清除
                if (UIManager.Instance.optionBuildData) {
                    UIManager.Instance.optionBuildData.component.unPlaceAnim(false);
                }
                parent.clear();
                //清空记录
                UIManager.Instance.optionBuildData = null;
                break;
            case "delect":
                //消除对象
                if (UIManager.Instance.optionBuildData.component) {
                    //消除属性
                    UIManager.Instance.optionBuildData.component.clearObGrids();
                    //消除UI
                    UIManager.Instance.addMenu.clear();
                    //清空记录
                    UIManager.Instance.optionBuildData = null;
                }
                break;
            case "accept":
                console.log("accept");
                if (UIManager.Instance.optionBuildData) {
                    //标记占位
                    var com = UIManager.Instance.optionBuildData.component;

                    var _signGrids: grid[] = com._signGrids;
                    _signGrids.forEach(element => {
                        com.signObGrids(element);
                        console.log(element.cellX, element.cellY);
                    });
                    //设置塔基占位特殊属性
                    if (com.node.parent.name == "tBase") {
                        var tb: any = com.node.parent.getComponent(editorManager.Instance.propertyConfig[com.node.parent.name].class);
                        tb.towerObstale = true;
                        console.log("设置true:", tb);
                    }

                    //清除
                    UIManager.Instance.optionBuildData.component.unPlaceAnim(false);
                    parent.clear();
                    //清空记录
                    UIManager.Instance.optionBuildData = null;

                }

                break;
            case "refuse":
                break;

            case "last":
                this.node.parent.getComponent(addElementManager).reInitAddUI(UIManager.Instance.getMenuArr(["hammer", "tBase", "cancel"]))
                break;

            case "woodBox":
                //放置
                this.placeBuild(this._data);
                break;
            case "oreBox":
                //放置
                this.placeBuild(this._data);
                break;


            case "tArrow":
                //放置
                this.placeBuild(this._data, UIManager.Instance.optionBuildData.component.node);
                break;

        }
    }




    //放置
    placeBuild(data, pNode: Node = null) {
        var parent = this.node.parent.getComponent(addElementManager);
        parent.clear()
        var build;

        var _signGrids: grid[] = [];
        var addSignGrid = (v: grid) => {
            _signGrids.push(v)
        }

        var realPlace = (_b) => {
            //放置
            if (_b) {
                //等待确认动画
                _b.unPlaceAnim(true);
                //设置最后一次放置
                UIManager.Instance.optionBuildData = _b.getOptionBuildData();
                //等待确认按钮
                UIManager.Instance.addBuildUI(UIManager.Instance.aem_LastCenter, UIManager.Instance.getMenuArr(["delect", "accept"]), false);
                //占位记录
                _b._signGrids = _signGrids;
            }
            else {
                console.error("没有放置成功");
            }
        }



        //放置格子计算
        if (this._data.zw) {
            // 1x1的建筑
            if (this._data.zw.x == 1 && this._data.zw.y == 1) {
                build = editorManager.Instance.placeBuild(parent.lastCenter, this._data.name, pNode);
                addSignGrid(gridManager.Instance.gridComponentArr[parent.lastCenter.x][parent.lastCenter.y]);
                //放置
                realPlace(build);
                return;
            }
            // 1x2的建筑
            else if (this._data.zw.x == 2 && this._data.zw.y == 1) {
                gridManager.Instance.gridComponentArr[parent.lastCenter.x][parent.lastCenter.y]
                //向右
                if (this.checkCellPosIsValue(new Vec2(parent.lastCenter.x + 1, parent.lastCenter.y))) {
                    if (gridManager.Instance.gridComponentArr[parent.lastCenter.x + 1][parent.lastCenter.y].isStatic == false) {
                        //生成
                        build = editorManager.Instance.placeBuild(parent.lastCenter, this._data.name, pNode);
                        //标记存储
                        addSignGrid(gridManager.Instance.gridComponentArr[parent.lastCenter.x][parent.lastCenter.y]);
                        addSignGrid(gridManager.Instance.gridComponentArr[parent.lastCenter.x + 1][parent.lastCenter.y])
                        //放置
                        realPlace(build);
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
                            build = editorManager.Instance.placeBuild(new Vec2(parent.lastCenter.x - 1, parent.lastCenter.y), this._data.name, pNode);
                            //标记存储
                            addSignGrid(gridManager.Instance.gridComponentArr[parent.lastCenter.x][parent.lastCenter.y]);
                            addSignGrid(gridManager.Instance.gridComponentArr[parent.lastCenter.x - 1][parent.lastCenter.y]);
                            //放置
                            realPlace(build);
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

    //初始化数据
    initIconData(data) {
        this._data = data;
    }
    //初始化Icon
    initIconUI() {
        resources.load(this._data.path, ImageAsset, (err: any, imageAsset) => {
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


