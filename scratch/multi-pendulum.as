/**
 * Copyright kawamura ( http://wonderfl.net/user/kawamura )
 * MIT License ( http://www.opensource.org/licenses/mit-license.php )
 * Downloaded from: http://wonderfl.net/c/yQ1m
 */

package {
    import flash.display.Sprite;
    import flash.events.Event;
    import flash.geom.Point;
    import net.hires.debug.Stats;

    /**
     * ...
     * @author jaiko
     */
    public class Main extends Sprite
    {

        public function Main():void
        {
            if (stage) init();
            else addEventListener(Event.ADDED_TO_STAGE, init);
        }

        private function init(e:Event = null):void
        {
            removeEventListener(Event.ADDED_TO_STAGE, init);
            // entry point
            var veiw:View = new View();
            addChild(veiw);
            veiw.init();
            //
            addChild(new Stats);
        }
    }
}

import com.bit101.components.CheckBox;
import com.bit101.components.HSlider;
import com.bit101.components.InputText;
import com.bit101.components.Label;
import com.bit101.components.PushButton;
import flash.display.Sprite;
import flash.events.Event;
import flash.events.MouseEvent;

/**
 * ...
 * @author jaiko
 */
class View extends Sprite
{
    private var line:Line;
    private var hSlider:HSlider;
    private var lSlider:HSlider;
    private var gSlider:HSlider;
    private var rSlider:HSlider;
    private var hValue:InputText;
    private var lValue:InputText;
    private var gValue:InputText;
    private var rValue:InputText;

    public function View()
    {

    }

    public function init():void
    {
        line = new Line();
        addChild(line);
        line.start();
        //
        var vpLabel:Label = new Label(this, 95, 10);
        vpLabel.text = "Visible Point";
        var vpCheck:CheckBox = new CheckBox(this, 80, 15);
        vpCheck.addEventListener(MouseEvent.CLICK, visiblePointClickListener);
        vpCheck.selected = Model.isVisiblePoint;
        //
        var vLabel:Label = new Label(this, 195, 10);
        vLabel.text = "Visible Number";
        var vCheck:CheckBox = new CheckBox(this, 180, 15);
        vCheck.addEventListener(MouseEvent.CLICK, visibleCheckBoxClickListener);
        //

        var button:PushButton = new PushButton(this, 350, 5);
        button.label = "reset";
        addChild(button);
        button.addEventListener(MouseEvent.CLICK, function(event:MouseEvent):void{
            line.reset();
            }
        );
        var hLabel:Label = new Label(this, 70, 25);
        hLabel.text = String("Members");
        hValue = new InputText(this, 130, 28);
        hValue.width = 50;
        hValue.addEventListener(Event.CHANGE,hValueListener)
        hSlider = new HSlider(this, 200, 30);
        hSlider.width = 250;
        hSlider.value = Model.members;
        hSlider.minimum = Model.MEMBERS_MINI;
        hSlider.maximum = Model.MEMBERS_MAX;
        hSlider.addEventListener(Event.CHANGE , hSliderListener);
        setHSlider();
        //
        var lLabel:Label = new Label(this, 70, 45);
        lLabel.text = "Length :";
        lValue = new InputText(this, 130, 48);
        lValue.width = 50;
        lValue.addEventListener(Event.CHANGE, lValueListener);
        lSlider = new HSlider(this, 200, 50);
        lSlider.width = 250;
        lSlider.minimum = Model.LENGTH_MINI;
        lSlider.maximum = Model.LENGTH_MAX;
        lSlider.addEventListener(Event.CHANGE , lSliderListener);
        setLSlider();
        //
        var gLabel:Label = new Label(this, 70, 65);
        gLabel.text = "Gravity :";
        gValue = new InputText(this, 130, 68);
        gValue.width = 50;
        gValue.addEventListener(Event.CHANGE, gValueListener);
        gSlider = new HSlider(this, 200, 70);
        gSlider.width = 250;
        gSlider.minimum = Model.GRAVITY_MINI;
        gSlider.maximum = Model.GRAVITY_MAX;
        gSlider.value = Model.gravity;
        gSlider.addEventListener(Event.CHANGE , gSliderListener);
        setGSlider();
        //
        var rLabel:Label = new Label(this, 70, 85);
        rLabel.text = "Friction :";
        rValue = new InputText(this, 130, 88);
        rValue.width = 50;
        rValue.addEventListener(Event.CHANGE, rValueListener);
        rSlider = new HSlider(this, 200, 90);
        rSlider.width = 250;
        rSlider.minimum = Model.FRICTION_MINI;
        rSlider.maximum = Model.FRICTION_MAX;
        rSlider.value = Model.friction;
        rSlider.addEventListener(Event.CHANGE , rSliderListener);
        setFSlider();
    }

