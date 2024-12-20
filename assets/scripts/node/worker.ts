import { _decorator, Animation, Collider2D, Color, Component, Contact2DType, instantiate, IPhysics2DContact, Node, Sprite, tween, Vec2, Vec3 } from 'cc';
import { element } from './element';
import { grid } from '../grid';
import { aStar } from '../core/aStar';
import { gridManager } from '../gridManager';
import { tankManager } from '../tankManager';
import { grid_c } from '../core/grid_c';
import { buildType } from '../common/buildType';
import { digresType } from '../common/digresType';
import { editorManager } from '../editorManager';
import { buildBase } from '../building/buildBase';
import { userData } from '../common/userData';
import { UIManager } from '../UIManager';
import { attentionDigRes } from '../ui/attention/attentionDigRes';
import { woodBox } from '../building/woodBox';
const { ccclass, property } = _decorator;

@ccclass('worker')
export class worker extends element {

    constructor() {
        super();
        //初始化config的key
        this._key = "worker";
        //不属于建筑类型
        this.buildType = buildType.none;
        //掘取资源类型(木头)
        this._digresType = digresType.wood;
    }
    private animClip: Animation;

    start(): void {
        this.nodeCollider = this.getComponent(Collider2D);
        this.nodeCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        //设置移动速度
        this.moveSpeed = 0.9;

        this.getComponent(aStar).key = this._key
        //默认动画
        this.animClip = this.node.getComponent(Animation);
    }

    /**
     * 掘取路线
     * @param nextIndex 
     * @param closeList 
     */
    digPathMove(nextIndex: number, closeList: grid_c[]) {
        if (this.sleep) {
            return;
        }
        //类
        var cls = editorManager.Instance.propertyConfig[this._digBelongBuild.targetKey].class
        //资源位置
        var resPosition = this._digBelongBuild.digResTarget.node.position;
        //建筑位置
        var buildPos = this._digBelongBuild.node.position;



        var star = this.getComponent(aStar);
        star.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY);

