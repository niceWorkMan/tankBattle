import { _decorator, Color, Component, instantiate, Node, Prefab, settings, Sprite, Vec2 } from 'cc';
import { gridManager } from './gridManager';
import { woodBox } from './building/woodBox';
import { tankManager } from './tankManager';
import { tBase } from './building/tower/tBase';
import { tree } from './obstale/tree';
const { ccclass, property } = _decorator;

@ccclass('editorManager')
export class editorManager extends Component {
    @property(Prefab) edtorNode: Prefab;

    @property(Prefab) woodbox_b: Prefab;
    @property(Prefab) tBase_t: Prefab;



    constructor() {
        super();
        //初始化
        editorManager._instance = this;
    }

    start() {
        this.initComponent();
    }

    //配置表
    private _buildPlaceConfig = {};
    public get buildPlaceConfig() : any {
        return this._buildPlaceConfig;
    }
    
    //初始化配置表
    initComponent() {
        this._buildPlaceConfig = {
            "tree": {
                "prefab": gridManager.Instance.tree,
                "class": tree
            },
            "tBase": {
                "prefab": this.tBase_t,
                "class": tBase
            },
            "woodBox": {
                "prefab": this.woodbox_b,
                "class": woodBox
            }
        };
    }



    //放置
    public placeBuild(center: Vec2, name: string) {
        var obj = null;
        if (this._buildPlaceConfig[name]) {
            obj = instantiate(this._buildPlaceConfig[name].prefab);
            var obstaleLayer = this.node.getChildByName("obstaleLayer")
            obstaleLayer.addChild(obj);
            obj.position = this.getComponent(gridManager).gridComponentArr[center.x][center.y].node.position;
            //初始化位置Index
            console.log("*****",this._buildPlaceConfig);
            
            obj.getComponent(this._buildPlaceConfig[name].class).init(center);
            //排序(遮挡关系)
            this.node.getComponent(tankManager).setSiblingIndex_Layer(obstaleLayer)
        } else {
            alert("生成失败")
            return null;
        }
        return obj.getComponent(this._buildPlaceConfig[name].class)
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


