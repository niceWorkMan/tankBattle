import { _decorator, Component, Node } from 'cc';
import { buildType } from '../common/buildType';
import { enumTeam } from '../common/enumTeam';
const { ccclass, property } = _decorator;

@ccclass('base')
export class base extends Component {

    //配置键
    protected _key: string;
    public set key(v: string) {
        this._key = v;
    }
    public get key(): string {
        return this._key
    }


    
    //建筑类型
    protected _buildType: buildType = buildType.none;
    public get buildType(): buildType {
        return this._buildType;
    }



    //当前所属队伍
    protected _team: enumTeam;
    public get team(): enumTeam {
        return this._team
    }
    public set team(v: enumTeam) {
        this._team = v;
    }








    start() {

    }

    update(deltaTime: number) {

    }
}


