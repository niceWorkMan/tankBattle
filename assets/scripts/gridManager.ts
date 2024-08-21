import { _decorator, Component, EventKeyboard, Input, input, instantiate, KeyCode, Node, Prefab, SystemEvent, Vec3 } from 'cc';
import { grid } from './grid';
import { tank } from './tank';
const { ccclass, property } = _decorator;

@ccclass('gridManager')
export class gridManager extends Component {
    @property(Prefab) gridPrefab: Prefab;
    @property(Prefab) tankBase: Prefab;
    //格子对象数组
    private _gridNodeArr: Node[][] = [];
    //grid起始位置
    private _gridStartPos = { x: -690, y: -270 }
    //坦克对象池
    private _tankPool: tank[] = [];

    get gridStartPos() {
        return this._gridStartPos;
    }

    private _gridMatrix = { row: 24, colum: 10 }
    get gridMatrix() {
        return this._gridMatrix;
    }

    start() {
        //按钮测试
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

        //生成网格
        this.spawnGrid();
    }

    //初始化网格
    spawnGrid() {
        for (var i = 0; i < this._gridMatrix.row; i++) {
            var _gridArr_ins: Node[] = [];
            for (var j = 0; j < this._gridMatrix.colum; j++) {
                var _grid: Node = instantiate(this.gridPrefab);
                this.node.addChild(_grid);
                _grid.setPosition(new Vec3(this.gridStartPos.x + i * 60, this.gridStartPos.y + j * 60));
                var gScript = _grid.getComponent(grid)
                //加入数组
                _gridArr_ins.push(_grid);
                if (gScript)
                    gScript.setIndexLabel(i, j);
            }
            this._gridNodeArr.push(_gridArr_ins);
        }
    }
    //键盘监听
    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                // console.log('Press a A');
                // var gScript = this._gridNodeArr[16][2].getComponent(grid);
                // gScript.tweenColor();

                this.generateTankByCellIndex(15, 8);
                break;
        }
    }

    //通过ID获取位置
    getPositionByCellIndex(x, y) {
        console.log(x, y);
        var originPos = this._gridNodeArr[x][y].getPosition();
        return originPos;
    }

    checkXY(x, y) {
        var isVaildIndex = (x >= 0 && x <= 23) && (y >= 0 && y <= 9);
        if(!isVaildIndex)
            console.error("输入索引越界");
        return isVaildIndex;
    }




    //生成坦克在格子上
    generateTankByCellIndex(x, y) {
        this.checkXY(x,y);
        var tank: Node = instantiate(this.tankBase);
        this.node.addChild(tank);
        var pos = this.getPositionByCellIndex(x, y);
        console.log("pos", pos);

        tank.setPosition(pos);
    }




    update(deltaTime: number) {

    }
}


