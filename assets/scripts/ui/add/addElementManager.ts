import { _decorator, Component, instantiate, log, Node, NodeEventType, Prefab, Vec2, Vec3 } from 'cc';
import { gridManager } from '../../gridManager';
import { addElItem } from './addElItem';
import { grid } from '../../grid';
const { ccclass, property } = _decorator;

@ccclass('addElementManager')
export class addElementManager extends Component {

    @property(Prefab) elBtnitem: Prefab;

    start() {
        this.node.on(NodeEventType.TOUCH_START, (e) => {
            //不向上冒泡
            e.bubbles = false;
            //再次点击删除建造菜单
            this.clearUI();
            this.node.destroy();
        })

    }

    //对外暴露清除
    public clear() {
        this.clearUI();
        this.node.destroy();
    }

    update(deltaTime: number) {

    }

    //UI向外围辐射步数
    private _UiStep: number = 3
    //存UI
    private _UiArr: Node[] = [];
    //存储建造格子位置
    private _gridArr: Vec2[] = [];

    private _lastCenter:Vec2;

    //重新设置menu
    public reInitAddUI(conf){
        this.initAddUI(this._lastCenter,conf);
    }


    public initAddUI(center: Vec2, conf) {
        this.clearUI();

        this._lastCenter=center;
        var matrix = gridManager.Instance.getGridMatrix;
        var gridArr: Vec2[] = [];

        var iMin = center.x - this._UiStep;
        var iMax = center.x + this._UiStep;

        var jMin = center.y - this._UiStep;
        var jMax = center.y + this._UiStep;

        for (var i = iMin; i <= iMax; i++) {
            for (var j = jMin; j <= jMax; j++) {
                //不娶中间位置
                if (!(center.x == i && center.y == j)) {
                    if ((i >= 0 && i < matrix.row) && (j >= 0 && j < matrix.colum)) {
                        gridArr.push(new Vec2(i, j));
                    }
                }
            }
        }
        var space = 80;
        //左下 右上
        var ld = gridManager.Instance.getPositionByCellIndex(0, 0);
        var rt = gridManager.Instance.getPositionByCellIndex(matrix.row - 1, matrix.colum - 1);
        var centerNodeWorldPos = gridManager.Instance.getPositionByCellIndex(center.x, center.y);
        //去除超出边界的对象
        gridArr = gridArr.filter(element => {
            var offset = new Vec2(element.x - center.x, element.y - center.y);
            var oPos = new Vec3(offset.x * space, offset.y * space, 0)
            //中间位置
            oPos = new Vec3(oPos.x + centerNodeWorldPos.x, oPos.y + centerNodeWorldPos.y, 0)
            return (oPos.x >= ld.x && oPos.y >= ld.y && oPos.x <= rt.x && oPos.y <= rt.y);
        })
        //螺旋矩阵排序
        var posArr = this.generateSpiralMatrix(center);
        //设置两个数组长度一样
        var checkSame = (element) => {
            var isSame = false
            for (var i = 0; i < gridArr.length; i++) {
                //索引相同但位置不同
                if (element.x == gridArr[i].x && element.y == gridArr[i].y) {
                    isSame = true;
                    break;
                }
            }
            return isSame;
        }
        //过滤掉不同的点
        posArr = posArr.filter((item, index) => {
            return checkSame(item);
        })
        //交换顺序 排序
        for (var z = 0; z < posArr.length; z++) {
            for (var c = 0; c < gridArr.length; c++) {
                //索引相同但位置不同
                if (posArr[z].x == gridArr[c].x && posArr[z].y == gridArr[c].y && z != c) {
                    var temp = gridArr[c];
                    gridArr[c] = gridArr[z];
                    gridArr[z] = temp;

                }
            }
        }
        //生成对应物品
        gridArr.forEach(element => {
            var index = gridArr.indexOf(element);
            //只生成有数据的
            if (index < conf.length) {
                var g = instantiate(this.elBtnitem);
                this.node.addChild(g);
                var offset = new Vec2(element.x - center.x, element.y - center.y);
                var oPos = new Vec3(offset.x * space, offset.y * space, 0)
                g.position = oPos
                this._UiArr.push(g);
                var a = g.getComponent(addElItem)
                //初始化图标
                a.initIcon(conf[index]);
                //索引测试
                a.updateLab(gridArr.indexOf(element) + "");
            }
        });
        //存储建造位置
        this._gridArr = gridArr;
        console.log("conf:", conf);

    }






