import { _decorator, Component, Node, Vec2 } from 'cc';
import { editorManager } from '../editorManager';
const { ccclass, property } = _decorator;

@ccclass('obstaleBase')
export class obstaleBase extends Component {
    start() {

    }


    protected isAllow(pos:Vec2,isAllow){
        var editor=editorManager.Instance;
        editor.spawnEditors([new Vec2(pos.x,pos.y)],isAllow);
    }



    update(deltaTime: number) {

    }
}