    private function visiblePointClickListener(event:MouseEvent):void
    {
        var Check:CheckBox = CheckBox(event.currentTarget);
        line.isVisiblePoint(Check.selected);
        //
        Model.isVisiblePoint = Check.selected
    }

    private function visibleCheckBoxClickListener(event:MouseEvent):void
    {
        var Check:CheckBox = CheckBox(event.currentTarget);
        line.isVisibleNumber(Check.selected);
        //
        Model.isVisibleNumber = Check.selected;
    }
    private function rValueListener(event:Event):void
    {
        var friction:Number = Number(rValue.text);
        if (!isNaN(friction)) {
            if (friction < Model.FRICTION_MINI) {
                friction = Model.FRICTION_MINI;
            }
            Model.friction = friction
            setFSlider();
        }
    }
    private function rSliderListener(event:Event):void
    {
        var friction:Number = rSlider.value;
        Model.friction = friction;
        setFSlider();
    }
    private function setFSlider():void
    {
        rSlider.value = Model.friction;
        rValue.text = String(Model.friction);
    }
    private function gValueListener(event:Event):void
    {
        var gravity:Number = Number(gValue.text);
        if (!isNaN(gravity)) {
            if (gravity < Model.GRAVITY_MINI) {
                gravity = Model.GRAVITY_MINI;
            }
            Model.gravity = gravity;
            setGSlider();
        }
    }

    private function gSliderListener(event:Event):void
    {
        var gravity:Number = gSlider.value;
        Model.gravity = gravity;
        setGSlider();
    }
    private function setGSlider():void
    {
        gSlider.value = Model.gravity;
        gValue.text = String(Model.gravity);
        //line.reset();
    }
    private function lValueListener(event:Event):void
    {
        var length:Number = Number(lValue.text);
        if (!isNaN(length)) {
            if (length < Model.LENGTH_MINI) {
                length = Model.LENGTH_MINI;
            }
            Model.length = uint(length);
            setLSlider();
        }
    }
    private function lSliderListener(event:Event):void
    {
        var length:uint = lSlider.value;
        Model.length = length;
        setLSlider();
    }
    private function setLSlider():void
    {
        lValue.text = String(Model.length);
        lSlider.value = Model.length;
        line.reset();
    }
    private function hValueListener(event:Event):void
    {
        var members:Number = Number(hValue.text);
        if (!isNaN(members)) {
            if (members < Model.MEMBERS_MINI) {
                members = Model.MEMBERS_MINI;
            }
            Model.members = members;
            setHSlider();
        }
    }
    private function hSliderListener(event:Event):void
    {
        var members:uint = hSlider.value;
        Model.members = members;
        setHSlider();
    }
    private function setHSlider():void
    {
        hSlider.value = Model.members;
        hValue.text = String(Model.members);
        line.reset();
    }
}

import flash.display.Graphics;
import flash.display.Sprite;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.geom.Point;

/**
 * ...
 * @author jaiko
 */
class Line extends Sprite
{
    private var pointList:Array = [];
    private var members:uint;
    private var length:Number;
    private var gravity:Number;
    private var friction:Number;
    private var dragPoint:Sprite;
    //

    public function Line()
    {
        if (stage) init();
        else addEventListener(Event.ADDED_TO_STAGE, init);
    }

    private function init(event:Event = null):void
    {
        removeEventListener(Event.ADDED_TO_STAGE, init);
        // entry point
        dragPoint = new Sprite();
        addChild(dragPoint);
        var g:Graphics = dragPoint.graphics;
        g.beginFill(0xFF0000);
        g.drawCircle(0, 0, 10);
        dragPoint.x = stage.stageWidth * 0.5;
        dragPoint.y = stage.stageHeight * 0.5;
        dragPoint.buttonMode = true;
        dragPoint.addEventListener(MouseEvent.MOUSE_DOWN, mouseDownListener);
    }

