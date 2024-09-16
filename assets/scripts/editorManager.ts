import { _decorator, Component, instantiate, Node, Prefab, Vec2 } from 'cc';
import { gridManager } from './gridManager';
const { ccclass, property } = _decorator;

@ccclass('editorManager')
export class editorManager extends Component {
    @property(Prefab) edtorNode: Prefab;

    start() {

    }

    //编辑器区域集合
    private _edtorNodeArr: Node[]=[];

    //清除
    private clearEditor(){
        for(var i=0;i<this._edtorNodeArr.length;i++){
            if(this._edtorNodeArr[i]){
                this._edtorNodeArr[i].destroy();
            }
        }
        this._edtorNodeArr.length=0;
    }

    private spawnEditorNode(pos:Vec2) {
        var gManager=this.getComponent(gridManager);
        var editorLayer=this.node.getChildByName("editorLayer");
        var obj = instantiate(this.edtorNode)
        editorLayer.addChild(obj)
        this._edtorNodeArr.push(obj);
        obj.position=gManager.gridComponentArr[pos.x][pos.y].node.position;
    }


    public spawnEditors(posArr:Vec2[]){
        this.clearEditor();
        for(var i=0;i<posArr.length;i++){
            this.spawnEditorNode(posArr[i]);
        }
    }

    update(deltaTime: number) {

    }
}


