import { _decorator, Component, Node, Vec2 } from 'cc';
import { editorManager } from '../editorManager';
import { digresType } from '../common/digresType';
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

    
    

    /**
     * 是否显示选中 格子框
     * @param pos 
     * @param isAllow 
     */
    protected isAllow(pos:Vec2,isAllow){
        var editor=editorManager.Instance;
        editor.spawnEditors([new Vec2(pos.x,pos.y)],isAllow);
    }

    public init(pos:Vec2){
        this._cellX=pos.x;
        this._cellY=pos.y;
    }


     //资源类型
     protected _digresType:digresType=digresType.none;
     public get dresType() : digresType {
         return this._digresType;
     }


     /**
      * 开采效果节点
      */
     protected _effect:Node=null;
     /**
      * 播放开采动画
      */
     public playDigEffect(){
     }



    update(deltaTime: number) {

    }
}