    private function mouseDownListener(event:MouseEvent):void
    {
        dragPoint.startDrag();
        stage.addEventListener(MouseEvent.MOUSE_UP, mouseUpListener);
    }

    private function mouseUpListener(event:MouseEvent):void
    {
        dragPoint.stopDrag();
        stage.removeEventListener(MouseEvent.MOUSE_UP, mouseUpListener);
    }
    public function start():void
    {

        var i:uint;
        var n:uint;
        //
        var point:Ball;
        var g:Graphics;
        var theta:Number;
        //
        theta = -45 * Math.PI / 180;
        //
        pointList[0] = dragPoint;
        members = Model.members;
        length = Model.length;
        //
        n = members;
        for (i = 0; i < n; i++) {
            point = new Ball(i);
            addChild(point);
            point.x = pointList[i].x + length * Math.cos(theta);
            point.y = pointList[i].y + length * Math.sin(theta);
            pointList.push(point);
        }
        addEventListener(Event.ENTER_FRAME, enterFrameListener,false,0,false);
    }
    public function reset():void
    {
        var i:uint;
        var n:uint;
        var point:Ball;
        //
        removeEventListener(Event.ENTER_FRAME, enterFrameListener);
        n = pointList.length;
        for (i = 1; i < n; i++)
        {
            point = pointList[i];
            removeChild(point);
        }
        //
        pointList = [];
        removeEventListener(Event.ENTER_FRAME, enterFrameListener);
        start();
    }
    public function isVisiblePoint(boolean:Boolean):void
    {
        var i:uint;
        var n:uint;
        var point:Ball;
        n = pointList.length;
        for (i = 1; i < n; i++) {
            point = pointList[i];
            point.isVisiblePoint(boolean);
        }
    }
    public function isVisibleNumber(boolean:Boolean):void
    {
        var i:uint;
        var n:uint;
        var point:Ball;

        n = pointList.length;
        for (i = 1; i < n; i++) {
            point = pointList[i];
            point.isVisibleNumber(boolean);
        }
    }
    public function setShock():void
    {
        var point:Ball = pointList[pointList.length - 1];
        point.vTheta += 0.1;
    }
    private function enterFrameListener(event:Event):void
    {
        gravity = Model.gravity;
        friction = Model.friction;
        //
        var i:uint;
        var j:uint;
        var n:uint;
        var aTheta:Number
        var g:Graphics;
        var theta:Number;
        var point:Ball;
        var pre_point:Sprite;
        var next_point:Ball;
        var next_theta:Number;
        var vTheta:Number;
        var gl:Number = gravity / length;
        //
        g = this.graphics;
        g.clear();
        g.lineStyle(1, 0);
        g.moveTo(dragPoint.x, dragPoint.y);
        //
        n = pointList.length;
        for (i = 1; i < n; i++) {
            pre_point = pointList[i-1];
            point = pointList[i];
            if (point.isDrag) {
                //ドラック中のポイントについて
                theta = Math.atan2(stage.mouseY -pre_point.y , stage.mouseX -pre_point.x);
                point.x = pre_point.x + length * Math.cos(theta);
                point.y = pre_point.y + length * Math.sin(theta);
                point.vTheta = 0;

            }else {
                //ドラックしていないポイントについて
                theta = Math.atan2(point.y -pre_point.y , point.x -pre_point.x) - 0.5 * Math.PI;
                //親との単振動
                aTheta = -1* gl * Math.sin(theta);
                point.vTheta += aTheta - friction * point.vTheta;
                if (i < n - 1) {
                    //子供からの引っ張り
                    next_point = pointList[i + 1];
                    next_theta = Math.atan2(next_point.y - point.y , next_point.x - point.x)-0.5*Math.PI;
                    aTheta = gl * Math.sin(next_theta - theta);
                    point.vTheta += aTheta - friction * point.vTheta;
                }
                theta += point.vTheta;
                theta += 0.5 * Math.PI;
                point.x = pre_point.x + length * Math.cos(theta);
                point.y = pre_point.y + length * Math.sin(theta);
            }
            //
            g.lineTo(point.x, point.y);
        }
    }
}

import flash.display.Bitmap;
import flash.display.BitmapData;
import flash.display.Graphics;
import flash.display.Sprite;
import flash.events.MouseEvent;
import flash.text.TextField;

/**
 * ...
 * @author jaiko
 */
