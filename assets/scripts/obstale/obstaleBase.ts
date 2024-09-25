import { _decorator, Component, Node, Vec2 } from 'cc';
import { editorManager } from '../editorManager';
const { ccclass, property } = _decorator;

@ccclass('obstaleBase')
export class obstaleBase extends Component {
    start() {

    }

    //所在索引
    protected _cellX:number;
    protected _cellY:number
    public get cellX() : number {
        return this._cellX;
    }
    
    public get cellY() : number {
        return this._cellY
    }
    
    


    protected isAllow(pos:Vec2,isAllow){
        var editor=editorManager.Instance;
        editor.spawnEditors([new Vec2(pos.x,pos.y)],isAllow);
    }

    public init(pos:Vec2){
        this._cellX=pos.x;
        this._cellY=pos.y;
    }



    update(deltaTime: number) {

    }
}


