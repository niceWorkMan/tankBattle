import { _decorator, Color, Component, Label, log, Node, NodeEventType, Sprite, tween, Vec2 } from 'cc';
import { gridManager } from './gridManager';
import { UIManager } from './UIManager';
import { editorManager } from './editorManager';
const { ccclass, property } = _decorator;

@ccclass('grid')
export class grid extends Component {
    private _sprite;
    private _indexLabel;

    private _cellX: number;
    public get cellX(): number {
        return this._cellX;
    }

    private _cellY: number;
    public get cellY(): number {
        return this._cellY;
    }

    //运动产生的障碍的父对象（产生障碍的对象）
    private _moveObstaleParent: any = null;
    public set moveObstaleParent(v: any) {
        this._moveObstaleParent = v;
    }
    public get moveObstaleParent(): any {
        return this._moveObstaleParent
    }




    private _gridManager;

    //是否是障碍物
    private _isObstacle: boolean;
    public set isObstacle(v: boolean) {
        if (v) {
            // this.setSpriteColor({ r: 0, g: 0, b: 0, a: 100 })
        }
        else {
            this.setSpriteColor({ r: 255, g: 255, b: 255, a: 255 })
        }


        this._isObstacle = v;
    }
    public get isObstacle(): boolean {
        return this._isObstacle
    }


    //障碍物是否是静态的
    private _isStatic: boolean = false;
    public set isStatic(v: boolean) {
        this._isStatic = v;
    }
    public get isStatic(): boolean {
        return this._isStatic;
    }



    //父节点
    public _aStarParent: grid = null;



    //上一个
    public _parent: grid;
    public set parent(v: grid) {
        this._parent = v;
    }
    public get parent(): grid {
        return this._parent;
    }



    //下一个
    public _next: grid;
    public set next(v: grid) {
        this._next = v;
    }

    public get next(): grid {
        return this._next;
    }



    start() {
        this._sprite = this.getComponent(Sprite)

        this.node.on(NodeEventType.TOUCH_START, (e) => {
            //不向上冒泡
            e.bubbles = false;
            this.touchGrid(e);
        })

    }

    touchGrid(e) {
        //添加建筑UI
        if (this.isStatic == false) {
            //没有正在建造的
            if (!UIManager.Instance.optionBuildData) {
                console.log("当前位置:",this.cellX,this.cellY);
                
                UIManager.Instance.addBuildUI(new Vec2(this.cellX, this.cellY), UIManager.Instance.getMenuArr(["hammer", "tBase", "cancel"]));
            }
            //存在正在建造的对象
            else {
                //清除动画
                if (UIManager.Instance.optionBuildData) {
                    UIManager.Instance.optionBuildData.component.clearAnim();
                    //清除菜单
                    if (UIManager.Instance.optionBuildData.component._isPlace == false) {
                        UIManager.Instance.buildUIClear();
                    }
                }

                console.log("当前位置2:",this.cellX,this.cellY);
                //新建菜单
                UIManager.Instance.addBuildUI(new Vec2(this.cellX, this.cellY), UIManager.Instance.getMenuArr(["hammer", "tBase", "cancel"]));
            }
        }
        else {
            console.log("不可操作地形");
        }

    }



    tweenColor() {
        //this._sprite = this.getComponent(Sprite)
        const cor = { r: 225, g: 225, b: 225, a: 225 };
        var tw = tween(cor).to(1, { r: 225, g: 225, b: 225, a: 0 }, {
            onUpdate: () => {
                this._sprite.color = cor;
                //console.log("cor.a", this._sprite.color, cor.a)
            }
        }).to(1, { r: 225, g: 225, b: 225, a: 50 }, {
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
    setIndexLabel(x: number, y: number) {
        var xLabel = x + "";
        var yLable = y + "";
        this._cellX = x;
        this._cellY = y;
        var indexLabelNode = this.node.getChildByName("indexLabel");
        this._indexLabel = indexLabelNode.getComponent(Label);
        // this._indexLabel.string = "[" + xLabel + "," + yLable + "]";
    }

    setLabel(str) {
        this._indexLabel.color = { r: 255, g: 255, b: 255, a: 255 }
        this._indexLabel.string = str;
    }

    //障碍物
    setObstacle(isObstacle: boolean) {
        this._isObstacle = isObstacle;
        this._sprite = this.getComponent(Sprite)
        if (isObstacle) {
            this._sprite.color = { r: 216, g: 47, b: 47, a: 255 };
        }
        else {
            // this._sprite.color = { r: 230, g: 241, b: 103, a: 255 };
        }
    }

    setSpriteColor(c) {
        if (!this._sprite) {
            this._sprite = this.getComponent(Sprite);
        }
        this._sprite.color = c;
    }

    getObstacle(): boolean {
        return this._isObstacle;
    }

    setGridManager(gridManager: gridManager) {
        this._gridManager = gridManager;
    }







}


