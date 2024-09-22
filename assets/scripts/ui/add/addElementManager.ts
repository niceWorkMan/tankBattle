import { _decorator, Component, instantiate, Node, NodeEventType, Prefab, Vec2, Vec3 } from 'cc';
import { gridManager } from '../../gridManager';
import { addElItem } from './addElItem';
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

    update(deltaTime: number) {

    }

    //UI向外围辐射步数
    private _UiStep: number = 3
    //存UI
    private _UiArr: Node[] = [];


    public initAddUI(center: Vec2) {
        this.clearUI();

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
        var space = 90;

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

        //排序
        this.sortBuildUI(gridArr, center);
        //生成
        gridArr.forEach(element => {
            var g = instantiate(this.elBtnitem);
            this.node.addChild(g);
            var offset = new Vec2(element.x - center.x, element.y - center.y);
            var oPos = new Vec3(offset.x * space, offset.y * space, 0)
            g.position = oPos
            this._UiArr.push(g);
            var a = g.getComponent(addElItem)
            a.updateLab(gridArr.indexOf(element) + "");
        });


        //测试
        var posArr = this.generateSpiralMatrix(center);
        for (var i = 0; i < posArr.length; i++) {
            console.log(posArr[i]);

        }
    }



    private sortBuildUI(gridArr: Vec2[], center: Vec2) {
        for (var i = 0; i < gridArr.length; i++) {
            for (var j = 0; j < gridArr.length - i - 1; j++) {
                var iH = Math.sqrt(Math.pow(gridArr[i].x - center.x, 2) + Math.pow(gridArr[i].y - center.y, 2));
                var jH = Math.sqrt(Math.pow(gridArr[j].x - center.x, 2) + Math.pow(gridArr[j].y - center.y, 2));
                if (jH >= iH) {
                    var temp = gridArr[i];
                    gridArr[i] = gridArr[j];
                    gridArr[j] = temp;
                }
            }
        }
    }


    generateSpiralMatrix(center: Vec2) {
        var posArr: Vec2[] = [];
        //center=new Vec2(center.x-1,center.y-1)
        //3-up
        posArr.push(new Vec2(center.x - 1, center.y + 1));
        posArr.push(new Vec2(center.x, center.y + 1));
        posArr.push(new Vec2(center.x + 1, center.y + 1));
        //3-right
        posArr.push(new Vec2(center.x + 1, center.y));
        posArr.push(new Vec2(center.x + 1, center.y - 1));
        //3-bottom
        posArr.push(new Vec2(center.x, center.y - 1));
        posArr.push(new Vec2(center.x - 1, center.y - 1));
        //3-left
        posArr.push(new Vec2(center.x - 1, center.y));

        //5-up
        posArr.push(new Vec2(center.x - 2, center.y + 2));
        posArr.push(new Vec2(center.x - 1, center.y + 2));
        posArr.push(new Vec2(center.x, center.y + 2));
        posArr.push(new Vec2(center.x + 1, center.y + 2));
        posArr.push(new Vec2(center.x + 2, center.y + 2));
        //5-right
        posArr.push(new Vec2(center.x + 2, center.y + 1));
        posArr.push(new Vec2(center.x + 2, center.y));
        posArr.push(new Vec2(center.x + 2, center.y - 1));
        posArr.push(new Vec2(center.x + 2, center.y - 2));
        //5-bottom
        posArr.push(new Vec2(center.x + 1, center.y - 2));
        posArr.push(new Vec2(center.x, center.y - 2));
        posArr.push(new Vec2(center.x - 1, center.y - 2));
        posArr.push(new Vec2(center.x - 2, center.y - 2));
        //5-left
        posArr.push(new Vec2(center.x - 2, center.y - 1));
        posArr.push(new Vec2(center.x - 2, center.y));
        posArr.push(new Vec2(center.x - 2, center.y + 1));


         //7-up-------------------------------------------------------------------------------------------------
         posArr.push(new Vec2(center.x - 3, center.y + 3));
         posArr.push(new Vec2(center.x - 2, center.y + 3));
         posArr.push(new Vec2(center.x - 1, center.y + 3));
         posArr.push(new Vec2(center.x, center.y + 2));
         posArr.push(new Vec2(center.x + 1, center.y + 3));
         posArr.push(new Vec2(center.x + 2, center.y + 3));
         posArr.push(new Vec2(center.x + 3, center.y + 3));
         //5-right
         posArr.push(new Vec2(center.x + 3, center.y + 2));
         posArr.push(new Vec2(center.x + 3, center.y + 1));
         posArr.push(new Vec2(center.x + 3, center.y));
         posArr.push(new Vec2(center.x + 3, center.y - 1));
         posArr.push(new Vec2(center.x + 3, center.y - 2));
         posArr.push(new Vec2(center.x + 3, center.y - 3));
         //5-bottom
         posArr.push(new Vec2(center.x + 2, center.y - 3));
         posArr.push(new Vec2(center.x + 1, center.y - 3));
         posArr.push(new Vec2(center.x, center.y - 3));
         posArr.push(new Vec2(center.x - 1, center.y - 3));
         posArr.push(new Vec2(center.x - 2, center.y - 3));
         posArr.push(new Vec2(center.x - 3, center.y - 3));
         //5-left
         posArr.push(new Vec2(center.x - 3, center.y - 2));
         posArr.push(new Vec2(center.x - 3, center.y - 1));
         posArr.push(new Vec2(center.x - 3, center.y));
         posArr.push(new Vec2(center.x - 3, center.y + 1));
         posArr.push(new Vec2(center.x - 3, center.y + 2));

        return posArr;
    }

    private clearUI() {
        if (this._UiArr.length > 0) {
            this._UiArr.forEach(element => {
                element.destroy();
            });
        }
        this._UiArr.length = 0;
    }

    getUIPosArr() {

    }
}


