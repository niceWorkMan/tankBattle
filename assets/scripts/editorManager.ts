import { _decorator, Color, Component, instantiate, Node, Prefab, settings, Sprite, Vec2 } from 'cc';
import { gridManager } from './gridManager';
const { ccclass, property } = _decorator;

@ccclass('editorManager')
export class editorManager extends Component {
    @property(Prefab) edtorNode: Prefab;

    @property(Prefab) woodbox_b: Prefab;

    constructor() {
        super();
        //初始化
        editorManager._instance = this;
    }

    start() {
        this.initComponent();
    }


    private _buildPlaceConfig = {};
    //初始化配置表
    initComponent() {
        this._buildPlaceConfig={
            "woodBox":this.woodbox_b,
        };
    }



    //放置
    public placeBuild(center: Vec2, name: string) {
        if (this._buildPlaceConfig[name]) {
            var obj = instantiate(this._buildPlaceConfig[name]);
            this.node.getChildByName("obstaleLayer").addChild(obj);
            obj.position=this.getComponent(gridManager).gridComponentArr[center.x][center.y].node.position;
            alert("生成")
        } else {
            alert("生成失败")
        }
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
        if (!isAllown) {
            obj.getComponent(Sprite).color = new Color(255, 0, 102);
            setTimeout(() => {
                obj.destroy();
            }, 1000);
        }
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