    generateSpiralMatrix(center: Vec2) {
        var _posArr = [];
        //3-up
        this.push(_posArr, new Vec2(center.x - 1, center.y + 1));
        this.push(_posArr, new Vec2(center.x, center.y + 1));
        this.push(_posArr, new Vec2(center.x + 1, center.y + 1));
        //3-right
        this.push(_posArr, new Vec2(center.x + 1, center.y));
        this.push(_posArr, new Vec2(center.x + 1, center.y - 1));
        //3-bottom
        this.push(_posArr, new Vec2(center.x, center.y - 1));
        this.push(_posArr, new Vec2(center.x - 1, center.y - 1));
        //3-left
        this.push(_posArr, new Vec2(center.x - 1, center.y));

        //5-up
        this.push(_posArr, new Vec2(center.x - 2, center.y + 2));
        this.push(_posArr, new Vec2(center.x - 1, center.y + 2));
        this.push(_posArr, new Vec2(center.x, center.y + 2));
        this.push(_posArr, new Vec2(center.x + 1, center.y + 2));
        this.push(_posArr, new Vec2(center.x + 2, center.y + 2));
        //5-right
        this.push(_posArr, new Vec2(center.x + 2, center.y + 1));
        this.push(_posArr, new Vec2(center.x + 2, center.y));
        this.push(_posArr, new Vec2(center.x + 2, center.y - 1));
        this.push(_posArr, new Vec2(center.x + 2, center.y - 2));
        //5-bottom
        this.push(_posArr, new Vec2(center.x + 1, center.y - 2));
        this.push(_posArr, new Vec2(center.x, center.y - 2));
        this.push(_posArr, new Vec2(center.x - 1, center.y - 2));
        this.push(_posArr, new Vec2(center.x - 2, center.y - 2));
        //5-left
        this.push(_posArr, new Vec2(center.x - 2, center.y - 1));
        this.push(_posArr, new Vec2(center.x - 2, center.y));
        this.push(_posArr, new Vec2(center.x - 2, center.y + 1));


        //7-up-------------------------------------------------------------------------------------------------
        this.push(_posArr, new Vec2(center.x - 3, center.y + 3));
        this.push(_posArr, new Vec2(center.x - 2, center.y + 3));
        this.push(_posArr, new Vec2(center.x - 1, center.y + 3));
        this.push(_posArr, new Vec2(center.x, center.y + 3));
        this.push(_posArr, new Vec2(center.x + 1, center.y + 3));
        this.push(_posArr, new Vec2(center.x + 2, center.y + 3));
        this.push(_posArr, new Vec2(center.x + 3, center.y + 3));
        //5-right
        this.push(_posArr, new Vec2(center.x + 3, center.y + 2));
        this.push(_posArr, new Vec2(center.x + 3, center.y + 1));
        this.push(_posArr, new Vec2(center.x + 3, center.y));
        this.push(_posArr, new Vec2(center.x + 3, center.y - 1));
        this.push(_posArr, new Vec2(center.x + 3, center.y - 2));
        this.push(_posArr, new Vec2(center.x + 3, center.y - 3));
        //5-bottom
        this.push(_posArr, new Vec2(center.x + 2, center.y - 3));
        this.push(_posArr, new Vec2(center.x + 1, center.y - 3));
        this.push(_posArr, new Vec2(center.x, center.y - 3));
        this.push(_posArr, new Vec2(center.x - 1, center.y - 3));
        this.push(_posArr, new Vec2(center.x - 2, center.y - 3));
        this.push(_posArr, new Vec2(center.x - 3, center.y - 3));
        //5-left
        this.push(_posArr, new Vec2(center.x - 3, center.y - 2));
        this.push(_posArr, new Vec2(center.x - 3, center.y - 1));
        this.push(_posArr, new Vec2(center.x - 3, center.y));
        this.push(_posArr, new Vec2(center.x - 3, center.y + 1));
        this.push(_posArr, new Vec2(center.x - 3, center.y + 2));
        return _posArr;
    }

    //螺旋矩阵添加
    private push(_posArr: Vec2[], pos: Vec2) {
        var matrix = gridManager.Instance.getGridMatrix;
        console.log("matrix:", matrix);
        if ((pos.x >= 0 && pos.x < matrix.row) && (pos.y >= 0 && pos.y < matrix.colum)) {
            _posArr.push(pos)
        }
    }

    private clearUI() {
        if (this._UiArr.length > 0) {
            this._UiArr.forEach(element => {
                element.destroy();
            });
        }
        this._UiArr.length = 0;
        this._gridArr.length = 0;
    }

    getUIPosArr() {

    }
}


