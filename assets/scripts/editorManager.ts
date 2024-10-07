import { _decorator, Color, Component, instantiate, Node, Prefab, settings, Sprite, Vec2, Vec3 } from 'cc';
import { gridManager } from './gridManager';
import { woodBox } from './building/woodBox';
import { tankManager } from './tankManager';
import { tBase } from './building/tower/tBase';
import { tree } from './obstale/tree';
import { tArrow } from './building/tower/tArrow';
import { bulletTArrow } from './bullet/bulletTArrow';
import { tank } from './node/tank';
import { boy01 } from './node/boy01';
import { pig } from './node/pig';
import { bulletTank } from './bullet/bulletTank';
import { workWoodCuter } from './node/workWoodCuter';
import { ore } from './obstale/ore';
const { ccclass, property } = _decorator;

@ccclass('editorManager')
export class editorManager extends Component {
    @property(Prefab) edtorNode: Prefab;

    @property(Prefab) obs_tree: Prefab;
    @property(Prefab) obs_ore: Prefab;

    @property(Prefab) build_woodbox: Prefab;
    @property(Prefab) tower_base: Prefab;
    @property(Prefab) tower_arrow: Prefab;

    @property(Prefab) bullet_tank: Prefab;
    @property(Prefab) bullet_tArrow: Prefab;

    @property(Prefab) el_tank: Prefab;
    @property(Prefab) el_pig: Prefab;
    @property(Prefab) el_boy01: Prefab;

    @property(Prefab) wk_woodCuter: Prefab;


    constructor() {
        super();
        //初始化
        editorManager._instance = this;
    }

    start() {
        this.initComponent();
    }

    //配置表
    private _propertyConfig: any = null;
    public get propertyConfig(): any {
        return this._propertyConfig;
    }

    //初始化配置表(核心配置)
    initComponent() {
        this._propertyConfig = {
            //障碍物
            "tree": {//树
                "prefab": this.obs_tree,
                "class": tree
            },
            "ore": {//矿
                "prefab": this.obs_ore,
                "class": ore
            },
            //建筑
            "tBase": {
                "prefab": this.tower_base,
                "class": tBase
            },
            "woodBox": {
                "prefab": this.build_woodbox,
                "class": woodBox
            },
            "tArrow": {
                "prefab": this.tower_arrow,
                "class": tArrow
            },
            //移动人物
            "tank": {
                "prefab": this.el_tank,
                "class": tank,
            },
            "boy01": {
                "prefab": this.el_boy01,
                "class": boy01,
            },
            "pig": {
                "prefab": this.el_pig,
                "class": pig,
            },
            //建筑工作者
            "workWoodCuter": {
                "prefab": this.wk_woodCuter,
                "class": workWoodCuter,
            },
            //子弹
            "bulletTank": {
                "prefab": this.bullet_tank,
                "class": bulletTank
            },
            "bulletTArrow": {
                "prefab": this.bullet_tArrow,
                "class": bulletTArrow
            },
        };
    }



    //放置
    public placeBuild(center: Vec2, name: string, parent: Node) {
        var obj = null;
        if (this._propertyConfig[name]) {
            obj = instantiate(this._propertyConfig[name].prefab);
            var obstaleLayer = this.node.getChildByName("obstaleLayer")
            if (!parent) {
                obstaleLayer.addChild(obj);
                obj.position = this.getComponent(gridManager).gridComponentArr[center.x][center.y].node.position;
            }
            else {

                parent.addChild(obj);
                switch (name) {
                    case "tArrow":
                        obj.position = new Vec3(0, 30, 0);
                        break;
                    default:
                        obj.position = new Vec3(0, 0, 0);
                }

            }

            //初始化位置Index

            obj.getComponent(this._propertyConfig[name].class).init(center);
            //console.log("设置了", this._propertyConfig[name], center);
            //排序(遮挡关系)
            this.node.getComponent(tankManager).setSiblingIndex_Layer(obstaleLayer)
        } else {
            alert("生成失败")
            return null;
        }
        return obj.getComponent(this._propertyConfig[name].class)
    }


    private static _instance: editorManager = null;
    // 只能通过自身进行初始化
    public static get Instance() {
        if (this._instance == null) {
            //获取单例失败
            console.log("获取gridManager单例失败");

        }
        return this._instance;
    }

    //编辑器区域集合
    private _edtorNodeArr: Node[] = [];

    //清除
    private clearEditor() {
        for (var i = 0; i < this._edtorNodeArr.length; i++) {
            if (this._edtorNodeArr[i]) {
                this._edtorNodeArr[i].destroy();
            }
        }
        this._edtorNodeArr.length = 0;
    }

    private spawnEditorNode(pos: Vec2, isAllown = true) {
        var gManager = this.getComponent(gridManager);
        var editorLayer = this.node.getChildByName("editorLayer");
        var obj = instantiate(this.edtorNode)
        editorLayer.addChild(obj)
        this._edtorNodeArr.push(obj);
        obj.position = gManager.gridComponentArr[pos.x][pos.y].node.position;
        //不允许建造
        if (!isAllown) {
            obj.getComponent(Sprite).color = new Color(255, 0, 102);
            setTimeout(() => {
                obj.destroy();
            }, 1000);
        }
        //允许
        else {
            obj.getComponent(Sprite).color = new Color(0, 255, 153);
        }
    }


    public spawnEditors(posArr: Vec2[], isAllown) {
        this.clearEditor();
        for (var i = 0; i < posArr.length; i++) {
            this.spawnEditorNode(posArr[i], isAllown);
        }
    }

    update(deltaTime: number) {

    }
}


