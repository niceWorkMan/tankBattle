import { _decorator, Color, Component, Node, Sprite, tween, Vec2, Vec3 } from 'cc';
import { element } from './element';
import { grid } from '../grid';
const { ccclass, property } = _decorator;

@ccclass('boy01')
export class boy01 extends element {
    start() {

    }

       //移动核心逻辑
   override tweenMove(nextIndex: number, closeList: grid[]) {
    //判断当前tank是否存在
    if (!this.node) {
        return;
    }
    this.startGrid = closeList[nextIndex];
    if (closeList.length == 0) {
        alert("错误的closeList长度")
    }
    //到达最后一个点,移动结束
    if (nextIndex == closeList.length - 1) {
        this.node.active = false;
        this.destorySelf();
        return;
    }

    //如果下一个目标点是障碍
    if (nextIndex + 1 <= closeList.length - 1) {

        //更新当前坐标
        this.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY);
        //检测下个坐标是否有障碍物
        if (this._gManager.gridComponentArr[closeList[nextIndex + 1].cellX][closeList[nextIndex + 1].cellY].isObstacle) {
            this.startNav();
        }
        else {
            //不是相邻格子
            if (Math.abs(closeList[nextIndex].cellX - closeList[nextIndex + 1].cellX) > 1 || Math.abs(closeList[nextIndex].cellY - closeList[nextIndex + 1].cellY) > 1) {
                this.getComponent(Sprite).color = new Color(0, 0, 0, 225)
                //重新寻路时,当前格子一定要清空障碍属性；
                this._gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = false;
                //重新导航
                this.startNav();
                return;
            }
            //位移
            var twMove = tween(this.node).to(this.moveSpeed, { position: closeList[nextIndex].getPosition() }, {
                onUpdate: () => {
                },
                onComplete: () => {
                    //射击部分---------------------------------------
                    //设置当前tank坐标
                    this.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY)
                    //目标坦克
                    var targetTank = this.tManager.searchAttakTarget(this);
                    //攻击源坦克
                    twMove.removeSelf();
                    if (nextIndex + 1 <= closeList.length - 1) {
                        //车辆转弯   
                        var radian = Math.atan2(closeList[nextIndex + 1].cellY - closeList[nextIndex].cellY, closeList[nextIndex + 1].cellX - closeList[nextIndex].cellX);
                        var targetRot = radian * (180 / Math.PI);
                        if (this.node.eulerAngles.z !== targetRot) {
                            this.node.eulerAngles = new Vec3(0, 0, targetRot);
                        }
                        //继续移动
                        nextIndex++;
                        this.tweenMove(nextIndex, closeList);
                    }
                    else {

                    }
                    //-----------------------------------------------

                }
            }).start();
        }
        //更新格子
        this.gManager.upDataObstale();

    }
    //list最后一个不设置Obstale
    else {
        this.nodeInGridCellIndex = new Vec2(-1, -1);
    }


}

    update(deltaTime: number) {
        
    }
}