        var pointIndex: number = this._digBelongBuild.isStartOrEndPos(new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY));
        //console.log("到达点:"+pointIndex);

        var posStart; 
        var posEnd;
        var lastPos = this.node.getComponent(aStar).getPosition(closeList[nextIndex]);

        if (pointIndex == null) {
            pointIndex = 0;
            posStart = star.nodeInGridCellIndex;
            posEnd =this._digBelongBuild.resPathPoints[1]
        } else {
            posStart = this._digBelongBuild.resPathPoints[pointIndex];
            posEnd=this._digBelongBuild.resPathPoints[1 - pointIndex];
        }

        if (pointIndex != null) {
            switch (pointIndex) {
                case 0:
                    this._tweenAnim = tween(this.node).to(this.moveSpeed, { position: new Vec3((lastPos.x + buildPos.x) / 2, (lastPos.y + buildPos.y) / 2, lastPos.z) }, {
                        onComplete: () => {
                            if (!this._digBelongBuild.node) {
                                return;
                            }
                            star.startGrid = gridManager.Instance.gridComponentArr[posStart.x][posStart.y];
                            star.endGrid = gridManager.Instance.gridComponentArr[posEnd.x][posEnd.y];
                            star.finalGrid = gridManager.Instance.gridComponentArr[posEnd.x][posEnd.y];
                            star.nodeInGridCellIndex = new Vec2(star.startGrid.cellX, star.startGrid.cellY);

                            var attentionUI = UIManager.Instance.node.getChildByName("AttentionUI");
                            //获得木材资源
                            userData.Instance.woodNum += this._digSpeed;
                            var att = instantiate(UIManager.Instance.attentionDigResPrefab);
                            attentionUI.addChild(att);
                            att.position = new Vec3(this._digBelongBuild.node.position.x + 40, this._digBelongBuild.node.position.y, this._digBelongBuild.node.position.z);
                            att.getComponent(attentionDigRes).initAttention("wood", this._digSpeed);

                            //开始导航
                            closeList.length = 0;
                            star.startNav();
                        }
                    }).start()
                    break;
                case 1:
                    console.log("锯木");
                    this._tweenAnim = tween(this.node).to(this.moveSpeed, { position: new Vec3((lastPos.x + resPosition.x) / 2, (lastPos.y + resPosition.y) / 2, lastPos.z) }, {
                        onComplete: () => {
                            //运动
                            var count = Math.floor(this._resFullNum / this._digSpeed);
                            var i = 0;
                            var intval = setInterval(() => {
                                i++;
                                if (i > 0) {
                                    //清除
                                    clearInterval(intval);
                                    //设置结束点
                                    star.startGrid = gridManager.Instance.gridComponentArr[posStart.x][posStart.y];
                                    star.endGrid = gridManager.Instance.gridComponentArr[posEnd.x][posEnd.y];
                                    star.finalGrid = gridManager.Instance.gridComponentArr[posEnd.x][posEnd.y];
                                    //树

                                    //开始导航
                                    closeList.length = 0;
                                    star.startNav();
                                }
                            }, 500);

                            //锯木
                            var t: any = this._digBelongBuild.digResTarget.getComponent(cls)
                            t.playDigEffect();
                        }
                    }).start()
                    break;
            }
        } else {
            //重新生成一个导航
            var wb: any = this._digBelongBuild.node.getComponent(cls)
            wb.reSpawnOne();
            //删除自己
            this.destroyTarget();
            console.warn("没找到start end 点")
        }
    }

    /**
     * 不移动直接获取资源
     */
    public digOneGrid() {
        this.node.active = true;
        if (this.sleep) {
            return;
        }

        //资源位置
        var resPosition = this._digBelongBuild.digResTarget.node.position;
        //建筑位置
        var buildPos = this._digBelongBuild.node.position;

        var startPos = new Vec3((this.node.position.x + buildPos.x) / 2, (this.node.position.y + buildPos.y) / 2, this.node.position.z)
        var endPos = new Vec3((this.node.position.x + resPosition.x) / 2, (this.node.position.y + resPosition.y) / 2, this.node.position.z)

        this.node.position = startPos;
        var attentionUI = UIManager.Instance.node.getChildByName("AttentionUI");

        var moveEnd = () => {
            tween(this.node).to(this.moveSpeed, { position: endPos }, {
                onComplete: () => {
                    if (this.sleep) {
                        return;
                    }
                    var att = instantiate(UIManager.Instance.attentionDigResPrefab);
                    attentionUI.addChild(att);
                    att.position = new Vec3(this._digBelongBuild.node.position.x + 40, this._digBelongBuild.node.position.y, this._digBelongBuild.node.position.z);
                    att.getComponent(attentionDigRes).initAttention("wood", this._digSpeed);
                    //更新数据
                    userData.Instance.woodNum += this._digSpeed;
                    //--------------------
                    moveStart();
                }
            }).start();
        }

        var moveStart = () => {
            if (this.sleep) {
                return;
            }
            tween(this.node).to(this.moveSpeed, { position: startPos }, {
                onComplete: () => {
                    moveEnd();
                }
            }).start();
        }

        //移动到结尾位置
        moveEnd();

    }

    //移动核心逻辑
    override tweenMove(nextIndex: number, closeList: grid_c[]) {
        var star = this.getComponent(aStar);
        //对象池中跳出
        if (this.sleep) {
            return;
        }

        if (!this.node) {
            return;
        }

        //是否暂停
        if (this.isPause) {
            this._stopIndex = nextIndex;
            this._closeList = closeList;
            return;
        }
        //如果不存在
        if (!closeList[nextIndex]) {
            return;
        }

        this._gManager = this.node.parent.parent.getComponent(gridManager)
        this._tankManager = this.node.parent.parent.getComponent(tankManager);


        //判断当前tank是否存在
        if (!this.node) {
            return;
        }
        //设置下一个起点  不然不连续
        if (closeList[nextIndex])
            star.startGrid = this._gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY];
        else {
            console.log("起点未设置");
        }

        if (closeList.length == 0) {
            console.log("错误的closeList长度");

        }

        //到达最后一个点,移动结束
        //到达最后一个点,移动结束
        if (nextIndex == closeList.length - 1) {
            //判断是否真的移动到终点
            if (star.endGrid == star.finalGrid) {
                //核心调取
                this.digPathMove(nextIndex, closeList);
            }
            else {
                console.log("重新导航");
                //设置结束点为最终终点
                star.endGrid = star.finalGrid
                //继续导航
                star.startNav();
            }
            return;
        }

        //如果下一个目标点是障碍
        if (nextIndex + 1 <= closeList.length - 1) {

            //更新当前坐标
            star.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY);
            //检测下个坐标是否有障碍物
            if (this._gManager.gridComponentArr[closeList[nextIndex + 1].cellX][closeList[nextIndex + 1].cellY].isObstacle) {
                star.startNav()
            }
            else {
                //不是相邻格子
                if (Math.abs(closeList[nextIndex].cellX - closeList[nextIndex + 1].cellX) > 1 || Math.abs(closeList[nextIndex].cellY - closeList[nextIndex + 1].cellY) > 1) {
                    this.getComponent(Sprite).color = new Color(0, 0, 0, 225)
                    //重新寻路时,当前格子一定要清空障碍属性；
                    this._gManager.gridComponentArr[closeList[nextIndex].cellX][closeList[nextIndex].cellY].isObstacle = false;
                    //重新导航
                    star.startNav();
                    return;
                }
                //位移

                var radian = Math.atan2(closeList[nextIndex + 1].cellY - closeList[nextIndex].cellY, closeList[nextIndex + 1].cellX - closeList[nextIndex].cellX);
                var targetRot = radian * (180 / Math.PI);

                if (nextIndex - 1 >= 0) {
                    if (closeList[nextIndex].cellY - closeList[nextIndex - 1].cellY == 1) {
                        this.animClip.play('boy01_up');
                    }
                    if (closeList[nextIndex].cellY - closeList[nextIndex - 1].cellY == -1) {
                        this.animClip.play('boy01_down');
                    }
                    if (closeList[nextIndex].cellX - closeList[nextIndex - 1].cellX == 1) {
                        this.animClip.play('boy01_right');
                    } if (closeList[nextIndex].cellX - closeList[nextIndex - 1].cellX == -1) {
                        this.animClip.play('boy01_left');
                    }
                }



                this._tweenAnim = tween(this.node).to(this.moveSpeed, { position: this.node.getComponent(aStar).getPosition(closeList[nextIndex]) }, {
                    onUpdate: () => {
                    },
                    onComplete: () => {
                        if (this.isPause || this.sleep) {
                            // 动画带delay 再次判断是否需要跳出
                            return;
                        }
                        //不存在了
                        if (!closeList[nextIndex]) {
                            return;
                        }
                        //射击部分---------------------------------------
                        //设置当前tank坐标
                        star.nodeInGridCellIndex = new Vec2(closeList[nextIndex].cellX, closeList[nextIndex].cellY)
                        //攻击源坦克
                        this._tweenAnim.removeSelf();
                        if (nextIndex + 1 <= closeList.length - 1) {
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
            //更新格子(人不给占位)
            //this.gManager.upDataObstale();

        }
        //list最后一个不设置Obstale
        else {
            //判断是否真的移动到终点
            if (star.endGrid == star.finalGrid) {
                if (this.node) {
                    //this.destorySelf();

                }
            }
            else {
                //设置结束点为最终终点
                star.endGrid = star.finalGrid
                star.nodeInGridCellIndex = new Vec2(star.endGrid.cellX, star.endGrid.cellY);
                //继续导航
                star.startNav();
                alert("重新导航")
            }
        }


    }



    //碰撞检测函数
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    update(deltaTime: number) {

    }
}


