import React, { Component } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import PropTypes from "prop-types";

const styles = StyleSheet.create({
    // 数字水平浮动排列
    row: {
        flexDirection: "row",
        overflow: "hidden",
    },

    // 隐藏
    hide: {
        position: "absolute",
        left: 0,
        right: 0,
        opacity: 0,
    },
});

// 指定范围创建数组
const range = length => Array.from({ length }, (x, i) => i);


/**
 * getPosition这个方法是用来计算目标数字的y轴坐标值，
 * 根据当前数字在数组中的下标乘以测量出的数字文本绘制高度取负值，得出坐标值。
 * @param {*} param0 
 */
const getPosition = ({ text, items, height }) => {
    // 获得文本在数组的下标
    // const index = items.findIndex(p => p === text);
    return parseInt(text) * height * -1;
};

// 切割
const splitText = (text = "") => (text + "").split("");

// 是十进制数字判断
const isNumber = (text = "") => !isNaN(parseInt(text, 10));
const isString = (text = "") => typeof text === "string";

// 创建"0","1","2","3","4"..."9"的数组,默认绘制数据
const numberRange = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const getAnimationStyle = animation => {
    return {
        transform: [
            {
                translateY: animation,
            },
        ],
    };
};

/**
 *
 * @param children 子组件(文本内容)
 * @param style 样式
 * @param height 高度
 * @param textStyle 文本样式
 * @returns 无动画绘制文本
 * @constructor
 */
const Piece = ({ children, style, height, textStyle }) => {
    return (
        <View style={style}>
            <Text style={[textStyle, { height }]}>{children}</Text>
        </View>
    );
};


class Ticker extends Component {

    // 定义属性类型
    static propTypes = {
        text: PropTypes.string,
        textStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
    };

    static defaultProps = {
        // 默认滚动时间
        rotateTime: 3000,
    };

    state = {
        // 是否已测量
        measured: false,
        // 高度
        height: 0,
        // 获取props中的字体大小
        fontSize: this.props.textStyle.fontSize,
    };

    // props变动时回调
    componentWillReceiveProps(nextProps) {
        this.setState({
            fontSize: this.props.textStyle.fontSize,
        });
    }


    handleMeasure = e => {

        //测量高度
        const height = e.nativeEvent.layout.height;
        this.setState(state => {
            if (state.measured) {
                return null;
            }
            return {
                measured: true,
                height,
            };
        });
    };

    render() {

        // 获取文本内容,子组件,样式,滚动时长
        const { text, children, textStyle, style, rotateTime } = this.props;

        // 获取高度, 是否测量标记
        const { height, measured } = this.state;

        // 如果未测量则透明
        const opacity = measured ? 1 : 0;

        // 文本内容获取,读取text或子组件内容,两种方式配置文本内容
        const childs = text || children;

        // 如果子组件是字符串,字符串渲染,否则子组件渲染
        const renderer = isString(childs) ? stringNumberRenderer : generalChildRenderer;

        //绘制了一个隐藏的text组件，是为了测量在当前样式下，绘制出的数字高度值
        return (
            <View style={[styles.row, { height, opacity }, style]}>
                {renderer({
                    children: childs,
                    textStyle,
                    height,
                    rotateTime,
                    rotateItems: numberRange,
                })}

                {/*测量text高度,不显示该组件*/}
                <Text style={[textStyle, styles.hide]} onLayout={this.handleMeasure} pointerEvents="none">
                    0
                </Text>
            </View>
        );
    }
}

const generalChildRenderer = ({ children, textStyle, height, rotateTime, rotateItems = [] }) => {
    return React.Children.map(children, (child, i) => {
        if (isString(child)) {
            return (
                <Piece style={{ height }} height={height} textStyle={textStyle}>
                    {child}
                </Piece>
            );
        }

        const items = child.props.rotateItems || rotateItems;
        const key = items.join(",") + i;

        return React.cloneElement(child, {
            key,
            text: child.props.text || child.props.children,
            height,
            duration: child.props.rotateTime || rotateTime,
            textStyle,
            rotateItems: child.props.rotateItems || rotateItems,
        });
    });
};

//我们需要对当前的文本做切割得到包含文本中每个字符的字符数组，
//遍历切割后的字符数组，取出每一个字符，判断是否是数字，不是数字就直接绘制文本，
//Piece是封装的直接用text进行文本绘制的组件，如果是数字就绘制数字动画组件，
//Tick是封装的单个数字动画绘制的组件。
const stringNumberRenderer = ({ children, textStyle, height, rotateTime, rotateItems }) => {

    // 切割子组件文本内容遍历
    return splitText(children).map((piece, i) => {

        //取单个字符，如果不是数字,直接绘制文本
        if (!isNumber(piece))
            return (
                <Piece key={i} style={{ height }} textStyle={textStyle}>
                    {piece}
                </Piece>
            );

        // 如果是数字，绘制单个数字
        return (
            <Tick
                duration={rotateTime}
                key={i}
                text={piece}
                textStyle={textStyle}
                height={height}
                rotateItems={rotateItems}
            />
        );
    });
};

class Tick extends Component {


    /**
     * 创建动画初始值
     * @type {{animation: Animated.Value}}
     */
    state = {
        animation: new Animated.Value(
            getPosition({
                text: this.props.text,
                items: this.props.rotateItems,
                height: this.props.height,
            }),
        ),
    };
    componentDidMount() {
        // 如果高度已测量,设置动画初始值
        if (this.props.height !== 0) {
            let init = getPosition({
                text: this.props.text,
                items: this.props.rotateItems,
                height: this.props.height,
            });
            this.setState({
                animation: new Animated.Value(
                    init
                ),
            });
        }
    }
    componentWillReceiveProps(nextProps) {

        let pre = parseInt(this.props.text);
        let now = parseInt(nextProps.text);
        let init = getPosition({
            text: this.props.text,
            items: this.props.rotateItems,
            height: this.props.height,
        });

        this.setState({
            animation: new Animated.Value(
                init
            ),
        });
    }
    componentDidUpdate(prevProps) {
        const { height, duration, rotateItems, text } = this.props;
        if (height === 0) {
            return;
        }
        var preNum = parseInt(prevProps.text);
        var nowNum = parseInt(text);
        var endValue = 0;
        if (preNum < nowNum) {
            endValue = getPosition({
                text: text,
                items: rotateItems,
                height,
            });
        } else {
            endValue = getPosition({
                text: "" + (parseInt(this.props.text) + 10),
                items: rotateItems,
                height,
            });
        }


        // 数字变化,用当前动画值和变化后的动画值进行插值,并启动动画
        // if (prevProps.text !== text) {
        Animated.timing(this.state.animation, {
            toValue: endValue,
            duration,
            useNativeDriver: true,
        }).start();
        // }
    }

    render() {
        const { animation } = this.state;
        const { textStyle, height, rotateItems } = this.props;
        return (
            <View style={{ height }}>
                <Animated.View style={getAnimationStyle(animation)}>
                    {/*遍历数字范围数组绘制数字*/}
                    {rotateItems.map(v => (
                        <Text key={v} style={[textStyle, { height }]}>
                            {v}
                        </Text>

                    ))}
                </Animated.View>
            </View>
        );
    }
}

export { Tick, numberRange };
export default Ticker;