class Ball extends Sprite
{
    private var _isDrag:Boolean = false;
    private var _vTheta:Number = 0;
    private var bm:Bitmap;
    private var tf:TextField;
    private var point:Sprite;
    public function Ball(value:uint)
    {
        var g:Graphics;
        point = new Sprite();
        addChild(point);
        point.visible  =  Model.isVisiblePoint;
        g = point.graphics;
        g.beginFill(0x0);
        g.drawCircle(0, 0, 5);
        //
        tf = new TextField();
        tf.text = String(value);
        tf.selectable = false;
        addChild(tf);
        tf.visible = Model.isVisibleNumber;
        //
        this.buttonMode = true;
        this.addEventListener(MouseEvent.MOUSE_DOWN, mouseDownListener);
    }

    private function mouseDownListener(event:MouseEvent):void
    {
        _isDrag = true;
        stage.addEventListener(MouseEvent.MOUSE_UP, mouseUpListener);
    }

    private function mouseUpListener(event:MouseEvent):void
    {
        _isDrag = false;
        stage.removeEventListener(MouseEvent.MOUSE_UP, mouseUpListener);
    }
    public function isVisibleNumber(boolean:Boolean):void
    {
        tf.visible = boolean;
    }
    public function isVisiblePoint(boolean:Boolean):void
    {
        point.visible = boolean;
    }

    public function get vTheta():Number
    {
        return _vTheta;
    }

    public function set vTheta(value:Number):void
    {
        _vTheta = value;
    }

    public function get isDrag():Boolean
    {
        return _isDrag;
    }
}

/**
 * ...
 * @author jaiko
 */
class Model
{
    private static var _members:uint = 70;
    private static var _length:Number = 30;
    private static var _gravity:Number = 0.6;
    private static var _friction:Number = 0.005;
    //
    private static var _isVisibleNumber:Boolean = false;
    private static var _isVisiblePoint:Boolean = true;
    //
    private static const _MEMBERS_MINI:uint = 2;
    private static const _MEMBERS_MAX:uint = 3000;
    private static const _LENGTH_MINI:uint = 3;
    private static const _LENGTH_MAX:uint = 150;
    private static const _GRAVITY_MINI:Number = 0;
    private static const _GRAVITY_MAX:Number = 3;
    private static const _FRICTION_MINI:Number = 0;
    private static const _FRICTION_MAX:Number = 0.1;

    public static var _instance:Model;
    public function Model(singletonBlock:SingletonBlock)
    {

    }
    public static function getInstance():Model
    {
        if (_instance == null)
        {
            _instance = new Model(new SingletonBlock());
        }
        return _instance
    }

    static public function get members():uint
    {
        return _members;
    }

    static public function set members(value:uint):void
    {
        _members = value;
    }

    static public function get length():Number
    {
        return _length;
    }

    static public function set length(value:Number):void
    {
        _length = value;
    }

    static public function get gravity():Number
    {
        return _gravity;
    }

    static public function set gravity(value:Number):void
    {
        _gravity = value;
    }

    static public function get friction():Number
    {
        return _friction;
    }

    static public function set friction(value:Number):void
    {
        _friction = value;
    }

    static public function get MEMBERS_MINI():uint
    {
        return _MEMBERS_MINI;
    }

    static public function get MEMBERS_MAX():uint
    {
        return _MEMBERS_MAX;
    }

    static public function get LENGTH_MINI():uint
    {
        return _LENGTH_MINI;
    }

    static public function get LENGTH_MAX():uint
    {
        return _LENGTH_MAX;
    }

    static public function get GRAVITY_MINI():Number
    {
        return _GRAVITY_MINI;
    }

    static public function get GRAVITY_MAX():Number
    {
        return _GRAVITY_MAX;
    }

    static public function get FRICTION_MINI():Number
    {
        return _FRICTION_MINI;
    }

    static public function get FRICTION_MAX():Number
    {
        return _FRICTION_MAX;
    }

    static public function get isVisibleNumber():Boolean
    {
        return _isVisibleNumber;
    }

    static public function set isVisiblePoint(value:Boolean):void
    {
        _isVisiblePoint = value;
    }

    static public function set isVisibleNumber(value:Boolean):void
    {
        _isVisibleNumber = value;
    }

    static public function get isVisiblePoint():Boolean
    {
        return _isVisiblePoint;
    }
}



class SingletonBlock {

}