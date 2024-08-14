import { _decorator, Component, instantiate, Node, Prefab, resources, Vec2, Vec3 } from 'cc';
import { grid } from './grid';
const { ccclass, property } = _decorator;

@ccclass('gridManager')
export class gridManager extends Component {
    @property(Prefab) gridPrefab: Prefab;
    //grid起始位置
    private _gridStartPos = { x: -690, y: -270 }

    get gridStartPos() {
        return this._gridStartPos;
    }

    private _gridMatrix = { row: 24, colum: 10 }
    get gridMatrix() {
        return this._gridMatrix;
    }

    start() {
        this.spawnGrid();
    }

    spawnGrid() {
        for (var i = 0; i < this._gridMatrix.row; i++) {
            for (var j = 0; j < this._gridMatrix.colum; j++) {
                ;
                var _grid: Node = instantiate(this.gridPrefab)
                this.node.addChild(_grid);
                _grid.setPosition(new Vec3(this.gridStartPos.x + i * 60, this.gridStartPos.y + j * 60));
                var gScript = _grid.getComponent(grid)
                if(gScript)
                    gScript.setIndexLabel(i,j);
            }
        }
    }


    update(deltaTime: number) {

    }
}


