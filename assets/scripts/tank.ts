import { _decorator, Component, Node } from 'cc';
import { grid } from './grid';
import { aStar } from './core/aStar';
const { ccclass, property } = _decorator;

@ccclass('tank')
export class tank extends Component {
    start() {

    }
   
    //路径
    private _pathList:grid[];
    public set pathList(v : grid[]) {
        this._pathList = v;
    }

    //aStar
    private _aStar:aStar;
    public set aStar(v : aStar) {
        this. _aStar= v;
    }
    
    

    update(deltaTime: number) {
        
    }
}


